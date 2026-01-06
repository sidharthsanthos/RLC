import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { useNavigation } from '@react-navigation/native';
import KPI from '../ConsumerDashboard/KPI';
import MonthlyTransactionChart from '../ConsumerDashboard/MTC';
import PendingConsumers from '../ConsumerDashboard/PendingConsumers';

const ConsumerDashboardMain = () => {

    const navigation = useNavigation();    
    const [searchText, setSearchText] = useState('');
    const [consumers, setConsumers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchConsumers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Consumers')
                .select('id, Name, By_Name')
                .order('Name', { ascending: true });
            
            if (error) {
                console.error('Consumer Selection Error Occurred:', error.message);
                return;
            }

            setConsumers(data || []);
        } catch (err) {
            console.error('Unexpected Error Occurred:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchConsumers();
    }, []);

    useEffect(() => {
        if (searchText.trim() === "") {
            setFiltered([]);
            return;
        }

        const results = consumers.filter(item =>
            item.Name.toLowerCase().includes(searchText.toLowerCase())
        );

        setFiltered(results);
    }, [searchText, consumers]);

    const clearSearch = () => {
        setSearchText('');
        setFiltered([]);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name='search' size={20} color='#888' style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search consumers...'
                    placeholderTextColor='#999'
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType='search'
                />
                {searchText.length > 0 && (
                    <Pressable onPress={clearSearch} style={styles.clearButton}>
                        <Ionicons name='close-circle' size={20} color='#888' />
                    </Pressable>
                )}
            </View>

            {searchText ? (
                /* Search Results View */
                <View style={styles.searchResultsContainer}>
                    {filtered.length > 0 && (
                        <Text style={styles.resultsHeader}>
                            {filtered.length} {filtered.length === 1 ? 'result' : 'results'} for "{searchText}"
                        </Text>
                    )}

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Pressable 
                                style={({ pressed }) => [
                                    styles.consumerCard,
                                    pressed && styles.consumerCardPressed
                                ]} 
                                onPress={() => navigation.navigate("ConsumerDetails", { consumerID: item.id })}
                            >
                                <View style={styles.consumerIconContainer}>
                                    <Ionicons name="person-outline" size={24} color="#2563EB" />
                                </View>
                                <View style={styles.consumerInfo}>
                                    <Text style={styles.consumerName}>{item.Name}</Text>
                                    {item.By_Name && (
                                        <Text style={styles.consumerSubtext}>By: {item.By_Name}</Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                            </Pressable>
                        )}
                        contentContainerStyle={styles.searchListContent}
                        showsVerticalScrollIndicator={false}
                    />

                    {filtered.length === 0 && !loading && (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="search-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>No consumers found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Try searching with a different name
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                /* Dashboard View */
                <ScrollView 
                    style={styles.dashboardScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.dashboardContent}
                    refreshControl={
                        <RefreshControl
                           refreshing={refreshing}
                           onRefresh={onRefresh}
                           colors={['#2563EB']}
                        />
                    }   
                >
                    {/* Add Consumer Card */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addConsumerCard,
                            pressed && styles.addConsumerCardPressed
                        ]}
                        onPress={() => navigation.navigate('AddConsumer')}
                    >
                        <View style={styles.addConsumerIcon}>
                            <Ionicons name="add-circle" size={28} color="#2563EB" />
                        </View>
                        <View style={styles.addConsumerContent}>
                            <Text style={styles.addConsumerTitle}>Add New Consumer</Text>
                            <Text style={styles.addConsumerSub}>Create a new consumer entry</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#2563EB" />
                    </Pressable>

                    {/* KPI Cards */}
                    <KPI refreshKey={refreshKey} />

                    {/* Monthly Chart */}
                    <MonthlyTransactionChart refreshKey={refreshKey} />

                    {/* Pending Consumers */}
                    <PendingConsumers refreshKey={refreshKey} />

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}
        </View>
    );
}

export default ConsumerDashboardMain;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f5f5f7',
    },

    // Search Bar Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
    },

    clearButton: {
        padding: 4,
    },

    // Search Results Styles
    searchResultsContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },

    resultsHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        color: '#666',
    },

    searchListContent: {
        paddingBottom: 20,
    },

    consumerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },

    consumerCardPressed: {
        backgroundColor: '#f9fafb',
    },

    consumerIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    consumerInfo: {
        flex: 1,
    },

    consumerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },

    consumerSubtext: {
        fontSize: 13,
        color: '#666',
    },

    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },

    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: 16,
        marginBottom: 8,
    },

    emptyStateSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },

    // Dashboard Styles
    dashboardScroll: {
        flex: 1,
    },

    dashboardContent: {
        paddingBottom: 20,
    },

    addConsumerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#BBDEFB',
        elevation: 2,
        shadowColor: '#2563EB',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },

    addConsumerCardPressed: {
        backgroundColor: '#E3F2FD',
        borderColor: '#90CAF9',
    },

    addConsumerIcon: {
        marginRight: 12,
    },

    addConsumerContent: {
        flex: 1,
    },

    addConsumerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },

    addConsumerSub: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    bottomSpacer: {
        height: 20,
    },
});
