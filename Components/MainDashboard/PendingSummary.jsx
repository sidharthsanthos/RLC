import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const PendingSummary = ({ navigation }) => {

  const [pending, setPending] = useState({
    pay: 0,
    receive: 0,
  })

  const [loading, setLoading] = useState(true)

  const [activeModal, setActiveModal] = useState(null) // 'Supplier' | 'Consumer'
  const [modalData, setModalData] = useState([])
  const [modalLoading, setModalLoading] = useState(false)

  // FETCH TOTAL PENDING
  const fetchPending = async () => {
    try {

      const { data: consumerData, error: consumerError } =
        await supabase
          .from('Consumers')
          .select('Pending_Amount')

      const { data: supplierData, error: supplierError } =
        await supabase
          .from('Suppliers')
          .select('Pending_Amount')

      if (consumerError || supplierError) {
        console.error('Pending fetch error', consumerError || supplierError)
        return
      }

      const receiveTotal =
        consumerData?.reduce(
          (sum, row) => sum + (row.Pending_Amount || 0),
          0
        ) || 0

      const payTotal =
        supplierData?.reduce(
          (sum, row) => sum + (row.Pending_Amount || 0),
          0
        ) || 0

      setPending({
        receive: receiveTotal,
        pay: payTotal,
      })

    } catch (err) {
      console.error("Pending fetch unexpected error", err)
    } finally {
      setLoading(false)
    }
  }

  // FETCH MODAL DATA
  const fetchModalData = async (type) => {

    setActiveModal(type)
    setModalLoading(true)
    setModalData([])

    try {

      const table = type === 'Supplier' ? 'Suppliers' : 'Consumers'

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .gt('Pending_Amount', 0)

      if (error) {
        console.error("Modal fetch error", error.message)
        return
      }

      setModalData(data || [])

    } catch (err) {
      console.error("Unexpected modal fetch error", err)
    } finally {
      setModalLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  return (
    <View style={styles.card}>

      <Text style={styles.title}>Pending</Text>

      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : (

        <View style={styles.row}>

          <TouchableOpacity
            style={[styles.tile, styles.receiveTile]}
            onPress={() => fetchModalData('Consumer')}
          >
            <Text style={styles.label}>To Receive</Text>
            <Text style={styles.amount}>₹ {pending.receive}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tile, styles.payTile]}
            onPress={() => fetchModalData('Supplier')}
          >
            <Text style={styles.label}>To Pay</Text>
            <Text style={styles.amount}>₹ {pending.pay}</Text>
          </TouchableOpacity>

        </View>
      )}

      {/* MODAL */}

      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'Supplier'
                  ? 'Pending Payments'
                  : 'Pending Receivables'}
              </Text>

              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>


            {/* Content */}
            {modalLoading ? (

              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
              </View>

            ) : modalData.length > 0 ? (

              <FlatList
                data={modalData}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}

                renderItem={({ item }) => (

                  <TouchableOpacity
                    style={styles.partyCard}
                    onPress={() => {
                      setActiveModal(null)

                      navigation.navigate(
                        activeModal === 'Supplier'
                          ? 'SupplierDetails'
                          : 'ConsumerDetails',
                        { id: item.id }
                      )
                    }}
                  >

                    {/* Name */}
                    <Text style={styles.partyName}>
                      {item.Name}
                    </Text>

                    {/* Amount */}
                    <View style={styles.amountBadge}>
                      <Text style={styles.amountText}>
                        ₹ {item.Pending_Amount}
                      </Text>
                    </View>

                  </TouchableOpacity>

                )}
              />

            ) : (

              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No Pending Records
                </Text>
              </View>

            )}

          </View>

        </View>
      </Modal>

    </View>
  )
}

export default PendingSummary

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  tile: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 10,

    // 🔑 Center content
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 12,
    color: '#555',
  },

  amount: {
    marginTop: 8,
    fontSize: 20,        // ⬆ increased
    fontWeight: '800',   // ⬆ stronger emphasis
    color: '#111',
  },

  receiveTile: {
    backgroundColor: '#FDECEA', // soft red
  },

  payTile: {
    backgroundColor: '#FFF3E0', // amber
  },

  info: {
    fontSize: 12,
    color: '#999',
  },

  modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},

modalContent: {
  width: '80%',
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 12,
  alignItems: 'center',
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 10,
},

modalAmount: {
  fontSize: 26,
  fontWeight: 'bold',
  marginBottom: 20,
},

closeBtn: {
  backgroundColor: '#333',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},

closeText: {
  color: '#fff',
  fontWeight: '600',
},

listItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 12,
  paddingHorizontal: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},

itemName: {
  fontSize: 16,
  fontWeight: '500',
},

itemAmount: {
  fontSize: 16,
  fontWeight: '600',
  color: '#d9534f',
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',
  justifyContent: 'center',
  alignItems: 'center'
},

modalContainer: {
  width: '90%',
  maxHeight: '75%',
  backgroundColor: '#fff',
  borderRadius: 14,
  paddingHorizontal: 18,
  paddingVertical: 20,
  elevation: 8
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16
},

modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#222'
},

closeIcon: {
  fontSize: 20,
  color: '#777'
},

loadingContainer: {
  paddingVertical: 30,
  alignItems: 'center'
},

loadingText: {
  fontSize: 15,
  color: '#777'
},

emptyContainer: {
  paddingVertical: 30,
  alignItems: 'center'
},

emptyText: {
  fontSize: 15,
  color: '#888'
},

partyCard: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 10,
  backgroundColor: '#f8f9fb',
  marginBottom: 10
},

partyName: {
  fontSize: 16,
  fontWeight: '500',
  color: '#333'
},

amountBadge: {
  backgroundColor: '#ffeaea',
  paddingVertical: 5,
  paddingHorizontal: 12,
  borderRadius: 8
},

amountText: {
  color: '#d22',
  fontWeight: '600',
  fontSize: 15
},

});