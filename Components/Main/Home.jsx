import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { supabase } from '../supabaseConfig'

const Home = () => {

  const checksb=async ()=>{
    try{
      const {data,error}=await supabase
        .from('Suppliers')
        .select('*');
      
      if(error){
        console.error('Selection Error Occured',error.message);
        return;
      }

      console.log('data:',data);
      
    }catch(error){
      console.error('Unexpected Error Occured',error);
    }
  }
  useEffect(()=>{
    checksb()
  },[]);

  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});