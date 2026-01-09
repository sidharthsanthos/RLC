import { StyleSheet, View } from 'react-native'
import React from 'react'
import Header from '../MainDashboard/Header'
import MainHome from '../MainDashboard/MainHome'

const Home = () => {
  return (
    <View style={styles.container}>
      <Header/>
      <MainHome />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})