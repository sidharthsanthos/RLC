import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Consumer = () => {
  return (
    <View style={styles.container}>
      <Text>Consumer</Text>
    </View>
  )
}

export default Consumer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});