import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';
import { Ionicons } from '@expo/vector-icons';


const AddSale = () => {

    const route=useRoute();
    const {consumer}=route.params;
    const navigation=useNavigation();

    const [saleData,setSaleData]=useState({
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
        let updated={...saleData}
        
        // Assume default logic (independent fields) unless specific business logic exists
        // For suppliers, Sack vs Kg affected this. For consumers, we might want similar logic?
        // Let's assume manual entry for now for flexibility, or mirror Supplier if needed.
        // Mirroring Supplier logic for consistency:
        
        // If we knew the "Supply Type" preference of the consumer, we could automate.
        // Since Consumers table might not have 'Supply_Type' (I should check, but assuming it doesn't or we treat it simple),
        // I'll keep them linked if Quantity == TotalBags is a common case, but let's keep them independent for now 
        // OR just copy the SOrder logic which links them if supply type is 1. 
        // Consumer table in my read_file didn't explicitly show Supply_Type column in the insert, so I'll assume independent or standard.
        // Actually, let's keep it simple: Quantity and Total Bags are separate inputs.
        
        updated[field]=value;

        const qty=Number(updated.quantity);
        const net=Number(updated.netAmount);
        updated.totalAmount=qty*net;

        setSaleData(updated);
    }

    const saveSale=async ()=>{
        const saleDate=oDate.toISOString().split('T')[0];
        
        if(!saleData.quantity || !saleData.netAmount){
             setAlert({type:'error',message:'Please fill required fields'});
             setTimeout(()=>setAlert({type:'',message:''}), 3000);
             return;
        }

        try{
            const {error:insertError}=await supabase
               .from('Stock')
               .insert([
                {
                    Consumer_ID:consumer?.id,
                    Date:saleDate,
                    Stock_Type:'out-stock', // Selling
                    Quality:saleData.quality,
                    // Unit_Type: ... // If needed
                    Net_Quantity:saleData.quantity,
                    Total_Bags:saleData.totalBags,
                    Net_Amount:saleData.netAmount,
                    Total_Amount:saleData.totalAmount
                }
               ]);

            if(insertError){
                console.error('Insert Error Occured', insertError.message);
                setAlert({type:'error', message: insertError.message});
                return;
            }
               
            const newPending=Number(consumer?.Pending_Amount || 0) + Number(saleData.totalAmount);

            const {error:updateError}=await supabase
                .from('Consumers')
                .update({Pending_Amount:newPending})
                .eq('id',consumer?.id)
                  
            if(updateError){
                setAlert({type:'error',message:updateError.message})
                setTimeout(()=>{
                    setAlert({type:'',message:''});
                    return;
                },3000);
                return;
            }
            
            console.log('Consumer Pending Amount Updated Successfully');
            setAlert({type:'success',message:'Sale Added Successfully'})
            setTimeout(()=>{
                setAlert({type:'',message:''})
                setSaleData({
                    quantity:0,
                    quality:'',
                    netAmount:0,
                    totalAmount:0,
                    totalBags:0
                })
                navigation.goBack(); // Return to Details
                return;
            },2000);
            
        }catch(err){
            console.error('Unexpected Error Occured',err);
            setAlert({type:'error', message: 'An unexpected error occurred.'});
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>

            {alert.message!=='' && (
                <View style={styles.alertWrap}>
                    <MessageBox type={alert.type} message={alert.message}/>
                </View>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.heading}>Add Sale</Text>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.subHeading}>Consumer: {consumer?.Name}</Text>
                
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                style={styles.dateInput}
                onPress={()=>setShowDatePicker(true)}
                >
                    <Text style={styles.dateText}>
                        {oDate?oDate.toDateString():'Select Date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
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

                <Text style={styles.label}>Quality</Text>
                <View style={styles.pickerWrap}>
                    <Picker
                    selectedValue={saleData.quality}
                    onValueChange={(v)=>handleInput("quality",v)}
                    >
                        <Picker.Item label='Select Quality' value=''/>
                        {qualitySet.map((q)=>(
                            <Picker.Item key={q} label={q} value={q}/>
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Quantity (Qty)</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Quantity'
                    keyboardType='numeric'
                    value={saleData.quantity.toString()}
                    onChangeText={(v)=>handleInput('quantity',v)}
                />

                <Text style={styles.label}>Total Bags</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter Total Bags'
                    keyboardType='numeric'
                    value={saleData.totalBags.toString()}
                    onChangeText={(v)=>handleInput('totalBags',v)}
                />

                <Text style={styles.label}>Rate / Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Rate'
                    keyboardType='numeric'
                    value={saleData.netAmount.toString()}
                    onChangeText={(v)=>handleInput('netAmount',v)}
                />

                <Text style={styles.label}>Total Amount</Text>
                <TextInput
                    style={[styles.input, styles.disabledInput]}
                    placeholder='Total Amount'
                    value={saleData.totalAmount.toString()}
                    editable={false}
                />

                <TouchableOpacity style={styles.btn} onPress={saveSale}>
                    <Text style={styles.btnText}>Confirm Sale</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

export default AddSale

const styles = StyleSheet.create({
    container:{
        flexGrow: 1,
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight + 10: 20,
        paddingHorizontal: 16,
        backgroundColor: '#F5F7FA',
        paddingBottom: 40
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2}
    },
    subHeading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#555',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 6,
        marginTop: 10
    },
    input: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        fontSize: 16
    },
    dateInput: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dateText: {
        fontSize: 16,
        color: '#333'
    },
    pickerWrap: {
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
    disabledInput: {
        backgroundColor: "#eee",
        color: '#888'
    },
    btn: {
        backgroundColor: "#FF9966",
        padding: 16,
        borderRadius: 10,
        marginTop: 25,
        alignItems: 'center',
        elevation: 2
    },
    btnText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    alertWrap: {
        marginBottom: 10
    }
})