import { StyleSheet, View, Image, Text, Platform, StatusBar } from 'react-native'
import React from 'react'

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          source={require('../../assets/RLC_LOGO_2.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Dashboard</Text>
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight + 8
      : 16,
    paddingBottom: 14,
    backgroundColor:'#fffec8',

    // backgroundColor: '#F8FAF5',
    borderBottomWidth: 0.8,
    borderColor: '#E6E6E6',
  },

  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 8,
  },

  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#2E2E2E',
    letterSpacing: 0.5,
  },
})
