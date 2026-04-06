import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'   // Must install this
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';

const AddSupplier = () => {

  const [name, setName] = useState('');
  const [byname, setByName] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [supplyType, setSupplyType] = useState(1);
  const [bagWeight, setBagWeight] = useState('');
  const [alert,setAlert]=useState({type:'',message:''});

  const southStates = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
    "Puducherry"
  ];

  const AddSupplier=async ()=>{
    
    const len=contact.length;

    if(name===''||contact===''||state===''){
      setAlert({type:'error', message:'Fill Essential Fields'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
      return;
    }

    if(len!==10){
      setAlert({type:'error',message:'Phone Number Not Valid'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
      return;
    }

    try{
      const {error}=await supabase
        .from("Suppliers")
        .insert({
          Name:name,
          By_Name:byname,
          Contact:contact,
          State:state,
          Address:address,
          Supply_Type:supplyType,
          Bag_Weight:bagWeight ? Number(bagWeight) : null
        })

      if(error){
        setAlert({type:'error',message:error.message});
        setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
        },3000);
        return;
      }

      // console.log("Data Insertion Successfully");
      setAlert({type:'success',message:'Supplier Added Successfully'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },10000);
      setName('');
      setByName('')
      setContact('')
      setAddress('')
      setState('')
      setSupplyType(1)
      setBagWeight('')
      
    }catch(err){
      console.error('Unexpected Error Occured',err);
    }
  } 

  return (
    
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {alert.message !=="" && (
        <MessageBox type={alert.type} message={alert.message}/>
      )}
      <Text style={styles.heading}>Add Supplier</Text>

      {/* Supplier Name */}
      <Text style={styles.label}>Supply Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Supplier Name"
        value={name}
        onChangeText={setName}
      />

      {/* By Name */}
      <Text style={styles.label}>Supply ByName</Text>
      <TextInput
        style={styles.input}
        placeholder="By Name / Shop Name"
        value={byname}
        onChangeText={setByName}
      />

      {/* Contact */}
      <Text style={styles.label}>Supplier Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="numeric"
        value={contact}
        onChangeText={setContact}
      />

      {/* Address */}
      <Text style={styles.label}>Supplier Address</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Address"
        multiline
        value={address}
        onChangeText={setAddress}
      />

      {/* State Dropdown */}
      <Text style={styles.label}>State</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={state}
          onValueChange={(item) => setState(item)}
        >
          <Picker.Item label="Select State" value="" />
          {southStates.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </View>

      {/* Supply Type Dropdown */}
      <Text style={styles.label}>Supply Type</Text>
      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={supplyType}
          onValueChange={(item) => setSupplyType(item)}
        >
          <Picker.Item label="Sack / Bag Wise" value={1} />
          <Picker.Item label="Kg Wise" value={2} />
        </Picker>
      </View>

      {/* Bag Weight */}
      <Text style={styles.label}>Bag Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="Bag Weight in kg"
        keyboardType="numeric"
        value={bagWeight}
        onChangeText={setBagWeight}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={()=>AddSupplier()}>
        <Text style={styles.buttonText}>Add Supplier</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AddSupplier;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0+50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    marginTop: 10
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    marginBottom: 12
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginTop: 15
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18
  }
});
