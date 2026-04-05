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
    
    const len=contact.length;

    if(name==='' || contact===''){
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
        .from("Consumers")
        .insert({
          Name:name,
          By_Name:byname,
          Contact:contact,
          Address:address
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
      setAlert({type:'success',message:'Consumer Added Successfully'});
      setTimeout(()=>{
        setAlert({type:'',message:''});
        return;
      },10000);
      setName('');
      setByName('')
      setContact('')
      setAddress('')
      
    }catch(err){
      console.error('Unexpected Error Occured',err);
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
      <Text style={styles.label}>Consumer ByName</Text>
      <TextInput
        style={styles.input}
        placeholder="By Name / Shop Name"
        value={byname}
        onChangeText={setByName}
      />

      {/* Contact */}
      <Text style={styles.label}>Consumer Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        keyboardType="numeric"
        value={contact}
        onChangeText={setContact}
      />

      {/* Address */}
      <Text style={styles.label}>Consumer Address</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 50 : 50,
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