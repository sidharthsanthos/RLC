import { FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { OrderItem } from './ConsumerDetails';

const OrderDetails = ({route}) => {
    const {consumerID}=route.params;
    
    const [orders,setOrders]=useState([]);

    const fetchOrders=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Stock')
               .select('*')
               .eq('Consumer_ID',consumerID)
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
            <Text>OrderDetails:{consumerID?consumerID:'No Consumer ID'}</Text>
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
                    <Ionicons name="cart-outline" size={48} color="#E0E0E0" />
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
    emptyState: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        marginTop: 20,
        marginHorizontal: 20
    },
    emptyText: {
        color: "#999",
        marginTop: 12,
        fontSize: 15,
    },
})
