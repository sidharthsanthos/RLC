import { Platform, StatusBar, StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';

const CTM = () => {

    const [transactions, setTransactions] = useState(null);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('consumer_transactions_this_month')
                .select('*');

            if (error) {
                console.error('Transactions Fetching Error Occurred', error.message);
                return;
            }

            setTransactions(data);
        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getModeColor = (mode) => {
        switch (mode?.toLowerCase()) {
            case 'upi':
                return '#d4edda';
            case 'cash':
                return '#f8d7da';
            case 'bank':
                return '#cce5ff';
            default:
                return '#e2e3e5';
        }
    };

    const getTypeColor = (type) => {
        return type === 'debit' ? '#fff3cd' : '#d1ecf1';
    };

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, { backgroundColor: getModeColor(item.mode) }]}>
            <View style={styles.itemHeader}>
                <Text style={styles.consumerName}>{item.consumer_name?.toUpperCase()}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.transaction_type) }]}>
                    <Text style={styles.typeText}>
                        {item.transaction_type === 'debit' ? 'SALE' : 'PAYMENT'}
                    </Text>
                </View>
            </View>
            <View style={styles.itemBody}>
                <Text style={styles.amount}>₹{parseFloat(item.amount).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.itemFooter}>
                <Text style={styles.date}>{new Date(item.transaction_date).toLocaleDateString('en-IN')}</Text>
                <Text style={styles.mode}>{item.mode || 'N/A'}</Text>
            </View>
            {item.remarks && (
                <Text style={styles.remarks}>{item.remarks}</Text>
            )}
        </View>
    );

    if (!transactions) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (transactions.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.emptyText}>No transactions this month</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Consumer Transactions This Month</Text>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

export default CTM

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        backgroundColor: '#f5f7fa'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        color: '#333'
    },
    listContent: {
        padding: 16
    },
    itemContainer: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    consumerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    typeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333'
    },
    itemBody: {
        marginBottom: 8
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    date: {
        fontSize: 13,
        color: '#666'
    },
    mode: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        textTransform: 'uppercase'
    },
    remarks: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic'
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center'
    }
})
