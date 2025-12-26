import { FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import { TransactionItem } from './SupplierDetails';
import { Ionicons } from '@expo/vector-icons';


const PaymentDetails = ({route}) => {
    const {supplierID}=route.params;

    const [payments,setPayments]=useState(null);

    const fetchPayments=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Transactions')
               .select('*')
               .eq('ref_type','supplier')
               .eq('ref_id',supplierID);
            
            if(error){
                console.error('Transactions Fetching Error Occured',error.message);
                return;
            }

            setPayments(data);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchPayments();
    },[]);

    return (
        <View style={styles.container}>
        <Text>PaymentDetails:{supplierID?supplierID:'Supplier ID Not Found'}</Text>
        {payments && payments.length > 0 ? (
            <FlatList
               data={payments}
               keyExtractor={(item)=>item.id.toString()}
               renderItem={({ item,index }) => (
                    <TransactionItem item={item} index={index}/>
               )}
               ItemSeparatorComponent={()=><View style={styles.separator}/>}
               scrollEnabled={true}
            />
        ):(
            <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color="#E0E0E0" />
                <Text style={styles.emptyText}>No payments yet</Text>
            </View>
        )}
        </View>
    )
}

export default PaymentDetails

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:0,
    },
})