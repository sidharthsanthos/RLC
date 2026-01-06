import { Platform, StatusBar, StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';

const PTM = () => {

    const [transactions,setTransactions]=useState(null);

    const fetchTransactions=async ()=>{
        try{
            const {data,error}=await supabase
               .from('dashboard_supplier_transactions_month')
               .select('*');

            if(error){
                console.error('Transactions Fetching Error Occured',error.message);
                return;
            }

            setTransactions(data);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchTransactions();
    },[]);

    const getModeColor = (mode) => {
        switch (mode.toLowerCase()) {
            case 'upi':
                return '#d4edda'; // Light green
            case 'cash':
                return '#f8d7da'; // Light red
            case 'bank':
                return '#cce5ff'; // Light blue
            default:
                return '#e2e3e5'; // Light gray
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, { backgroundColor: getModeColor(item.mode) }]}>
            <View style={styles.itemHeader}>
                <Text style={styles.supplierName}>{item.supplier_name?.toUpperCase()}</Text>
                <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.itemFooter}>
                <Text style={styles.date}>{new Date(item.transaction_date).toLocaleDateString()}</Text>
                <Text style={styles.mode}>{item.mode}</Text>
            </View>
        </View>
    );

    if (!transactions) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.transaction_id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    )
}

export default PTM

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f8f9fa',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    supplierName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 14,
        color: '#6c757d',
    },
    mode: {
        fontSize: 14,
        fontWeight: '500',
        color: '#495057',
        textTransform: 'capitalize',
    },
})