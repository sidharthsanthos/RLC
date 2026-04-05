import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';

const AddSupplier = () => {

  const [name, setName] = useState('');
  const [byname, setByName] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [supplyType, setSupplyType] = useState(1);
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
          Supply_Type:supplyType
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
        {alert.message !=="" && (
          <View style={styles.alertWrap}>
            <MessageBox type={alert.type} message={alert.message}/>
          </View>
        )}
        
        <Text style={styles.heading}>Add New Supplier</Text>

        {/* Main Form Card */}
        <View style={styles.card}>
          {/* Supplier Name */}
          <Text style={styles.label}>Supplier Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter supplier name"
            value={name}
            onChangeText={setName}
          />

          {/* By Name */}
          <Text style={styles.label}>By Name / Shop Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter by name or shop name"
            value={byname}
            onChangeText={setByName}
          />

          {/* Contact */}
          <Text style={styles.label}>Contact Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="numeric"
            maxLength={10}
            value={contact}
            onChangeText={setContact}
          />

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter supplier address"
            multiline
            numberOfLines={3}
            value={address}
            onChangeText={setAddress}
          />

          {/* State Dropdown */}
          <Text style={styles.label}>State *</Text>
          <View style={styles.pickerWrap}>
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
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={supplyType}
              onValueChange={(item) => setSupplyType(item)}
            >
              <Picker.Item label="Sack / Bag Wise" value={1} />
              <Picker.Item label="Kg Wise" value={2} />
            </Picker>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={()=>AddSupplier()}>
          <Ionicons name="add-circle" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.buttonText}>Add Supplier</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default AddSupplier;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
  },
  
  alertWrap: {
    marginBottom: 12,
  },
  
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: '#444'
  },
  
  input: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  textArea: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    height: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  pickerWrap: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  button: {
    backgroundColor: '#51CF66',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
