import { Platform, StatusBar, StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PendingConsumersList = () => {
    
    const navigation = useNavigation();
    const [pendingConsumers, setPendingConsumers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPending, setTotalPending] = useState(0);

    const fetchPendingConsumers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Consumers')
                .select('*')
                .gt('Pending_Amount', 0)
                .order('Pending_Amount', { ascending: false });

            if (error) {
                console.error('Fetching error occurred', error.message);
                return;
            }

            setPendingConsumers(data || []);
            
            // Calculate total pending
            const total = data?.reduce((sum, consumer) => sum + Number(consumer.Pending_Amount || 0), 0) || 0;
            setTotalPending(total);

        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPendingConsumers();
        
        // Refresh when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPendingConsumers();
        });

        return unsubscribe;
    }, [navigation]);

    const renderConsumerCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ConsumerDetails', { consumerID: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.consumerInfo}>
                    <Text style={styles.consumerName}>{item.Name}</Text>
                    {item.By_Name && (
                        <Text style={styles.byName}>By: {item.By_Name}</Text>
                    )}
                    {item.Address && (
                        <Text style={styles.location}>
                            <Ionicons name="location-outline" size={12} color="#666" /> {item.Address}
                        </Text>
                    )}
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.pendingLabel}>Pending</Text>
                    <Text style={styles.pendingAmount}>₹{Number(item.Pending_Amount).toLocaleString()}</Text>
                </View>
            </View>
            
            {item.Contact && (
                <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.contactText}>{item.Contact}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading pending consumers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Pending Consumers</Text>
                    <View style={styles.totalCard}>
                        <Text style={styles.totalLabel}>Total Pending Amount</Text>
                        <Text style={styles.totalAmount}>₹{totalPending.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {pendingConsumers.length === 0 ? (
                <View style={styles.centerContent}>
                    <Ionicons name="checkmark-circle-outline" size={64} color="#51CF66" />
                    <Text style={styles.emptyText}>No pending consumers</Text>
                    <Text style={styles.emptySubtext}>All consumers are cleared!</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingConsumers}
                    renderItem={renderConsumerCard}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )
}

export default PendingConsumersList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f5f7fa',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    backBtn: {
        marginRight: 12,
        marginTop: 4
    },
    headerContent: {
        flex: 1
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12
    },
    totalCard: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB'
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    listContent: {
        padding: 16,
        paddingBottom: 32
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 }
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    consumerInfo: {
        flex: 1,
        marginRight: 12
    },
    consumerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    byName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2
    },
    location: {
        fontSize: 12,
        color: '#666',
        marginTop: 4
    },
    amountContainer: {
        alignItems: 'flex-end',
        backgroundColor: '#E3F2FD',
        padding: 8,
        borderRadius: 8
    },
    pendingLabel: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2
    },
    pendingAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    contactText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666'
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8
    }
})
