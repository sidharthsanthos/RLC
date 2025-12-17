import { Platform, StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';

const AddConsumer = () => {

  const [name, setName] = useState('');
  const [byname, setByName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [alert,setAlert]=useState({type:'',message:''});

  const saveConsumer=async ()=>{
    
    if(name===''){
      setAlert({type:'error', message:'Fill Essential Fields'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },3000);
      return;
    }

    try{
      const payload = {
          Name: name,
          By_Name: byname,
      };
      
      // Conditionally add other fields if they are filled (assuming schema supports them, if not they might be ignored or cause error depending on strictness, but we start with what we know)
      if (contact) payload.Contact = contact;
      if (address) payload.Address = address;

      const {error}=await supabase
        .from("Consumers")
        .insert(payload)

      if(error){
        setAlert({type:'error',message:error.message});
        setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
        },3000);
        return;
      }

      setAlert({type:'success',message:'Consumer Added Successfully'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },5000);
      
      setName('');
      setByName('');
      setContact('');
      setAddress('');
      
    }catch(err){
      console.error('Unexpected Error Occurred',err);
    }
  } 

  return (
    
    <View style={styles.container}>
      {alert.message !=="" && (
        <MessageBox type={alert.type} message={alert.message}/>
      )}
      <Text style={styles.heading}>Add Consumer</Text>

      {/* Consumer Name */}
      <Text style={styles.label}>Consumer Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Consumer Name"
        value={name}
        onChangeText={setName}
      />

      {/* By Name */}
      <Text style={styles.label}>By Name / Alias</Text>
      <TextInput
        style={styles.input}
        placeholder="By Name"
        value={byname}
        onChangeText={setByName}
      />

      {/* Contact */}
      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="numeric"
        value={contact}
        onChangeText={setContact}
      />

      {/* Address */}
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Address"
        multiline
        value={address}
        onChangeText={setAddress}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={()=>saveConsumer()}>
        <Text style={styles.buttonText}>Add Consumer</Text>
      </TouchableOpacity>

    </View>
  )
}

export default AddConsumer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0+50,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
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