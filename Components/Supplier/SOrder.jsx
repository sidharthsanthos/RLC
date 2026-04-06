import {
    Platform, StatusBar, StyleSheet, Text, TextInput,
    TouchableOpacity, View, ScrollView, KeyboardAvoidingView
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';

const SOrder = () => {

    const route = useRoute();
    const navigation = useNavigation();

    // supplier may or may not be passed
    const routeSupplier = route.params?.supplier ?? null;

    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(routeSupplier);

    const [orderData, setOrderData] = useState({
        quantity: 0,
        quality: '',
        netAmount: 0,
        totalAmount: 0,
        totalBags: 0,
        notes: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [oDate, setODate] = useState(new Date());
    const [alert, setAlert] = useState({ type: '', message: '' });

    const qualitySet = ['Good', 'Average', 'Bad'];

    // Only fetch supplier list when no supplier was passed via route
    useEffect(() => {
        if (!routeSupplier) {
            fetchSuppliers();
        }
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data, error } = await supabase.from('Suppliers').select('*');
            if (error) {
                setAlert({ type: 'error', message: error.message });
                setTimeout(() => setAlert({ type: '', message: '' }), 3000);
                return;
            }
            setSuppliers(data);
        } catch (err) {
            console.error('Unexpected Error', err);
        }
    };

    const handleInput = (field, value) => {
        let updated = { ...orderData };

        if (selectedSupplier?.Supply_Type === 1) {
            if (field === 'quantity') {
                updated.quantity = value;
                updated.totalBags = value;
            } else if (field === 'totalBags') {
                updated.totalBags = value;
                updated.quantity = value;
            } else {
                updated[field] = value;
            }
        } else {
            updated[field] = value;
        }

        const qty = Number(updated.quantity);
        const net = Number(updated.netAmount);
        updated.totalAmount = qty * net;

        setOrderData(updated);
    };

    const saveOrder = async () => {
        const orderDate = oDate.toISOString().split('T')[0];

        if (!selectedSupplier) {
            setAlert({ type: 'error', message: 'Select a supplier first' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return;
        }

        if (orderData.quality === '') {
            setAlert({ type: 'error', message: 'Please select Quality' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return;
        }

        if (orderData.quantity === 0) {
            setAlert({ type: 'error', message: 'Please provide quantity' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return;
        }

        if (orderData.totalBags === 0) {
            setAlert({ type: 'error', message: 'Please Provide No of Bags' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return;
        }

        if (orderData.netAmount === 0) {
            setAlert({ type: 'error', message: 'Please Provide Net Amount' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
            return;
        }

        try {
            const totalWeight = Number(selectedSupplier?.Bag_Weight) * Number(orderData.totalBags);

            const { error: insertError } = await supabase.from('Stock').insert([
                {
                    Supplier_ID: selectedSupplier?.id,
                    Date: orderDate,
                    Stock_Type: 'in-stock',
                    Quality: orderData.quality,
                    Unit_Type: selectedSupplier?.Supply_Type,
                    Net_Quantity: orderData.quantity,
                    Total_Bags: orderData.totalBags,
                    Net_Amount: orderData.netAmount,
                    Total_Amount: orderData.totalAmount,
                    Notes: orderData.notes,
                    Remaining_Bags: orderData.totalBags,
                    Total_Weight: totalWeight,
                    Remaining_Quantity: totalWeight
                }
            ]);

            if (insertError) {
                console.error('Insert Error', insertError.message);
                setAlert({ type: 'error', message: insertError.message });
                setTimeout(() => setAlert({ type: '', message: '' }), 3000);
                return;
            }

            const newPending = Number(selectedSupplier?.Pending_Amount) + Number(orderData.totalAmount);

            const { error: updateError } = await supabase
                .from('Suppliers')
                .update({ Pending_Amount: newPending })
                .eq('id', selectedSupplier?.id);

            if (updateError) {
                setAlert({ type: 'error', message: updateError.message });
                setTimeout(() => setAlert({ type: '', message: '' }), 3000);
                return;
            }

            setAlert({ type: 'success', message: 'Order Added Successfully' });
            setTimeout(() => {
                setAlert({ type: '', message: '' });
                setOrderData({ quantity: 0, quality: '', netAmount: 0, totalAmount: 0, totalBags: 0, notes: '' });
                if (routeSupplier) {
                    navigation.navigate('SupplierDetails', { supplierID: selectedSupplier?.id });
                } else {
                    setSelectedSupplier(null);
                }
            }, 3000);

        } catch (err) {
            console.error('Unexpected Error', err);
            setAlert({ type: 'error', message: 'An unexpected error occurred' });
            setTimeout(() => setAlert({ type: '', message: '' }), 3000);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {alert.message !== '' && (
                    <MessageBox type={alert.type} message={alert.message} />
                )}

                <Text style={styles.heading}>Add Order</Text>

                {/* SUPPLIER SECTION */}
                {!routeSupplier ? (
                    // No supplier passed → show full picker
                    <>
                        <Text style={styles.label}>Select Supplier</Text>
                        <View style={styles.dropdownContainer}>
                            <Picker
                                selectedValue={selectedSupplier?.id || ''}
                                onValueChange={(value) => {
                                    const s = suppliers.find(s => s.id == value);
                                    setSelectedSupplier(s || null);
                                }}
                            >
                                <Picker.Item label="Select Supplier" value="" />
                                {suppliers.map((s) => (
                                    <Picker.Item key={s.id} label={s.Name} value={s.id} />
                                ))}
                            </Picker>
                        </View>
                    </>
                ) : (
                    // Supplier passed via route → show info card
                    <View style={styles.supplierCard}>
                        <Text style={styles.supplierName}>{selectedSupplier?.Name}</Text>
                        <Text style={styles.supplierDetail}>Contact: {selectedSupplier?.Contact}</Text>
                        <Text style={styles.supplierDetail}>Pending: ₹{selectedSupplier?.Pending_Amount}</Text>
                        <Text style={styles.supplierDetail}>
                            Type: {selectedSupplier?.Supply_Type === 1 ? 'Sack-Wise' : 'Kg-Wise'}
                        </Text>
                    </View>
                )}

                {/* Show selected supplier info when chosen from picker */}
                {!routeSupplier && selectedSupplier && (
                    <View style={styles.supplierCard}>
                        <Text style={styles.supplierName}>{selectedSupplier.Name}</Text>
                        <Text style={styles.supplierDetail}>Contact: {selectedSupplier.Contact}</Text>
                        <Text style={styles.supplierDetail}>Pending: ₹{selectedSupplier.Pending_Amount}</Text>
                        <Text style={styles.supplierDetail}>
                            Type: {selectedSupplier.Supply_Type === 1 ? 'Sack-Wise' : 'Kg-Wise'}
                        </Text>
                    </View>
                )}

                {/* ORDER DATE */}
                <Text style={styles.label}>Order Date</Text>
                <TouchableOpacity
                    style={[styles.input, { justifyContent: 'center' }]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <Text style={{ fontSize: 16, color: '#333' }}>
                        {oDate ? oDate.toDateString() : 'Select Order Date'}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={oDate}
                        mode='date'
                        display='calendar'
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setODate(selectedDate);
                        }}
                    />
                )}

                {/* QUALITY */}
                <Text style={styles.label}>Quality</Text>
                <View style={styles.dropdownContainer}>
                    <Picker
                        selectedValue={orderData.quality}
                        onValueChange={(v) => handleInput('quality', v)}
                    >
                        <Picker.Item label='Select Quality' value='' />
                        {qualitySet.map((q) => (
                            <Picker.Item key={q} label={q} value={q} />
                        ))}
                    </Picker>
                </View>

                {/* QUANTITY */}
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Quantity'
                    keyboardType='numeric'
                    value={String(orderData.quantity)}
                    onChangeText={(v) => handleInput('quantity', v)}
                />

                {/* TOTAL BAGS */}
                <Text style={styles.label}>Total Bags</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Total Bags'
                    keyboardType='numeric'
                    value={String(orderData.totalBags)}
                    onChangeText={(v) => handleInput('totalBags', v)}
                />

                {/* NET AMOUNT */}
                <Text style={styles.label}>Net Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Net Amount'
                    keyboardType='numeric'
                    value={String(orderData.netAmount)}
                    onChangeText={(v) => handleInput('netAmount', v)}
                />

                {/* TOTAL AMOUNT (read-only) */}
                <Text style={styles.label}>Total Amount</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: '#eee' }]}
                    placeholder='Total Amount'
                    value={orderData.totalAmount.toString()}
                    editable={false}
                />

                {/* NOTES */}
                <Text style={styles.label}>Additional Notes</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Additional Notes'
                    value={orderData.notes}
                    onChangeText={(v) => handleInput('notes', v)}
                />

                {/* SUBMIT */}
                <TouchableOpacity style={styles.btn} onPress={saveOrder}>
                    <Text style={styles.btnText}>Save Order</Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SOrder;

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 + 50,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        marginBottom: 12,
    },
    supplierCard: {
        backgroundColor: '#F0F4FF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
        marginTop: 8,
    },
    supplierName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    supplierDetail: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
    },
    btn: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
    },
});