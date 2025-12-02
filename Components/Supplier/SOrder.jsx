import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'

const SOrder = () => {

    const route=useRoute();
    const {supplier}=route.params;

    return (
        <View style={styles.container}>
            <Text>SOrder</Text>
            <Text>Name: {supplier?supplier.Name:''}</Text>
        </View>
    )
}

export default SOrder

const styles = StyleSheet.create({
    container:{
        display:'flex',
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
        margin:50,
    }
})