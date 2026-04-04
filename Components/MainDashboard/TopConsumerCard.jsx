import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const TopConsumersCard = () => {
  const [consumers, setConsumers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopConsumers()
  }, [])

  const fetchTopConsumers = async () => {
    const today = new Date().toLocaleDateString('en-CA').split('T')[0]

    const { data, error } = await supabase
      .from('recent_consumer_sales')
      .select('consumer_name, bags_allocated, allocation_created_at')
      .eq('date', today)
      .order('allocation_created_at', { ascending: false })
      .limit(3)

    if (!error && data) {
      setConsumers(data)
    }

    setLoading(false)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Consumers</Text>

      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : consumers.length === 0 ? (
        <Text style={styles.info}>No sales today</Text>
      ) : (
        consumers.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item.consumer_name}
            </Text>
            <Text style={styles.count}>{item.bags_allocated}</Text>
          </View>
        ))
      )}
    </View>
  )
}

export default TopConsumersCard


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

    backgroundColor: '#E3F2FD', // soft blue
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    color: '#333',
  },
  count: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565C0',
  },
})