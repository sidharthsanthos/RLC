import { FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { TransactionItem } from './ConsumerDetails';

const RecentTransactions = ({route}) => {
    const {consumerID, consumer} = route.params;
    
    const [transactions, setTransactions] = useState([]);

    const fetchTransactions = async () => {
        try {
            const {data, error} = await supabase
               .from('Transactions')
               .select('*')
               .eq('ref_id', consumerID)
               .eq('ref_type', 'consumer')
               .eq('transaction_type', 'credit')
               .order('created_at', {ascending: false});

            if (error) {
                console.error('Transactions Fetching Error Occurred', error.message);
                return;
            }

            setTransactions(data || []);
        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        }
    }

    useEffect(() => {
        fetchTransactions();
    }, []);
    
    return (
        <View style={styles.container}>
            {transactions && transactions.length > 0 ? (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <TransactionItem item={item} index={index} consumer={consumer} />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={true}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="receipt-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
            )}
        </View>
    )
}

export default RecentTransactions

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#F5F7FA',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
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
