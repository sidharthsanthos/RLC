import { StyleSheet, ScrollView, View } from 'react-native'
import React from 'react'
import InventoryTrendCard from './InventoryTrendCard'
import SupplierConsumerRow from './SupplierConsumerRow'
import CollectionsCard from './CollectionsCard'
import PendingSummary from './PendingSummary'

const MainHome = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PendingSummary/>
      <InventoryTrendCard/>
      <SupplierConsumerRow/>
      <CollectionsCard/>
    </ScrollView>
  )
}

export default MainHome

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
})