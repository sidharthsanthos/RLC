import { StyleSheet, ScrollView, View } from 'react-native'
import React from 'react'
import InventoryTrendCard from './InventoryTrendCard'

const MainHome = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <InventoryTrendCard/>
    </ScrollView>
  )
}

export default MainHome

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
})