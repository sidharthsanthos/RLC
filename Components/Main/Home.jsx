import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { supabase } from '../../utils/supabase';

const Home = () => {

  const checksb=async ()=>{
    try{
      const {data,error}=await supabase
        .from('Suppliers')
        .select('*')
        .limit(1);
        
      const {data:stockData,error:stockError}=await supabase
        .from('Stock')
        .select('*')
        .eq('Stock_Type','in-stock')
        .limit(1);

      const {data:transactionData,error:transactionError}=await supabase
        .from('Transactions')
        .select('*')
        .eq('ref_type','supplier')
        .limit(1);
      
      if(error){
        console.error('Selection Error Occured',error.message);
        return;
      }

      if(stockError){
        console.error('Stock Selection Error Occured',stockError.message);
        return;
      }

      if(transactionError){
        console.error('Transaction Selection Error Occured',transactionError.message);
        return;
      }

      console.log('transaction data :',transactionData);
      

      console.log('stock data :',stockData);
      

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