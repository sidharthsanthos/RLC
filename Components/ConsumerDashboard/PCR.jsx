import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PendingConsumerRow = ({ consumer }) => {
    const navigation = useNavigation();

    return (
        <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('ConsumerDetails', { consumerID: consumer.id })}
        >
            <View style={styles.leftSection}>
                <Text style={styles.consumerName}>{consumer.Name}</Text>
                {consumer.By_Name && (
                    <Text style={styles.byName}>By: {consumer.By_Name}</Text>
                )}
                {consumer.Contact && (
                    <Text style={styles.contact}>📞 {consumer.Contact}</Text>
                )}
            </View>

            <View style={styles.rightSection}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Pending</Text>
                    <Text style={styles.amount}>₹{parseFloat(consumer.Pending_Amount || 0).toLocaleString('en-IN')}</Text>
                </View>
            </View>
        </Pressable>
    );
};

export default PendingConsumerRow;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8
    },
    leftSection: {
        flex: 1,
        marginRight: 12
    },
    consumerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    byName: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2
    },
    contact: {
        fontSize: 12,
        color: '#888'
    },
    rightSection: {
        alignItems: 'flex-end'
    },
    amountContainer: {
        alignItems: 'flex-end',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    amountLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF9800'
    }
});
