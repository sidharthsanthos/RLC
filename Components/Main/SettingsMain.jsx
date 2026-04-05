import { StyleSheet, Text, View, Platform, StatusBar } from 'react-native'
import React from 'react'

const SettingsMain = () => {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
    </View>
  )
}

export default SettingsMain

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});