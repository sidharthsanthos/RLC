import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const TopSuppliersCard = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopSuppliers()
  }, [])

  const fetchTopSuppliers = async () => {
    const today = new Date().toLocaleDateString('en-CA').split('T')[0]

    const { data, error } = await supabase
      .from('daily_supplier_supply')
      .select('supplier_name, total_bags')
      .eq('date', today)
      .order('total_bags', { ascending: false })
      .limit(3)

    if (!error && data) {
      setSuppliers(data)
    }

    setLoading(false)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Suppliers</Text>

      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : suppliers.length === 0 ? (
        <Text style={styles.info}>No supplies today</Text>
      ) : (
        suppliers.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item.supplier_name}
            </Text>
            <Text style={styles.count}>{item.total_bags}</Text>
          </View>
        ))
      )}
    </View>
  )
}

export default TopSuppliersCard

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: '#FDECEA', // soft red
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    color: '#333',
    maxWidth: '70%',
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C62828',
  },
  info: {
    fontSize: 12,
    color: '#999',
  },
})