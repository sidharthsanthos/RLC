import { FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { OrderItem } from './SupplierDetails';

const OrderDetails = ({route}) => {
    const {supplierID}=route.params;
    
    const [orders,setOrders]=useState([]);

    const fetchOrders=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Stock')
               .select('*')
               .eq('Supplier_ID',supplierID)
               .order('created_at',{ascending:false});

            if(error){
                console.error('Stock Fetching Error Occured',error.message);
                return;
            }

            setOrders(data)
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchOrders();
    },[]);
    
    return (
        <View style={styles.container}>
            <Text>OrderDetails:{supplierID?supplierID:'No Supplier ID'}</Text>
            {orders && orders.length > 0 ? (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <OrderItem item={item} index={index} />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    scrollEnabled={true}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="cube-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.emptyText}>No orders yet</Text>
                </View>
            )}
        </View>
    )
}

export default OrderDetails

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:0,
    },
    separator: {
        height: 12,
    },
})