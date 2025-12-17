import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
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
        totalBags:0
    });
    const [showdatepicker,setShowDatePicker]=useState(false);
    const [oDate,setODate]=useState(new Date());
    const [alert,setAlert]=useState({type:'',message:''});

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
        console.log(orderData.quantity,orderData.totalBags,orderData.quality,orderData.netAmount,orderData.totalAmount,orderDate);
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
                    Total_Amount:orderData.totalAmount
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
        <View style={styles.container}>

            {alert.message!=='' && (
                <MessageBox type={alert.type} message={alert.message}/>
            )}

            <Text>SOrder</Text>
            <Text>Name: {supplier?supplier.Name:''}</Text>

            <TouchableOpacity
               style={[styles.input,{justifyContent:'center'}]}
               onPress={()=>setShowDatePicker(true)}
            >
                <Text>
                    {oDate?oDate.toDateString():'Select Order Date'}
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
            ) }

            <Picker
               selectedValue={orderData.quality}
               onValueChange={(v)=>handleInput("quality",v)}
            >
                <Picker.Item label='Select Quality' value=''/>
                {qualitySet.map((q)=>(
                    <Picker.Item key={q} label={q} value={q}/>
                ))}
            </Picker>

            <TextInput
               style={styles.input}
               placeholder='Quantity'
               keyboardType='numeric'
               value={orderData.quantity}
               onChangeText={(v)=>handleInput('quantity',v)}
            />

            <TextInput
               style={styles.input}
               placeholder='Total Bags'
               keyboardType='numeric'
               value={orderData.totalBags}
               onChangeText={(v)=>handleInput('totalBags',v)}
            />

            <TextInput
               style={styles.input}
               placeholder='Net Amount'
               keyboardType='numeric'
               value={orderData.netAmount}
               onChangeText={(v)=>handleInput('netAmount',v)}
            />

            <TextInput
               style={[styles.input, {backgroundColor:'#eee'}]}
               placeholder='Total Amount'
               value={orderData.totalAmount.toString()}
               editable={false}
            />

            <TouchableOpacity style={styles.btn} onPress={saveOrder}>
                <Text style={styles.btnText}>Save Order</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SOrder

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:0,
    }
})