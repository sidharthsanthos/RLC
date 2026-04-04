import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const CollectionsCard = () => {
  const [totals, setTotals] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('Transactions')
      .select('amount, mode')
      .eq('transaction_type', 'credit')
      .eq('date', today)

    if (!error && data) {
      const result = { total: 0, upi: 0, bank: 0, cash: 0 }

      data.forEach(txn => {
        result.total += txn.amount

        if (txn.mode === 'upi') result.upi += txn.amount
        if (txn.mode === 'bank') result.bank += txn.amount
        if (txn.mode === 'cash') result.cash += txn.amount
      })

      setTotals(result)
    }

    setLoading(false)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Collections</Text>

      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : !totals ? (
        <Text style={styles.info}>No collections today</Text>
      ) : (
        <View style={styles.row}>
          <View style={[styles.tile, styles.totalTile]}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>₹ {totals.total}</Text>
          </View>

          <View style={[styles.tile, styles.upiTile]}>
            <Text style={styles.label}>UPI</Text>
            <Text style={styles.value}>₹ {totals.upi}</Text>
          </View>

          <View style={[styles.tile, styles.bankTile]}>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.value}>₹ {totals.bank}</Text>
          </View>

          <View style={[styles.tile, styles.cashTile]}>
            <Text style={styles.label}>Cash</Text>
            <Text style={styles.value}>₹ {totals.cash}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default CollectionsCard


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
    justifyContent: 'space-between',
  },

  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },

  label: {
    fontSize: 12,
    color: '#555',
  },

  value: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },

  totalTile: {
    backgroundColor: '#F3F6F9',
  },

  upiTile: {
    backgroundColor: '#E3F2FD',
  },

  bankTile: {
    backgroundColor: '#E8F5E9',
  },

  cashTile: {
    backgroundColor: '#FFF3E0',
  },
})