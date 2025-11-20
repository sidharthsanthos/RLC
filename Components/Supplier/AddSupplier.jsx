import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const AddSupplier = () => {
  return (
    <View style={styles.container}>
      <Text>AddSupplier</Text>
    </View>
  )
}

export default AddSupplier

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
  }
})