import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SupplierDetails = ({route}) => {

    const { supplierID }=route.params;

    return (
        <View style={styles.container}>
        <Text>SupplierDetails: {supplierID?supplierID:''}</Text>
        </View>
    )
}

export default SupplierDetails

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
    },
})