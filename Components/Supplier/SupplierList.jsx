import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SupplierList = () => {
  return (
    <View style={styles.container}>
      <Text>SupplierList</Text>
    </View>
  )
}

export default SupplierList

const styles = StyleSheet.create({
container:{
  flex:1,
  paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
}
})