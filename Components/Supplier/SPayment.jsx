import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
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
        amount:0,
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

            console.log(data);
            
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

        const amt=paymentData.amount;
        const mode=paymentData.mode;

        if(amt==0){            
            setAlert({type:'error',message:'Please Enter Amount'})
            console.log(alert);
            
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

        const newPending=supplier?.Pending_Amount-amt;
        console.log(newPending);

        if(newPending<0){
            setAlert({type:'error',message:'Please Enter Valid Amount'})
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
                    amount:paymentData.amount,
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

                setAlert({type:'success', message:'Transaction Saved Successfully'})
                setTimeout(()=>{
                    setAlert({type:'',message:''})
                    fetchSupplier();
                    setPaymentData({
                        amount:0,
                        type:'debit',
                        mode:'',
                        remarks:''
                    });
                    return;
                },3000);
                

                console.log('Payment Logged Successfully');
        }catch(err){
            console.error('Unexpected Error Occured',err);
            setAlert({type:'error',message:err})
            setTimeout(()=>{
                setAlert({type:'',message:''})
                return;
            },3000);
        }

        
    }

    return (
        <View style={styles.container}>
            {alert.message !== '' && (
                <View style={styles.alertWrap}>
                    <MessageBox type={alert.type} message={alert.message}/>
                </View>
            )}
            <Text style={styles.heading}>Add Payment {supplier?'for '+supplier.Name:''}</Text>

            <Text style={styles.pendingText}>
                Pending Amount:  
                <Text style={styles.amountHighlight}> ₹{supplier?.Pending_Amount}</Text>
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
                value={paymentData.amount}
                onChangeText={(v) => handleInput("amount", v)}
            />

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

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={styles.textArea}
                placeholder="Optional Notes"
                value={paymentData?.remarks}
                onChangeText={(v) => handleInput("remarks", v)}
                multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={savePayment}>
                <Text style={styles.btnText}>Save Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={()=>navigation.navigate('SupplierDetails',{supplierID})}>
                <Text style={styles.btnText}>{'<-- Back'}</Text>
            </TouchableOpacity>


        </View>
    )
}

export default SPayment

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:10,
        backgroundColor:'#f5f7fa'
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