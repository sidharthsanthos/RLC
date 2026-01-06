import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import PendingConsumerRow from './PCR';

const PendingConsumersScreen = ({ refreshKey }) => {
    const [consumers, setConsumers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const navigation = useNavigation();

    const fetchConsumers = async () => {
        try {
            setLoading(true);

            // Fetch top 5 consumers
            const { data, error } = await supabase
                .from('Consumers')
                .select('*')
                .gt('Pending_Amount', 0)
                .order('Pending_Amount', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching consumers:', error.message);
                return;
            }

            // Get total count of pending consumers
            const { count } = await supabase
                .from('Consumers')
                .select('*', { count: 'exact', head: true })
                .gt('Pending_Amount', 0);

            setConsumers(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsumers();
    }, [refreshKey]);

    const handleViewAll = () => {
        navigation.navigate('PendingConsumersList');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={styles.loadingText}>Loading consumers...</Text>
                </View>
            </View>
        );
    }

    if (consumers.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>✓</Text>
                    <Text style={styles.emptyText}>No pending consumers</Text>
                    <Text style={styles.emptySubtext}>All payments are up to date</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Top Pending Consumers</Text>
                {totalCount > 5 && (
                    <Pressable onPress={handleViewAll}>
                        <Text style={styles.viewAllText}>View All ({totalCount})</Text>
                    </Pressable>
                )}
            </View>

            <FlatList
                data={consumers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <PendingConsumerRow consumer={item} />}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

export default PendingConsumersScreen;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#e5e7eb'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    viewAllText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600'
    },
    separator: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 8
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    emptyIcon: {
        fontSize: 48,
        color: '#10b981',
        marginBottom: 12
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666'
    }
});
