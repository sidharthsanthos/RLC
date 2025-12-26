import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'react-native';
import { supabase } from '../supabaseConfig';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditOrder = ({route}) => {
    const {itemID}=route.params;
    const [order,setOrder]=useState(null);

    const [quality,setQuality]=useState('');
    const [odate,setODate]=useState(null);
    const [quantity,setQuantity]=useState('');
    const [totalBags,setTotalBags]=useState('');
    const [netAmount,setNetAmount]=useState('');
    const [totalAmount,setTotal]=useState(0);
    const [notes,setNotes]=useState('');
    const [showdatepicker,setShowDatePicker]=useState(false);
    const [lastEdited,setLastEdited]=useState(null);
    const [supplierID, setSupplierID] = useState('');
    const [pending, setPending] = useState(0);

    const qualitySet=[
        "Good",
        "Average",
        "Bad"
    ];
    
    
    const fetchOrder=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Stock')
               .select('*')
               .eq('id',itemID);

            if(error){
                console.error('Fetching Error Occured',error.message);
                return;
            }

            const o=data[0];
            setOrder(o);
            console.log(data[0]);
            
            setSupplierID(o.Supplier_ID);
            console.log('data',o);
            
            setODate(o.Date?new Date(o.Date):null);
            setQuality(o.Quality);
            setQuantity(String(o.Net_Quantity));
            setTotalBags(String(o.Total_Bags));
            setNetAmount(String(o.Net_Amount));
            setTotal(o.Total_Amount);
            setNotes(o.Notes);

        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    const fetchPending = async () => {
        try {
            const { data, error } = await supabase
                .from('Suppliers')
                .select('Pending_Amount')
                .eq('id', supplierID);

            if (error) {
                console.error('Fetching Error Occured', error.message);
                return;
            }

            const pending = data[0].Pending_Amount
            setPending(pending);
        } catch (err) {
            console.error('Unexpected Error Occured', err);
        }
    }

    useEffect(()=>{
        fetchOrder();
    },[]);

    useEffect(() => {
        if (supplierID) {
            console.log('supplierID',supplierID);
            
            fetchPending();
        }
    }, [supplierID]);

    useEffect(()=>{
        const q=parseInt(quantity);
        const rate=parseInt(netAmount);

        if(!isNaN(q) && !isNaN(rate)){
            setTotal(q*rate);
        }else{
            setTotal(0);
        }
    },[quantity,netAmount]);

    useEffect(()=>{
        if(order?.Unit_Type===1){
            if(lastEdited==='quantity'){
                setTotalBags(quantity);
            }else if(lastEdited==='totalBags'){
                setQuantity(totalBags);
            }
        }
    },[quantity,totalBags]);

    const normalize=(v)=>
        v===null||v===undefined?"":String(v).trim();

    const normalizeDate=(value)=>{
        if(!value) return "";
        return new Date(value).toISOString().split('T')[0];
    }

    const updateOrder=async ()=>{
        
        if(!order) return;

        let updateFields={};

        if(normalize(quality) !== normalize(order.Quality)) 
            updateFields.Quality = quality;

        if(normalizeDate(odate) !== normalizeDate(order.Date)) 
            updateFields.Date=odate;

        if(Number(quantity) !== Number(order.Net_Quantity)) 
            updateFields.Net_Quantity=quantity;

        if(Number(totalBags) !== Number(order.Total_Bags)) 
            updateFields.Total_Bags=totalBags;

        if(Number(netAmount) !== Number(order.Net_Amount)) 
            updateFields.Net_Amount=netAmount;

        if(Number(totalAmount) !== Number(order.Total_Amount)) 
            updateFields.Total_Amount=totalAmount;

        if(normalize(notes) !== normalize(order.Notes)) 
            updateFields.Notes=notes;

        console.log('fields updated: ',updateFields);


        if(Object.keys(updateFields).length === 0){            
            alert("No Changes to Update");
            return;
        }

        try {
            const { error } = await supabase
                .from('Stock')
                .update(updateFields)
                .eq('id', itemID)

            if (error) {
                alert('Update Failed' + error.message);
                return;
            }

            if (updateFields.Total_Amount) {
                const amountDifference = Number(totalAmount) - Number(order.Total_Amount);
                const newPending = pending + amountDifference;

                const { error: supplierError } = await supabase
                    .from('Suppliers')
                    .update({ Pending_Amount: newPending })
                    .eq('id', supplierID);

                if (supplierError) {
                    alert('Failed to update pending amount: ' + supplierError.message);
                    // Optionally, you might want to revert the order update here
                    // or handle this scenario in another way.
                    return;
                }
            }

            alert('Order Updated Successfully');

        } catch (err) {
            alert('Unexpected Error Occured ' + err)
        }
    }


    return (
        <View style={styles.container}>
            <Text>EditOrder: {itemID?itemID:'item ID not available'}</Text>
            <TouchableOpacity
               style={[styles.input,{justifyContent:'center'}]}
               onPress={()=>setShowDatePicker(true)}
            >
                <Text>
                    {odate?odate.toDateString():'Select Order Date'}
                </Text>
            </TouchableOpacity>

            {showdatepicker && (
                <DateTimePicker
                   value={odate||new Date()}
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
               selectedValue={quality}
               onValueChange={(v)=>setQuality(v)}
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
               value={quantity}
               onChangeText={(v)=>{
                setLastEdited('quantity');
                setQuantity(v);
               }}
            />

            <TextInput
               style={styles.input}
               placeholder='Total Bags'
               keyboardType='numeric'
               value={totalBags}
               onChangeText={(v)=>{
                setLastEdited('totalBags');
                setTotalBags(v);
               }}
            />

            <TextInput
               style={styles.input}
               placeholder='Net Amount'
               keyboardType='numeric'
               value={netAmount}
               onChangeText={setNetAmount}
            />

            <TextInput
               style={[styles.input, {backgroundColor:'#eee'}]}
               placeholder='Total Amount'
               value={totalAmount.toString()}
               editable={false}
            />

            <TextInput
               style={[styles.input, {backgroundColor:'#eee'}]}
               placeholder='Additional Notes'
               value={notes}
               onChangeText={setNotes}
            />

            <TouchableOpacity style={styles.btn} onPress={updateOrder}>
                <Text style={styles.btnText}>Update Order</Text>
            </TouchableOpacity>
        </View>
    )
}

export default EditOrder

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