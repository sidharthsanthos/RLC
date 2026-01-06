import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';

const StockValue = () => {

    const [stock,setStock]=useState([]);

    const fetchStock=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Stock')
               .select('*,Suppliers(Name,Supply_Type)')
               .order('created_at',{ascending:false})

            if(error){
                console.error('Fetching Stock Error Occured',error.message);
                return;
            }

            console.log('Stock Data with Names:',data);
            setStock(data);
            
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchStock();
    },[]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Stock Value</Text>
            {stock.map(item => (
                <View key={item.id} style={styles.stockItem}>
                    <Text style={styles.supplierName}>{item.Suppliers.Name}</Text>
                    <Text>{`Net Quantity: ${item.net_quantity} ${item.Suppliers.Supply_Type === 1 ? 'bags' : 'kg'}`}</Text>
                    <Text>{`Date: ${new Date(item.created_at).toLocaleDateString()}`}</Text>
                </View>
            ))}
        </ScrollView>
    )
}

export default StockValue

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    stockItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    supplierName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
})