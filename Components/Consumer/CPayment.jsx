import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CPayment = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const preSelectedConsumer = route.params?.consumer;

    const [consumers,setConsumers]=useState([]);
    const [selectedConsumer,setSelectedConsumer]=useState(preSelectedConsumer || null);
    
    const [paymentData,setPaymentData]=useState({
        amount:0,
        type:'credit', // We receive money
        mode:'',
        remarks:''
    });
    const [alert,setAlert]=useState({type:'',message:''});

    const transactionMode=[
        'UPI',
        'Cash',
        'Bank'
    ]

    const fetchConsumers=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Consumers')
               .select('*')

            if(error){
                console.error('Selection Error Occured',error.message);
                return;
            }

            setConsumers(data);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        if(!preSelectedConsumer){
            fetchConsumers();
        }
    },[preSelectedConsumer]);

    const handleInput=(field,value)=>{
        let updated={...paymentData};
        updated[field]=value;
        setPaymentData(updated);
    };

    const savePayment=async ()=>{
        const today=new Date().toISOString().split('T')[0];
        const amt=Number(paymentData.amount);
        const mode=paymentData.mode;

        if(!selectedConsumer){
             setAlert({type:'error',message:'Please Select Consumer'})
             setTimeout(()=>setAlert({type:'',message:''}), 3000);
             return;
        }

        if(amt<=0){            
            setAlert({type:'error',message:'Please Enter Valid Amount'})
            setTimeout(()=>setAlert({type:'',message:''}), 3000);
            return;
        }

        if(mode===''){
            setAlert({type:'error',message:'Please Select Transaction Mode'})
            setTimeout(()=>setAlert({type:'',message:''}), 3000);
            return;
        }

        const newPending = (selectedConsumer?.Pending_Amount || 0) - amt;

        try{
            const {error}=await supabase
               .from('Transactions')
               .insert({
                    ref_type:'consumer',
                    ref_id:selectedConsumer?.id,
                    amount:amt,
                    transaction_type:paymentData.type,
                    mode:paymentData.mode.toLowerCase(),
                    date:today,
                    remarks:paymentData.remarks
               });

               if(error){
                    setAlert({type:'error',message:error.message})
                    setTimeout(()=>setAlert({type:'',message:''}), 3000);
                    return;
                }

               const {error:updateError}=await supabase
                  .from('Consumers')
                  .update({Pending_Amount:newPending})
                  .eq('id',selectedConsumer?.id)

                if(updateError){
                    setAlert({type:'error',message:updateError.message})
                    setTimeout(()=>setAlert({type:'',message:''}), 3000);
                    return;
                }

                setAlert({type:'success', message:'Payment Received Successfully'})
                setTimeout(()=>{
                    setAlert({type:'',message:''})
                    if(preSelectedConsumer){
                         navigation.goBack();
                    } else {
                        setSelectedConsumer(null);
                        setPaymentData({
                            amount:0,
                            type:'credit',
                            mode:'',
                            remarks:''
                        });
                        fetchConsumers(); // Refresh list to update pending amounts
                    }
                },2000);
               
        }catch(err){
            console.error('Unexpected Error Occured',err);
            setAlert({type:'error',message:'Unexpected Error'})
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

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.heading}>Receive Payment</Text>
        </View>

        {alert.message !== '' && (
            <View style={styles.alertWrap}>
                <MessageBox type={alert.type} message={alert.message} />
            </View>
        )}

        <View style={styles.card}>
            
            {/* Consumer Selection or Display */}
            <Text style={styles.label}>Consumer</Text>
            
            {preSelectedConsumer ? (
                <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyText}>{preSelectedConsumer.Name}</Text>
                    <Ionicons name="lock-closed-outline" size={16} color="#999"/>
                </View>
            ) : (
                <View style={styles.pickerWrap}>
                    <Picker
                    selectedValue={selectedConsumer?.id || ""}
                    onValueChange={(value) => {
                        const consumer = consumers.find(s => s.id === value);
                        setSelectedConsumer(consumer);
                    }}
                    >
                    <Picker.Item label="Select a Consumer" value="" />
                    {consumers.map((c) => (
                        <Picker.Item
                        key={c.id}
                        label={c.Name}
                        value={c.id}
                        />
                    ))}
                    </Picker>
                </View>
            )}

            {selectedConsumer ? (
                <>
                 {/* Pending Amount */}
                <View style={styles.infoBox}>
                    <Text style={styles.pendingText}>
                        Current Due:  
                        <Text style={styles.amountHighlight}> ₹{selectedConsumer?.Pending_Amount?.toLocaleString() ?? 0}</Text>
                    </Text>
                </View>

                {/* Amount Input */}
                <Text style={styles.label}>Received Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                    value={paymentData.amount.toString()}
                    onChangeText={(v) => handleInput("amount", v)}
                />

                {/* Mode Picker */}
                <Text style={styles.label}>Transaction Mode</Text>
                <View style={styles.pickerWrap}>
                    <Picker
                    selectedValue={paymentData.mode}
                    onValueChange={(v) => handleInput("mode", v)}
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
                </>
            ) : (
                 <Text style={styles.placeholderText}>Please select a consumer to proceed.</Text>
            )}

        </View>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default CPayment

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  
  scrollContent: {
    padding: 16,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight + 10: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 10,
    padding: 5
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  alertWrap: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#444",
  },
  pickerWrap: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  readOnlyField: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  readOnlyText: {
    fontSize: 16,
    color: "#555",
    fontWeight: '500'
  },
  input: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    height: 90,
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  infoBox: {
      marginVertical: 15,
      padding: 10,
      backgroundColor: '#FFF0E6', // Light Orangeish
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#FF9966'
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
  saveBtn: {
    backgroundColor: "#FF9966", // Consumer theme color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 2
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  placeholderText: {
      textAlign: 'center',
      marginTop: 20,
      color: '#888',
      fontStyle: 'italic'
  }
});