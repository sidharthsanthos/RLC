import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';

const InventoryTrendCard = () => {

  const [data, setData] = useState(null);
  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTodayInventory = async () => {
    const today = new Date().toLocaleDateString('en-CA').split('T')[0];
    console.log('today:', today);


    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('daily_inventory_summary')
        .select('*')
        .eq('date', today)

      if (error) {
        console.error('Fetching View Error Occured', error.message);
        return;
      }

      console.log('data:', data[0]);


      setData(data[0]);

      const { data: suppliersData, error: suppliersError } = await supabase
        .from('daily_supplier_supply')
        .select('supplier_name, total_bags')
        .eq('date', today)
        .order('total_bags', { ascending: false });

      if (!suppliersError && suppliersData) {
        setSupplierData(suppliersData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Unexpected Error Occured', err);
    }
  }

  useEffect(() => {
    fetchTodayInventory();
  }, []);

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading Inventory....</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>No inventory data for today</Text>
      </View>
    )
  }

  return (
    <View>
      <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Text style={styles.title}>Today's Inventory</Text>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, styles.totalBox]}>
            <Text style={styles.label}>Total Bags</Text>
            <Text style={[styles.value, styles.totalValue]}>{data.total_bags ? data.total_bags : '0'}</Text>
          </View>

          <View style={[styles.statBox, styles.soldBox]}>
            <Text style={styles.label}>Sold</Text>
            <Text style={[styles.value, styles.soldValue]}>{data.sold_bags ? data.sold_bags : '0'}</Text>
          </View>

          <View style={[styles.statBox, styles.remainingBox]}>
            <Text style={styles.label}>Remaining</Text>
            <Text style={[styles.value, styles.remainingValue]}>{data.remaining_bags ? data.remaining_bags : '0'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Inventory Details</Text>

              <View style={styles.modalDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Total Bags:</Text>
                  <Text style={[styles.modalValue, styles.totalValue]}>{data.total_bags || '0'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Sold Bags:</Text>
                  <Text style={[styles.modalValue, styles.soldValue]}>{data.sold_bags || '0'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Remaining Bags:</Text>
                  <Text style={[styles.modalValue, styles.remainingValue]}>{data.remaining_bags || '0'}</Text>
                </View>
              </View>

              <Text style={styles.modalSubtitle}>Today's Supplies</Text>
              <View style={styles.suppliersList}>
                {supplierData.length > 0 ? (
                  supplierData.map((item, index) => (
                    <View key={index} style={styles.supplierRow}>
                      <View style={styles.supplierInfo}>
                        <View style={styles.supplierAvatar}>
                          <Text style={styles.supplierAvatarText}>
                            {item.supplier_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.supplierName} numberOfLines={1}>{item.supplier_name}</Text>
                      </View>
                      <View style={styles.supplierBagsContainer}>
                        <Text style={styles.supplierBags}>{item.total_bags}</Text>
                        <Text style={styles.supplierBagsLabel}>bags</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noSuppliersText}>No supplies recorded today.</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default InventoryTrendCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalBox: {
    backgroundColor: '#F0F4FF',
  },
  soldBox: {
    backgroundColor: '#FFF0EE',
  },
  remainingBox: {
    backgroundColor: '#E8F5E9',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  totalValue: {
    color: '#2563EB',
  },
  soldValue: {
    color: '#E5533D',
  },
  remainingValue: {
    color: '#2E7D32',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 10,
    marginBottom: 16,
  },
  suppliersList: {
    marginBottom: 24,
  },
  supplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
  },
  supplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  supplierAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supplierAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4338CA',
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    textTransform: 'capitalize',
  },
  supplierBagsContainer: {
    alignItems: 'flex-end',
  },
  supplierBags: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  supplierBagsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  noSuppliersText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
})