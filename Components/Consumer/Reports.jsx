import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Reports = () => {
  return (
    <View style={styles.container}>
      <Text>ConsumerReports</Text>
    </View>
  )
}

export default Reports

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0
  }
})
