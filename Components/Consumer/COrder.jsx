import { StyleSheet, StatusBar, Text, View, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../../utils/supabase';
import StockRow from './StockRow';

const AddOrderNew = () => {

    const route = useRoute();
    const navigation = useNavigation();

    // consumer may be pre-passed from ConsumerDetails
    const routeConsumer = route.params?.consumer ?? null;

    const [consumers, setConsumers] = useState([]);
    const [stockList, setStockList] = useState([]);

    const [selectedConsumer, setSelectedConsumer] = useState(routeConsumer);
    const [allocations, setAllocations] = useState([
        { stockId: null, quantity: '' }
    ]);

    const [rate, setRate] = useState('');
    const [todayRate, setTodayRate] = useState(0);

    useEffect(() => {
        if (!routeConsumer) fetchConsumers();
        fetchStock();
        fetchTodayRate();
    }, []);

    const fetchConsumers = async () => {
        const { data } = await supabase.from('Consumers').select('*');
        setConsumers(data || []);
    };

    const fetchStock = async () => {
        const todayDate = new Date();
        const today = todayDate.toISOString().split('T')[0];

        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        const { data } = await supabase
            .from('Stock')
            .select('*, Suppliers(Name)')
            .gt('Remaining_Quantity', 0)
            .in('Date', [today, yesterday])
            .order('Date', { ascending: false });

        setStockList(data || []);
    };

    const fetchTodayRate = async () => {
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('Day_Details')
            .select('*')
            .eq('date', today)
            .single();

        if (data) {
            setTodayRate(data.rate);
            setRate(String(data.rate));
        }
    };

    // Update allocation
    const updateAllocation = (index, field, value) => {
        const updated = [...allocations];
        updated[index][field] = value;
        setAllocations(updated);
    };

    // Add new row
    const addRow = () => {
        setAllocations([...allocations, { stockId: null, quantity: '' }]);
    };

    // Delete row
    const deleteRow = (index) => {
        const updated = allocations.filter((_, i) => i !== index);
        setAllocations(updated);
    };

    // Prevent duplicate stock selection
    const getAvailableStock = (currentIndex) => {
        const selectedIds = allocations
            .map((a, i) => i !== currentIndex && a.stockId)
            .filter(Boolean);

        return stockList.filter(s => !selectedIds.includes(s.id));
    };

    // Total calculation
    const totalQty = allocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
    const totalAmount = totalQty * Number(rate || 0);

    const handleSubmit = async () => {

        try {
            // 🔴 1. VALIDATIONS
            if (!selectedConsumer) {
                alert("Select a consumer");
                return;
            }

            if (!rate || Number(rate) <= 0) {
                alert("Enter valid rate");
                return;
            }

            const validAllocations = allocations.filter(
                a => a.stockId && Number(a.quantity) > 0
            );

            if (validAllocations.length === 0) {
                alert("Add at least one valid stock entry");
                return;
            }

            // 🔴 2. TOTAL CALCULATION
            const totalQty = validAllocations.reduce(
                (sum, a) => sum + Number(a.quantity),
                0
            );

            const totalAmount = totalQty * Number(rate);

            const today = new Date().toISOString().split("T")[0];

            // 🔴 3. INSERT TRANSACTION
            const { data: transactionData, error: transactionError } = await supabase
                .from('Transactions')
                .insert({
                    ref_type: 'consumer',
                    ref_id: selectedConsumer.id,
                    amount: totalAmount,
                    transaction_type: 'debit',
                    mode: null,
                    date: today,
                    net_rate: Number(rate),
                    remarks: `Order: ${totalQty}kg @ ₹${rate}`
                })
                .select()
                .single();

            if (transactionError) throw transactionError;

            // 🔴 4. PROCESS EACH ALLOCATION
            for (const alloc of validAllocations) {

                // Fetch latest stock (to avoid stale UI data)
                const { data: stockData, error: stockError } = await supabase
                    .from('Stock')
                    .select('*')
                    .eq('id', alloc.stockId)
                    .single();

                if (stockError) throw stockError;

                if (Number(alloc.quantity) > stockData.Remaining_Quantity) {
                    throw new Error(`Insufficient stock`);
                }

                const usedQty = Number(alloc.quantity);

                // Insert allocation
                const { error: allocError } = await supabase
                    .from('Stock_Allocations')
                    .insert({
                        Transaction_ID: transactionData.id,
                        Stock_ID: alloc.stockId,
                        Quantity_Allocated: usedQty,
                        Bags_Allocated: null, // optional
                        Amount: usedQty * Number(rate)
                    });

                if (allocError) throw allocError;

                // Update stock
                const { error: updateStockError } = await supabase
                    .from('Stock')
                    .update({
                        Remaining_Quantity: stockData.Remaining_Quantity - usedQty
                    })
                    .eq('id', alloc.stockId);

                if (updateStockError) throw updateStockError;
            }

            // 🔴 5. UPDATE CONSUMER PENDING
            const newPending =
                Number(selectedConsumer.Pending_Amount) + totalAmount;

            const { error: consumerError } = await supabase
                .from('Consumers')
                .update({ Pending_Amount: newPending })
                .eq('id', selectedConsumer.id);

            if (consumerError) throw consumerError;

            // ✅ SUCCESS
            alert("Order placed successfully");

            // Reset form
            setAllocations([{ stockId: null, quantity: '' }]);
            setRate(String(todayRate));

            if (routeConsumer) {
                navigation.navigate('ConsumerDetails', { consumerID: routeConsumer.id });
            } else {
                setSelectedConsumer(null);
            }

        } catch (err) {
            console.error(err);
            alert(err.message || "Something went wrong");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
        >

            <Text style={styles.header}>Add Order</Text>

            {/* Consumer */}
            {!routeConsumer ? (
                <View style={styles.section}>
                    <Text style={styles.label}>Select Consumer</Text>
                    <View style={styles.dropdownContainer}>
                        <Picker
                            selectedValue={selectedConsumer?.id || null}
                            onValueChange={(val) =>
                                setSelectedConsumer(consumers.find(c => c.id === val))
                            }
                        >
                            <Picker.Item label="Select Consumer" value={null} />
                            {consumers.map(c => (
                                <Picker.Item key={c.id} label={c.Name} value={c.id} />
                            ))}
                        </Picker>
                    </View>
                </View>
            ) : (
                <View style={styles.consumerCard}>
                    <Text style={styles.consumerName}>{selectedConsumer?.Name}</Text>
                    <Text style={styles.consumerDetail}>Contact: {selectedConsumer?.Contact}</Text>
                    <Text style={styles.consumerDetail}>Pending: ₹{selectedConsumer?.Pending_Amount}</Text>
                </View>
            )}

            {/* Stock Rows */}
            {allocations.map((row, index) => (
                <StockRow
                    key={index}
                    stockList={getAvailableStock(index)}
                    selectedStockId={row.stockId}
                    quantity={row.quantity}
                    onStockChange={(val) => updateAllocation(index, 'stockId', val)}
                    onQtyChange={(val) => updateAllocation(index, 'quantity', val)}
                    onDelete={() => deleteRow(index)}
                    showDelete={index !== 0}
                />
            ))}

            {/* Add More */}
            <TouchableOpacity style={styles.addBtn} onPress={addRow}>
                <Text style={styles.addText}>+ Add More</Text>
            </TouchableOpacity>

            {/* Rate */}
            <View style={styles.section}>
                <Text>Rate (₹/kg)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={rate}
                    onChangeText={setRate}
                />
            </View>

            {/* Total */}
            <View style={styles.summary}>
                <Text>Total Quantity: {totalQty} kg</Text>
                <Text>Total Amount: ₹{totalAmount}</Text>
            </View>

            {/* Submit (we’ll wire next) */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit Order</Text>
            </TouchableOpacity>

        </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default AddOrderNew

const styles = StyleSheet.create({
    container: {
        padding: 10, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 + 50,
    },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    section: { marginBottom: 15 },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        marginTop: 5
    },
    addBtn: {
        alignItems: 'center',
        marginVertical: 10
    },
    addText: {
        color: '#07c3f7',
        fontWeight: 'bold'
    },
    summary: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10
    },
    submitBtn: {
        backgroundColor: '#07c3f7',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
        color: '#333',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        marginTop: 4,
    },
    consumerCard: {
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        marginTop: 4,
    },
    consumerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    consumerDetail: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
    },
});