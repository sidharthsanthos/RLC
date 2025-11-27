import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import MessageBox from '../MessageBox';
import { Picker } from '@react-native-picker/picker';

const AddOrder = () => {

  const [suppliers,setSuppliers]=useState([]);
  const [selectedSupplier,setSelectedSupplier]=useState(null);
  const [orderData,setOrderData]=useState({
    quantity:0,
    quality:'',
    netAmount:0,
    totalAmount:0,
    totalBags:0
  });
  const initialData={
    quantity:0,
    quality:'',
    netAmount:0,
    totalAmount:0,
    totalBags:0
  }
  const [alert,setAlert]=useState({type:'',message:''})

  const fetchSuppliers=async ()=>{
    try{
      const{data,error}=await supabase
         .from('Suppliers')
         .select('*');

      if(error){
        setAlert({type:'error',message:error.message})
        setTimeout(()=>{
          setAlert({type:'',message:''});
          return;
        },3000);
      }

      setSuppliers(data);
      console.log(data);
      
    }catch(err){
      setAlert({type:'error',message:err})
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
    }
  }
  
  useEffect(()=>{
    fetchSuppliers();
  },[]);

  useEffect(()=>{
    if(selectedSupplier!==null){
      console.log(selectedSupplier);
    }
  },[]);

  const qualitySet=[
    "Good",
    "Average",
    "Bad"
  ];

  const handleInput = (field, value) => {
    let updated = { ...orderData };

    // Convert entered value to number
    const num = Number(value);

    // ---------- SUPPLY TYPE LOGIC ----------
    if (selectedSupplier.Supply_Type === 1) {
      // QUANTITY & TOTALBAGS ARE LINKED
      if (field === "quantity") {
        updated.quantity = value;
        updated.totalBags = value; // auto-update bags
      } 
      else if (field === "totalBags") {
        updated.totalBags = value;
        updated.quantity = value; // auto-update quantity
      } 
      else {
        updated[field] = value;
      }
    } 
    
    else {
      // SUPPLY TYPE 2 → fields are independent
      updated[field] = value;
    }

    // ---------- TOTAL AMOUNT CALCULATION ----------
    const qty = Number(updated.quantity);
    const net = Number(updated.netAmount);
    updated.totalAmount = qty * net;

    setOrderData(updated);
  };


  const saveOrder=async ()=>{
    const today=new Date().toISOString().split("T")[0];

    console.log({
      'supplierID':selectedSupplier?.id,
      'stockType':'in-stock',
      'quality':orderData.quality,
      'unitType':selectedSupplier?.Supply_Type,
      'NetQuantity':orderData.quantity,
      'TotalBags':orderData.totalBags,
      'netAmount':orderData.netAmount,
      'totalAmount':orderData.totalAmount,
      'date':today
    });

    if(!selectedSupplier){
      setAlert({type:'error',message:'Select a supplier first'})
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
      return;
    }

    const isDefault=JSON.stringify(orderData)===JSON.stringify(initialData)
    
    if(isDefault){
      setAlert({type:'error',message:'Please enter all fields'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },5000);
      return;
    }

    try{
      const {error:insertError}=await supabase.from('Stock').insert([
        {
          Supplier_ID:selectedSupplier?.id,
          Date:today,
          Stock_Type:'in-stock',
          Quality:orderData.quality,
          Unit_Type:selectedSupplier?.Supply_Type,
          Net_Quantity:orderData.quantity,
          Total_Bags:orderData.totalBags,
          Net_Amount:orderData.netAmount,
          Total_Amount:orderData.totalAmount
        }
      ])

      if(insertError){
        console.error('Insertion Error Occured',error.message);
        return;
      }

      console.log('Order Saved Successfully');

      const newPending=Number(selectedSupplier?.Pending_Amount)+Number(orderData.totalAmount);
      
      const {error:updateError}=await supabase
         .from('Suppliers')
         .update({Pending_Amount:newPending})
         .eq('id',selectedSupplier?.id)
      
      if(updateError){
        setAlert({type:'error',message:updateError.message})
        setTimeout(()=>{
          setAlert({type:'',message:''});
          return;
        },3000);
        return;
      }

      console.log('Supplier Pending Amount Updated Successfully');
      setAlert({type:'success', message:'Order Added Successfully'})
      setTimeout(()=>{
        setAlert({type:'',message:''});
        fetchSuppliers();
        setSelectedSupplier(null);
        setOrderData({
          quantity:0,
          quality:'',
          netAmount:0,
          totalAmount:0,
          totalBags:0
        });
        return;
      },3000)

      fetchSuppliers();
      
    }catch(err){
      console.error('Unexpected Error Occured',err);
      setAlert({type:'error',message:err})
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
    }
    
  }

  return (
    <View style={styles.container}>
      {alert.message!=="" && (
        <MessageBox type={alert.type} message={alert.message} />
      )}
      <Text>AddOrder</Text>
      <Picker
        selectedValue={selectedSupplier?.id || ""}
        onValueChange={(value) => {
          const supplier = suppliers.find(s => s.id == value);
          setSelectedSupplier(supplier);
        }}
        style={{ 
          backgroundColor: "#fff",
          marginVertical: 10,
          borderRadius: 8 
        }}
      >
        <Picker.Item label="Select Supplier" value="" />

        {suppliers.map((supplier) => (
          <Picker.Item 
            key={supplier.id} 
            label={supplier.Name} 
            value={supplier.id} 
          />
        ))}
      </Picker>
      
      {selectedSupplier && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontWeight: "bold" }}>
            Contact: {selectedSupplier.Contact}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            Pending Amount: {selectedSupplier.Pending_Amount}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            Supplier Type: {selectedSupplier.Supply_Type===1?'Sack-Wise':'kg-wise'}
          </Text>
        </View>
      )}

      {/* <TextInput
        style={styles.input}
        placeholder="Quality"
        value={orderData.quality}
        onChangeText={(v) => handleInput("quality", v)}
      /> */}

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
        placeholder="Quantity"
        keyboardType="numeric"
        value={orderData.quantity}
        onChangeText={(v) => handleInput("quantity", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Total Bags"
        keyboardType="numeric"
        value={orderData.totalBags}
        onChangeText={(v) => handleInput("totalBags", v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Net Amount"
        keyboardType="numeric"
        value={orderData.netAmount}
        onChangeText={(v) => handleInput("netAmount", v)}
      />

      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        placeholder="Total Amount"
        value={orderData.totalAmount.toString()}
        editable={false}
      />

      <TouchableOpacity style={styles.btn} onPress={saveOrder}>
        <Text style={styles.btnText}>Save Order</Text>
      </TouchableOpacity>

    </View>
  )
}

export default AddOrder

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8
  },
  btn: {
    backgroundColor: "#07c3f7",
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
})