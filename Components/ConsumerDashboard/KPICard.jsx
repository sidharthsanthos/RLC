import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const KPICard = ({ title, value, onPress, color }) => {
    return (
        <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color }]}>{value}</Text>
        </TouchableOpacity>
    )
}

export default KPICard

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        minWidth: 140,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    title: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500'
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold'
    }
})
