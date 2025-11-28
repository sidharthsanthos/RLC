import { Platform, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig'

const SupplierDetails = ({ route }) => {
    const { supplierID } = route.params;

    const [supplier, setSupplier] = useState(null);
    const [stock, setStock] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const fetchSupplier = async () => {
        try {
            const { data, error } = await supabase
                .from('Suppliers')
                .select('*')
                .eq('id', supplierID);

            if (error) return console.error(error.message);

            setSupplier(data[0]);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchStock = async () => {
        try {
            const { data, error } = await supabase
                .from('Stock')
                .select('*')
                .eq('Supplier_ID', supplierID)
                .order('created_at', { ascending: false });

            if (error) return console.error(error.message);

            setStock(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('Transactions')
                .select('*')
                .eq('ref_type', 'supplier')
                .eq('ref_id', supplierID)
                .order('created_at', { ascending: false });

            if (error) return console.error(error.message);

            setTransactions(data || []);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchSupplier();
        fetchStock();
        fetchTransactions();
    }, []);

    return (
        <ScrollView style={styles.container}>
            
            {/* TITLE */}
            <Text style={styles.title}>Supplier Details</Text>

            {/* SUPPLIER CARD */}
            <View style={styles.card}>
                <Text style={styles.supplierName}>{supplier?.Name}</Text>
                <Text style={styles.label}>Contact: <Text style={styles.value}>{supplier?.Contact}</Text></Text>
                <Text style={styles.label}>Address: <Text style={styles.value}>{supplier?.Address}</Text></Text>
                <Text style={styles.label}>State: <Text style={styles.value}>{supplier?.State}</Text></Text>

                <View style={styles.pendingBox}>
                    <Text style={styles.pendingText}>Pending Amount</Text>
                    <Text style={styles.pendingValue}>₹ {supplier?.Pending_Amount || 0}</Text>
                </View>
            </View>

            {/* STOCK DETAILS */}
            <Text style={styles.sectionTitle}>Latest Stock Entry</Text>
            {stock.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.label}>Date: <Text style={styles.value}>{stock[0].Date}</Text></Text>
                    <Text style={styles.label}>Quality: <Text style={styles.value}>{stock[0].Quality}</Text></Text>
                    <Text style={styles.label}>Stock Type: <Text style={styles.value}>{stock[0].Stock_Type}</Text></Text>
                    <Text style={styles.label}>Bags: <Text style={styles.value}>{stock[0].Total_Bags}</Text></Text>
                    <Text style={styles.label}>Unit Type: <Text style={styles.value}>{stock[0].Unit_Type === 1 ? "Sack Wise" : "Kg Wise"}</Text></Text>
                    <Text style={styles.label}>Total Amount: <Text style={styles.value}>₹ {stock[0].Total_Amount}</Text></Text>
                </View>
            ) : (
                <Text style={styles.noData}>No stock records found</Text>
            )}

            {/* TRANSACTION DETAILS */}
            <Text style={styles.sectionTitle}>Latest Payment</Text>
            {transactions.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.label}>Date: <Text style={styles.value}>{transactions[0].date}</Text></Text>
                    <Text style={styles.label}>Amount: <Text style={styles.value}>₹ {transactions[0].amount}</Text></Text>
                    <Text style={styles.label}>Mode: <Text style={styles.value}>{transactions[0].mode}</Text></Text>
                    <Text style={styles.label}>Type: <Text style={styles.value}>{transactions[0].transaction_type}</Text></Text>
                    {transactions[0].remarks && (
                        <Text style={styles.label}>Remarks: <Text style={styles.value}>{transactions[0].remarks}</Text></Text>
                    )}
                </View>
            ) : (
                <Text style={styles.noData}>No transactions found</Text>
            )}

        </ScrollView>
    );
};

export default SupplierDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        padding: 14,
        backgroundColor: "#F8F9FA"
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 10,
        color: "#333"
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
        fontSize: 18,
        fontWeight: "600",
        color: "#444"
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    supplierName: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 10,
        color: "#000"
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
        marginTop: 4
    },
    value: {
        fontWeight: "500",
        color: "#222"
    },
    pendingBox: {
        backgroundColor: "#FFE8E8",
        padding: 12,
        borderRadius: 10,
        marginTop: 16,
        alignItems: "center"
    },
    pendingText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#B20000"
    },
    pendingValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#B20000",
        marginTop: 4
    },
    noData: {
        fontSize: 14,
        color: "#888",
        fontStyle: "italic",
        marginBottom: 10
    }
});