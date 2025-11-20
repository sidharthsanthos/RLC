import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SupplierReports = () => {
  return (
    <View style={styles.container}>
      <Text>SupplierReports</Text>
    </View>
  )
}

export default SupplierReports

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
  }
})