import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';


const SPayment = ({route}) => {
    const {supplierID}=route.params;

    const navigation=useNavigation();

    const [supplier,setSupplier]=useState(null);
    const [alert,setAlert]=useState({type:'',message:''});
    const [paymentData,setPaymentData]=useState({
        amount:'',
        type:'debit',
        mode:'',
        remarks:''
    });
    const [showdatepicker,setShowDatePicker]=useState(false);
    const [oDate,setODate]=useState(new Date());

    const transactionMode=[
        'UPI',
        'Cash',
        'Bank'
    ];


    const fetchSupplier=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Suppliers')
               .select('Name,By_Name,Pending_Amount')
               .eq('id',supplierID)

            if(error){
                setAlert({type:'error',message:error.message});
                setTimeout(()=>{
                    setAlert({type:'',message:''});
                    return;
                },5000);
            }
            
            setSupplier(data[0]);
        }catch(err){
            setAlert({type:'error',message:'Unexpected Error Occured'})
            setTimeout(()=>{
                setAlert({type:'',error:''})
                return;
            },5000);
        }
    }

    useEffect(()=>{
        fetchSupplier();
    },[]);

    const handleInput=(field,value)=>{
        let updated={...paymentData};
        updated[field]=value;
        setPaymentData(updated);
    }

    const savePayment=async ()=>{
        const paymentDate=oDate.toISOString().split('T')[0];

        const amt=Number(paymentData.amount);
        const mode=paymentData.mode;

        if(amt===0 || !paymentData.amount){            
            setAlert({type:'error',message:'Please Enter Amount'})
            setTimeout(()=>{
                setAlert({type:'',message:''});
                return;
            },5000);
            return;
        }

        if(mode===''){
            setAlert({type:'error',message:'Please Select Transaction Mode'})
            setTimeout(()=>{
                setAlert({type:'',message:''});
                return;
            },5000);
            return;
        }

        const newPending=Number(supplier?.Pending_Amount)-amt;

        if(newPending<0){
            setAlert({type:'error',message:'Payment exceeds pending amount'})
            setTimeout(()=>{
                setAlert({type:'',message:''});
                return;
            },5000);
            return;
        }

        // console.log(paymentData,paymentDate);

        try{
            const {error}=await supabase
                .from('Transactions')
                .insert({
                    ref_type:'supplier',
                    ref_id:supplierID,
                    amount:amt,
                    transaction_type:paymentData.type,
                    mode:paymentData.mode.toLowerCase(),
                    date:paymentDate,
                    remarks:paymentData.remarks
                });

                if(error){
                    setAlert({type:'error',message:error.message})
                    setTimeout(()=>{
                        setAlert({type:'',message:''});
                        return;
                    },5000);
                    return;
                }

                const {error:updateError}=await supabase
                    .from('Suppliers')
                    .update({Pending_Amount:newPending})
                    .eq('id',supplierID)

                if(updateError){
                    setAlert({type:'error',message:updateError.message})
                    setTimeout(()=>{
                        setAlert({type:'',message:''});
                        return;
                    },5000);
                    return;
                }

                setAlert({type:'success', message:'Payment Saved Successfully'})
                setTimeout(()=>{
                    setAlert({type:'',message:''})
                    fetchSupplier();
                    setPaymentData({
                        amount:'',
                        type:'debit',
                        mode:'',
                        remarks:''
                    });
                    return;
                },3000);
                
                console.log('Payment Logged Successfully');
        }catch(err){
            console.error('Unexpected Error Occured',err);
            setAlert({type:'error',message:err.message})
            setTimeout(()=>{
                setAlert({type:'',message:''})
                return;
            },3000);
        }
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Alert Message */}
                {alert.message !== '' && (
                <View style={styles.alertWrap}>
                    <MessageBox type={alert.type} message={alert.message}/>
                </View>
            )}

            <Text style={styles.heading}>Add Payment</Text>

            {/* Supplier Info Card */}
            <View style={styles.card}>
                <Text style={styles.supplierName}>{supplier?.Name || 'Loading...'}</Text>
                
                <Text style={styles.pendingText}>
                    Pending Amount:  
                    <Text style={styles.amountHighlight}> ₹{supplier?.Pending_Amount}</Text>
                </Text>
            </View>

            {supplier?.Pending_Amount > 0 ? (
                <View style={styles.card}>
                    {/* Date Picker */}
                    <Text style={styles.label}>Payment Date</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={()=>setShowDatePicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {oDate?oDate.toDateString():'Select Payment Date'}
                        </Text>
                    </TouchableOpacity>

                    {showdatepicker && (
                        <DateTimePicker
                            value={oDate}
                            mode='date'
                            display='calendar'
                            onChange={(event,selectedDate)=>{
                                setShowDatePicker(false);
                                if(selectedDate){
                                    setODate(selectedDate);
                                }
                            }}
                        />
                    )}

                    {/* Amount Input */}
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter amount"
                        keyboardType="numeric"
                        value={paymentData.amount}
                        onChangeText={(v) => handleInput("amount", v)}
                    />

                    {/* Mode Picker */}
                    <Text style={styles.label}>Transaction Mode</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                        selectedValue={paymentData.mode}
                        onValueChange={(v) => handleInput("mode", v)}
                        style={styles.picker}
                        >
                        <Picker.Item label="Select Mode" value="" />
                        {transactionMode.map((mode) => (
                            <Picker.Item
                            key={mode}
                            label={mode.toUpperCase()}
                            value={mode}
                            />
                        ))}
                        </Picker>
                    </View>

                    {/* Notes */}
                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Optional notes"
                        value={paymentData?.remarks}
                        onChangeText={(v) => handleInput("remarks", v)}
                        multiline
                    />

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveBtn} onPress={savePayment}>
                        <Text style={styles.btnText}>Save Payment</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.card}>
                    {supplier ? (
                        <Text style={styles.cleanText}>Books Clean! No Pending Amount.</Text>
                    ) : (
                        <Text style={styles.cleanText}>Loading supplier information...</Text>
                    )}
                </View>
            )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SPayment

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },

    scrollContent: {
        padding: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    },

    heading: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 15,
        color: "#333",
    },

    alertWrap: {
        marginBottom: 12,
    },

    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },

    supplierName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },

    byName: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },

    pendingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222",
    },

    amountHighlight: {
        color: "#d9534f",
        fontWeight: "700",
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        marginTop: 10,
        color: "#444",
    },

    dateInput: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
        justifyContent: 'center',
    },

    dateText: {
        fontSize: 15,
        color: "#333",
    },

    picker: {
        backgroundColor: "#f1f1f1",
        borderRadius: 8,
        marginBottom: 12,
    },

    pickerWrap: {
        backgroundColor: "#f1f1f1",
        borderRadius: 8,
        marginBottom: 12,
    },

    input: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 15,
    },

    textArea: {
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        fontSize: 15,
        height: 90,
        textAlignVertical: "top",
        marginBottom: 20,
    },

    cleanText: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
        color: "#666",
        paddingVertical: 10,
    },

    saveBtn: {
        backgroundColor: "#3b82f6",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
})