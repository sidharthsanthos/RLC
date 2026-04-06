import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const StockRow = ({
    stockList,
    selectedStockId,
    quantity,
    onStockChange,
    onQtyChange,
    onDelete,
    showDelete
}) => {

    const selectedStock = stockList.find(s => s.id === selectedStockId);

    return (
        <View style={styles.container}>

            {/* Dropdown */}
            <View style={styles.dropdown}>
                <Picker
                    selectedValue={selectedStockId}
                    onValueChange={onStockChange}
                >
                    <Picker.Item label="Select Stock" value={null} />
                    {stockList.map((item) => (
                        <Picker.Item
                            key={item.id}
                            value={item.id}
                            label={`${item.Suppliers?.Name || 'Supplier'} | ${item.Quality} | ${item.Remaining_Quantity}kg`}
                        />
                    ))}
                </Picker>
            </View>

            {/* Quantity Input */}
            {selectedStock && (
                <View style={styles.qtyContainer}>
                    <Text style={styles.available}>
                        Available: {selectedStock.Remaining_Quantity} kg
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter kg"
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={onQtyChange}
                    />
                </View>
            )}

            {/* Delete Button */}
            {showDelete && (
                <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                    <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
            )}

        </View>
    )
}

export default StockRow

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8
    },
    qtyContainer: {
        marginTop: 10
    },
    available: {
        color: '#666',
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10
    },
    deleteBtn: {
        marginTop: 10,
        alignItems: 'flex-end'
    }
});