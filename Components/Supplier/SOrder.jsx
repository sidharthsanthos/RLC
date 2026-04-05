import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';


const SOrder = () => {

    const route=useRoute();
    const {supplier}=route.params;
    const navigation=useNavigation();

    const [orderData,setOrderData]=useState({
        quantity:0,
        quality:'',
        netAmount:0,
        totalAmount:0,
        totalBags:0,
        notes:''
    });
    const [showdatepicker,setShowDatePicker]=useState(false);
    const [oDate,setODate]=useState(new Date());
    const [alert,setAlert]=useState({type:'',message:''});

    const initialData={
        quantity:0,
        quality:'',
        netAmount:0,
        totalAmount:0,
        totalBags:0,   
    }

    const qualitySet=[
        "Good",
        "Average",
        "Bad"
    ];

    const handleInput=(field,value)=>{
        let updated={...orderData}

        if(supplier.Supply_Type===1){
            if(field==='quantity'){
                updated.quantity=value;
                updated.totalBags=value;
            }else if(field==='totalBags'){
                updated.totalBags=value;
                updated.quantity=value;
            }else{
                updated[field]=value;
            }
        }else{
            updated[field]=value;
        }

        const qty=Number(updated.quantity);
        const net=Number(updated.netAmount);
        updated.totalAmount=qty*net;

        setOrderData(updated);
    }

    const saveOrder=async ()=>{
        const orderDate=oDate.toISOString().split('T')[0];

        if(!supplier){
            setAlert({type:'error',message:'Supplier Not Found Retry'});
            setTimeout(()=>{
                setAlert({type:'',message:''});
                return;
            },3000);
            return;
        }

        // const isDefault=JSON.stringify(orderData)===JSON.stringify(initialData);

        // if(isDefault){
        //     setAlert({type:'error',message:'Please enter all fields'});
        //     setTimeout(()=>{
        //         setAlert({type:'',message:''});
        //         return;
        //     },3000);
        //     return;
        // }

        if(orderData.quality===''){
        setAlert({type:'error',message:'Please select Quality'})
        setTimeout(()=>{
            setAlert({type:'',message:''})
            return;
        },3000);
        return;
        }

        if(orderData.quantity===0){
        setAlert({type:'error',message:'Please provide quantity'})
        setTimeout(()=>{
            setAlert({type:'',message:''})
            return;
        },3000);
        return;
        }

        if(orderData.totalBags===0){
        setAlert({type:'error',message:'Please Provide No of Bags'})
        setTimeout(()=>{
            setAlert({type:'',message:''})
            return;
        },3000);
        return;
        }

        if(orderData.netAmount===0){
        setAlert({type:'error',message:'Please Provide Net Amount '})
        setTimeout(()=>{
            setAlert({type:'',message:''})
            return;
        },3000);
        return;
        }

        try{
            const {error:insertError}=await supabase
               .from('Stock')
               .insert([
                {
                    Supplier_ID:supplier?.id,
                    Date:orderDate,
                    Stock_Type:'in-stock',
                    Quality:orderData.quality,
                    Unit_Type:supplier.Supply_Type,
                    Net_Quantity:orderData.quantity,
                    Total_Bags:orderData.totalBags,
                    Net_Amount:orderData.netAmount,
                    Total_Amount:orderData.totalAmount,
                    Notes:orderData.notes,
                    Remaining_Bags:orderData.totalBags,
                    Remaining_Quantity:orderData.quantity
                }
               ]);

            if(insertError){
            console.error('Insert Error Occured',error.message);
            return;
            }
               
            const newPending=Number(supplier?.Pending_Amount)+Number(orderData.totalAmount);

            const {error:updateError}=await supabase
                .from('Suppliers')
                .update({Pending_Amount:newPending})
                .eq('id',supplier?.id)
                  
            if(updateError){
                setAlert({type:'error',message:updateError.message})
                setTimeout(()=>{
                    setAlert({type:'',message:''});
                    return;
                },3000);
                return;
            }
            
            console.log('Supplier Pending Amount Updated Successfully');
            setAlert({type:'success',message:'Order Added Successfully'})
            setTimeout(()=>{
                setAlert({type:'',message:''})
                setOrderData({
                    quantity:0,
                    quality:'',
                    netAmount:0,
                    totalAmount:0,
                    totalBags:0
                })
                navigation.navigate('SupplierDetails',{supplierID:supplier?.id});
                return;
            },3000);
            
        }catch(err){
            console.error('Unexpected Error Occured',err);
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

            {alert.message!=='' && (
                <View style={styles.alertWrap}>
                    <MessageBox type={alert.type} message={alert.message}/>
                </View>
            )}

            <Text style={styles.header}>Add Supplier Order</Text>

            {/* Supplier Info Card */}
            <View style={styles.card}>
                <View style={styles.supplierInfo}>
                    <Ionicons name="person-circle-outline" size={24} color="#51CF66" />
                    <View style={styles.supplierDetails}>
                        <Text style={styles.supplierName}>{supplier?.Name || 'Unknown'}</Text>
                        <Text style={styles.supplierType}>
                            {supplier?.Supply_Type === 1 ? 'Bags' : 'Kgs'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Order Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Order Details</Text>
                
                {/* Date Picker */}
                <Text style={styles.label}>Order Date</Text>
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={()=>setShowDatePicker(true)}
                >
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.dateText}>
                        {oDate ? oDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Order Date'}
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
                            setODate(selectedDate)
                        }
                       }}
                    />
                )}

                {/* Quality Picker */}
                <Text style={styles.label}>Quality</Text>
                <View style={styles.pickerWrap}>
                    <Picker
                       selectedValue={orderData.quality}
                       onValueChange={(v)=>handleInput("quality",v)}
                    >
                        <Picker.Item label='Select Quality' value=''/>
                        {qualitySet.map((q)=>(
                            <Picker.Item key={q} label={q} value={q}/>
                        ))}
                    </Picker>
                </View>

                {/* Quantity Input */}
                <Text style={styles.label}>
                    Quantity {supplier?.Supply_Type === 1 ? '(Bags)' : '(Kg)'}
                </Text>
                <TextInput
                   style={styles.input}
                   placeholder={supplier?.Supply_Type === 1 ? 'Enter quantity in bags' : 'Enter quantity in kg'}
                   keyboardType='numeric'
                   value={orderData.quantity.toString()}
                   onChangeText={(v)=>handleInput('quantity',v)}
                />

                {/* Total Bags */}
                {supplier?.Supply_Type !== 1 && (
                    <>
                        <Text style={styles.label}>Total Bags</Text>
                        <TextInput
                           style={styles.input}
                           placeholder='Enter number of bags'
                           keyboardType='numeric'
                           value={orderData.totalBags.toString()}
                           onChangeText={(v)=>handleInput('totalBags',v)}
                        />
                    </>
                )}

                {/* Net Amount per unit */}
                <Text style={styles.label}>Rate per {supplier?.Supply_Type === 1 ? 'Bag' : 'Kg'} (₹)</Text>
                <TextInput
                   style={styles.input}
                   placeholder='Enter rate'
                   keyboardType='numeric'
                   value={orderData.netAmount.toString()}
                   onChangeText={(v)=>handleInput('netAmount',v)}
                />

                {/* Total Amount - Calculated */}
                <View style={styles.totalAmountBox}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{orderData.totalAmount.toLocaleString()}</Text>
                </View>

                {/* Notes */}
                <Text style={styles.label}>Additional Notes (Optional)</Text>
                <TextInput
                   style={styles.textArea}
                   placeholder='Add any notes about this order...'
                   value={orderData.notes}
                   onChangeText={(v)=>handleInput('notes',v)}
                   multiline
                   numberOfLines={3}
                />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.btn} onPress={saveOrder}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.btnText}>Save Order</Text>
            </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SOrder

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },
    
    scrollContent: {
        padding: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    },
    
    alertWrap: {
        marginBottom: 12,
    },
    
    header: {
        fontSize: 22,
        fontWeight: "700",
        color: "#333",
        marginBottom: 20,
        textAlign: 'center',
    },
    
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    
    supplierInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    
    supplierDetails: {
        flex: 1,
    },
    
    supplierName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 2,
    },
    
    supplierType: {
        fontSize: 13,
        color: "#666",
        fontWeight: '500',
    },
    
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
        marginTop: 12,
        color: "#444",
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
    
    pickerWrap: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    
    dateInput: {
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    
    dateText: {
        fontSize: 15,
        color: "#333",
    },
    
    textArea: {
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 15,
        height: 80,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    
    totalAmountBox: {
        marginTop: 16,
        padding: 14,
        backgroundColor: '#E6F7FF',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#51CF66',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    
    totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#51CF66",
    },
    
    btn: {
        backgroundColor: "#51CF66",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
})