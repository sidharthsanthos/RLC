import { Platform, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import { TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditPayment = ({route}) => {
    const { itemID }=route.params;

    const [payment,setPayment]=useState(null);
    const [showdatepicker,setShowDatePicker]=useState(false);
    const [oDate,setODate]=useState(new Date());
    const [supplierID,setSupplierID]=useState('');
    const [pending,setPending]=useState(0);
    const [amount,setAmount]=useState('');
    const [mode,setMode]=useState('');
    const [notes,setNotes]=useState('');

    const transactionMode=[
        'upi',
        'cash',
        'bank'
    ];

    const fetchPayment=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Transactions')
               .select('*')
               .eq('id',itemID);

            if(error){
                console.error('Fetching Error Occured',error.message);
                return;
            }

            const p=data[0];
            console.log(p.ref_id);
            setSupplierID(p.ref_id);
            setAmount(String(p.amount));
            setODate(new Date(p.date))
            setMode(p.mode);
            setNotes(p.remarks);
            setPayment(p);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    const fetchPending=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Suppliers')
               .select('Pending_Amount')
               .eq('id',supplierID);

            if(error){
                console.error('Fetching Error Occured',error.message);
                return;
            }

            console.log(data);
            
            const pending=data[0].Pending_Amount
            setPending(pending);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchPayment();
    },[]);

    useEffect(()=>{
        if(supplierID){
            fetchPending();
        }
    },[supplierID]);

    const normalize=(v)=>
        v===null||v===undefined?"":String(v).trim();

    const normalizeDate=(value)=>{
        if(!value) return "";
        return new Date(value).toISOString().split('T')[0];
    }


    const updatePayment = async () => {
        if (!payment) return;

        let updateFields = {};

        if (amount === '') {
            alert('Amount is required');
            return;
        }

        if (Number(amount) === 0) {
            alert('Amount cannot be 0');
            return;
        }

        if (normalizeDate(oDate) !== normalizeDate(payment.date)) {
            updateFields.date = normalizeDate(oDate);
        }

        if (Number(amount) !== Number(payment.amount)) {
            updateFields.amount = Number(amount);
        }

        if (normalize(mode) !== normalize(payment.mode)) {
            updateFields.mode = mode;
        }

        if (normalize(notes) !== normalize(payment.remarks)) {
            updateFields.remarks = notes;
        }

        if (Object.keys(updateFields).length === 0) {
            alert('No Changes to Update');
            return;
        }

        const previousAmount = Number(payment.amount);
        const newAmount = Number(amount);

        const restoredPending = pending + previousAmount;
        const diff = restoredPending - newAmount;

        if (diff < 0) {
            alert(`Maximum Payable is ₹${restoredPending}`);
            return;
        }

        try {
            const { error } = await supabase
            .from('Transactions')
            .update(updateFields)
            .eq('id', itemID);

            if (error) throw error;

            // Optional but recommended
            await supabase
            .from('Suppliers')
            .update({ Pending_Amount: diff })
            .eq('id', supplierID);

            alert('Payment Updated Successfully');
        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        }
    };


    return (
        <View style={styles.container}>
        <Text>EditPayment:{itemID?itemID:'Item ID Not Available'}</Text>
        
        <Text style={styles.pendingText}>
            Pending Amount:  
            <Text style={styles.amountHighlight}> ₹{pending?pending:'pending not available'}</Text>
        </Text>

        <TouchableOpacity
            style={[styles.input,{justifyContent:'center'}]}
            onPress={()=>setShowDatePicker(true)}
        >
            <Text>
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

        <Text style={styles.label}>Amount</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
        />

        <Text style={styles.label}>Transaction Mode</Text>
        <View style={styles.pickerWrap}>
            <Picker
            selectedValue={mode}
            onValueChange={setMode}
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

        <Text style={styles.label}>Notes</Text>
        <TextInput
            style={styles.textArea}
            placeholder="Optional Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={updatePayment}>
            <Text style={styles.btnText}>Save Payment</Text>
        </TouchableOpacity>
        </View>
    )
}

export default EditPayment

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:0,
    },
    alertWrap: {
        marginBottom: 12,
    },
    heading: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 15,
        color: "#333",
        textTransform:'capitalize'
    },
    pendingText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 14,
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
        color: "#444",
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
        borderColor:'#ccc'
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