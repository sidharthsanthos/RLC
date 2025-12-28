import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseConfig';
import { useNavigation } from '@react-navigation/native';
import KPI from '../Dashboard/KPI';
import MonthlyTransactionChart from '../Dashboard/MTC';
import PendingSuppliersScreen from '../Dashboard/PendingSuppliers';

const SMain = () => {

    const navigation = useNavigation();    
    const [searchText, setSearchText] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing,setRefreshing]=useState(false);
    const [refreshKey,setRefreshKey]=useState(0);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Suppliers')
                .select('id, Name, By_Name')
                .order('Name', { ascending: true });
            
            if (error) {
                console.error('Supplier Selection Error Occurred:', error.message);
                return;
            }

            setSuppliers(data || []);
        } catch (err) {
            console.error('Unexpected Error Occurred:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (searchText.trim() === "") {
            setFiltered([]);
            return;
        }

        const results = suppliers.filter(item =>
            item.Name.toLowerCase().includes(searchText.toLowerCase())
        );

        setFiltered(results);
    }, [searchText, suppliers]);

    const clearSearch = () => {
        setSearchText('');
        setFiltered([]);
    };

    const onRefresh=async ()=>{
        setRefreshing(true);

        setRefreshKey(prev=>prev+1)

        setTimeout(()=>{
            setRefreshing(false);
        },500);
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name='search' size={20} color='#888' style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search suppliers...'
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
                                    styles.supplierCard,
                                    pressed && styles.supplierCardPressed
                                ]} 
                                onPress={() => navigation.navigate("SupplierDetails", { supplierID: item.id })}
                            >
                                <View style={styles.supplierIconContainer}>
                                    <Ionicons name="business-outline" size={24} color="#4f46e5" />
                                </View>
                                <View style={styles.supplierInfo}>
                                    <Text style={styles.supplierName}>{item.Name}</Text>
                                    {item.By_Name && (
                                        <Text style={styles.supplierSubtext}>By: {item.By_Name}</Text>
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
                            <Text style={styles.emptyStateText}>No suppliers found</Text>
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
                           colors={['#4f46e5']}
                        />
                    }   
                >
                    {/* Add Supplier Card */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addSupplierCard,
                            pressed && styles.addSupplierCardPressed
                        ]}
                        onPress={() => navigation.navigate('AddSupplier')}
                    >
                        <View style={styles.addSupplierIcon}>
                            <Ionicons name="add-circle" size={28} color="#4f46e5" />
                        </View>
                        <View style={styles.addSupplierContent}>
                            <Text style={styles.addSupplierTitle}>Add New Supplier</Text>
                            <Text style={styles.addSupplierSub}>Create a new supplier entry</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="#4f46e5" />
                    </Pressable>

                    {/* KPI Cards */}
                    <KPI refreshKey={refreshKey}/>

                    {/* Monthly Chart */}
                    <MonthlyTransactionChart refreshKey={refreshKey}/>

                    {/* Pending Suppliers */}
                    <PendingSuppliersScreen refreshKey={refreshKey}/>

                    {/* Bottom Spacing */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            )}
        </View>
    );
}

export default SMain;

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

    supplierCard: {
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

    supplierCardPressed: {
        backgroundColor: '#f9fafb',
    },

    supplierIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f1ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    supplierInfo: {
        flex: 1,
    },

    supplierName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },

    supplierSubtext: {
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

    addSupplierCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 18,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e5e7ff',
        elevation: 2,
        shadowColor: '#4f46e5',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },

    addSupplierCardPressed: {
        backgroundColor: '#f8f9ff',
        borderColor: '#d1d5ff',
    },

    addSupplierIcon: {
        marginRight: 12,
    },

    addSupplierContent: {
        flex: 1,
    },

    addSupplierTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 2,
    },

    addSupplierSub: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    bottomSpacer: {
        height: 20,
    },
});