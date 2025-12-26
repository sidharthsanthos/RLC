import { Platform, StatusBar, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import { useNavigation } from '@react-navigation/native';


const PendingList = () => {
    
      const navigation=useNavigation();

      const [pendingData,setPendingData]=useState([]);

      const fetchPendingData=async ()=>{
          try{
              const {data,error}=await supabase
                .from('Suppliers')
                .select('id,Name,Pending_Amount')
                .gt('Pending_Amount',0)
                .order('Pending_Amount', { ascending:false });

              if(error){
                  console.error('Fetching error occured',error.message);
                  return;
              }

              setPendingData(data);
          }catch(err){
              console.error('Unexpected Error Occured',err);
          }
      }

      useEffect(()=>{
          fetchPendingData();
      },[]);

      const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={()=>navigation.navigate('SupplierDetails',{supplierID:item.id})}>
          <Text style={styles.itemName}>{item.Name}</Text>
          <Text style={styles.itemAmount}>Pending: ₹{item.Pending_Amount}</Text>
        </TouchableOpacity>
      );

      return  (
        <View style={styles.container}>
          <FlatList
            data={pendingData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        </View>
      )
}

export default PendingList

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        backgroundColor: '#f5f5f5',
    },
    itemContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemAmount: {
        fontSize: 16,
        color: '#ff0000',
        marginTop: 5,
    },
})