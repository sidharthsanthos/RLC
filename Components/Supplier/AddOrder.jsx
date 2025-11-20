import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const AddOrder = () => {
  return (
    <View style={styles.container}>
      <Text>AddOrder</Text>
    </View>
  )
}

export default AddOrder

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
  }
})