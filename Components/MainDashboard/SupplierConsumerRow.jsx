import { StyleSheet, View } from 'react-native'
import React from 'react'
import TopSuppliersCard from './TopSupplierCard'
import TopConsumersCard from './TopConsumerCard'

const SupplierConsumerRow = () => {
  return (
    <View style={styles.row}>
      <TopSuppliersCard/>
      <TopConsumersCard/>
    </View>
  )
}

export default SupplierConsumerRow

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
})