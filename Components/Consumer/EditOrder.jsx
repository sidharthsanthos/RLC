import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';

const EditOrder = ({route, navigation}) => {
    const {itemID}=route.params;
    const [allocation, setAllocation]=useState(null);
    const [stockItem, setStockItem] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [consumer, setConsumer] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState('');
    const [bags, setBags] = useState('');
    const [rate, setRate] = useState('');
    const [amount, setAmount] = useState(0);

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            
            // Fetch allocation
            const { data: allocData, error: allocError } = await supabase
                .from('Stock_Allocations')
                .select('*')
                .eq('Transaction_ID', itemID)
                .single();

            if (allocError) throw allocError;
            setAllocation(allocData);

            // Fetch related stock item
            const { data: stockData, error: stockError } = await supabase
                .from('Stock')
                .select('*')
                .eq('id', allocData.Stock_ID)
                .single();

            if (stockError) throw stockError;
            setStockItem(stockData);

            // Fetch transaction
            const { data: txData, error: txError } = await supabase
                .from('Transactions')
                .select('*')
                .eq('id', allocData.Transaction_ID)
                .single();

            if (txError) throw txError;
            setTransaction(txData);

            // Fetch consumer
            const { data: consumerData, error: consumerError } = await supabase
                .from('Consumers')
                .select('*')
                .eq('id', txData.ref_id)
                .single();

            if (consumerError) throw consumerError;
            setConsumer(consumerData);

            // Set form values
            setQuantity(String(allocData.Quantity_Allocated));
            setBags(String(allocData.Bags_Allocated));
            setRate(String(allocData.Amount / allocData.Quantity_Allocated));
            setAmount(allocData.Amount);

        } catch (err) {
            console.error('Error fetching order data:', err);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderData();
    }, []);

    useEffect(() => {
        const q = Number(quantity) || 0;
        const r = Number(rate) || 0;
        setAmount(q * r);
    }, [quantity, rate]);

    const updateOrder = async () => {
        if (!allocation || !stockItem || !transaction || !consumer) {
            Alert.alert('Error', 'Missing required data');
            return;
        }

        const newQuantity = Number(quantity) || 0;
        const newBags = Number(bags) || 0;
        const newRate = Number(rate) || 0;
        const newAmount = newQuantity * newRate;

        if (newQuantity <= 0) {
            Alert.alert('Error', 'Quantity must be greater than 0');
            return;
        }

        const oldQuantity = allocation.Quantity_Allocated;
        const oldBags = allocation.Bags_Allocated;
        const oldAmount = allocation.Amount;

        // Calculate differences
        const quantityDiff = newQuantity - oldQuantity;
        const bagsDiff = newBags - oldBags;
        const amountDiff = newAmount - oldAmount;

        // Check if new quantity exceeds available stock
        const availableStock = stockItem.Remaining_Quantity + oldQuantity;
        if (newQuantity > availableStock) {
            Alert.alert('Error', `Only ${availableStock} units available`);
            return;
        }

        try {
            // 1. Update Stock_Allocations
            const { error: allocError } = await supabase
                .from('Stock_Allocations')
                .update({
                    Quantity_Allocated: newQuantity,
                    Bags_Allocated: newBags,
                    Amount: newAmount
                })
                .eq('Transaction_ID', itemID);

            if (allocError) throw allocError;

            // 2. Update Stock remaining quantities
            const newRemainingQty = stockItem.Remaining_Quantity - quantityDiff;
            const newRemainingBags = stockItem.Remaining_Bags - bagsDiff;

            const { error: stockError } = await supabase
                .from('Stock')
                .update({
                    Remaining_Quantity: newRemainingQty,
                    Remaining_Bags: newRemainingBags
                })
                .eq('id', stockItem.id);

            if (stockError) throw stockError;

            // 3. Update Transaction amount
            const newTransactionAmount = transaction.amount + amountDiff;
            const { error: txError } = await supabase
                .from('Transactions')
                .update({
                    amount: newTransactionAmount
                })
                .eq('id', transaction.id);

            if (txError) throw txError;

            // 4. Update Consumer pending amount
            const newPendingAmount = consumer.Pending_Amount + amountDiff;
            const { error: consumerError } = await supabase
                .from('Consumers')
                .update({
                    Pending_Amount: newPendingAmount
                })
                .eq('id', consumer.id);

            if (consumerError) throw consumerError;

            Alert.alert('Success', 'Order updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (err) {
            console.error('Update error:', err);
            Alert.alert('Error', err.message || 'Failed to update order');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#07c3f7" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!allocation || !stockItem) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Failed to load order data</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="create-outline" size={28} color="#07c3f7" />
                <Text style={styles.headerText}>Edit Order</Text>
            </View>

            {/* Order Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Order ID: {itemID}</Text>
                <Text style={styles.infoLabel}>Stock ID: {stockItem.id}</Text>
                <Text style={styles.infoLabel}>
                    Available Stock: {stockItem.Remaining_Quantity + allocation.Quantity_Allocated} units
                </Text>
                <Text style={styles.infoLabel}>Quality: {stockItem.Quality}</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Quantity'
                    keyboardType='numeric'
                    value={quantity}
                    onChangeText={setQuantity}
                />
                <Text style={styles.hint}>
                    Max: {stockItem.Remaining_Quantity + allocation.Quantity_Allocated}
                </Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.label}>Bags</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Bags'
                    keyboardType='numeric'
                    value={bags}
                    onChangeText={setBags}
                />
            </View>

            <View style={styles.formSection}>
                <Text style={styles.label}>Rate per Unit (₹)</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Rate'
                    keyboardType='numeric'
                    value={rate}
                    onChangeText={setRate}
                />
                <Text style={styles.hint}>Original Rate: ₹{stockItem.Net_Amount}</Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.label}>Total Amount</Text>
                <View style={styles.amountDisplay}>
                    <Text style={styles.amountText}>₹{amount.toLocaleString()}</Text>
                </View>
                <Text style={styles.hint}>
                    Previous: ₹{allocation.Amount.toLocaleString()} 
                    {amount !== allocation.Amount && (
                        <Text style={amount > allocation.Amount ? styles.increase : styles.decrease}>
                            {' '}({amount > allocation.Amount ? '+' : ''}
                            ₹{(amount - allocation.Amount).toLocaleString()})
                        </Text>
                    )}
                </Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={updateOrder}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.btnText}>Update Order</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

export default EditOrder

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        backgroundColor: '#f9f9f9'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666'
    },
    errorText: {
        fontSize: 16,
        color: '#FF6B6B'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#07c3f7',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6
    },
    formSection: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 14,
        borderRadius: 8,
        fontSize: 16
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4
    },
    increase: {
        color: '#FF6B6B',
        fontWeight: '600'
    },
    decrease: {
        color: '#51CF66',
        fontWeight: '600'
    },
    amountDisplay: {
        backgroundColor: '#f0f9ff',
        borderWidth: 2,
        borderColor: '#07c3f7',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center'
    },
    amountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#07c3f7'
    },
    btn: {
        backgroundColor: '#07c3f7',
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#07c3f7',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    btnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center'
    },
    cancelBtnText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16
    }
})

