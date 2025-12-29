import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabaseConfig';
import PendingSupplierRow from './PSR';

const PendingSuppliersScreen = ({refreshKey}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const navigation = useNavigation();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      // Fetch top 5 suppliers
      const { data, error } = await supabase
        .from('Suppliers')
        .select('*')
        .gt('Pending_Amount', 0) // Only suppliers with pending amounts
        .order('Pending_Amount', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching suppliers:', error.message);
        return;
      }

      // Get total count of pending suppliers
      const { count } = await supabase
        .from('Suppliers')
        .select('*', { count: 'exact', head: true })
        .gt('Pending_Amount', 0);

      setSuppliers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [refreshKey]);

  const handleViewAll = () => {
    // Navigate to a full list screen
    navigation.navigate('AllPendingSuppliers'); // Create this screen if needed
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading suppliers...</Text>
        </View>
      </View>
    );
  }

  if (suppliers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyText}>No pending suppliers</Text>
          <Text style={styles.emptySubtext}>All payments are up to date</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Pending Suppliers</Text>
          <Text style={styles.subtitle}>
            {totalCount} {totalCount === 1 ? 'supplier' : 'suppliers'} with pending payments
          </Text>
        </View>
      </View>

      {/* List Section */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <PendingSupplierRow
            supplier={item}
            onPress={() =>
              navigation.navigate('SupplierDetails', {
                supplierID: item.id
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        // showsVerticalScrollIndicator={false}
      />

      {/* View All Footer - Only show if there are more than 5 suppliers */}
      {totalCount > 5 && (
        <View style={styles.footer}>
          <Pressable
            onPress={handleViewAll}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.viewAllButtonPressed
            ]}
          >
            <Text style={styles.viewAllText}>
              View All {totalCount} Suppliers
            </Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default PendingSuppliersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  viewAllButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4f46e5',
    marginRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#4f46e5',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});