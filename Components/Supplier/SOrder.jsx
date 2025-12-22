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
                    Notes:orderData.notes
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

            <TextInput
               style={[styles.input, {backgroundColor:'#eee'}]}
               placeholder='Additional Notes'
               value={orderData.notes}
               onChangeText={(v)=>handleInput('notes',v)}
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
    },
    input:{
        backgroundColor:'#fff',
        borderWidth:1,
        borderColor:'#ccc',
        padding:12,
        marginVertical:6,
        borderRadius:6,
    },
    btn:{
        backgroundColor:'#07c3f7',
        padding:14,
        borderRadius:8,
        marginTop:15,
    },
    btnText:{
        color:'white',
        textAlign:'center',
        fontWeight:'bold',
    },
})