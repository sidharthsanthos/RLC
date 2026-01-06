import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, FlatList } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useRoute, useIsFocused } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import MessageBox from '../MessageBox';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const AddOrder = () => {

  const route = useRoute();
  const isFocused = useIsFocused();
  const consumerFromRoute = route.params?.consumer;
  const isMounted = useRef(true);

  const [consumers, setConsumers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [filteredStockItems, setFilteredStockItems] = useState([]);
  
  const [selectedConsumer, setSelectedConsumer] = useState(consumerFromRoute || null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedStockAllocations, setSelectedStockAllocations] = useState([]);
  
  const [filters, setFilters] = useState({
    state: '',
    supplyType: '',
    quality: ''
  });

  const [alert, setAlert] = useState({ type: '', message: '' });

  const southStates = [
    "Tamil Nadu",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
    "Puducherry"
  ];

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clear all state on unmount
      setConsumers([]);
      setSuppliers([]);
      setFilteredSuppliers([]);
      setStockItems([]);
      setFilteredStockItems([]);
      setSelectedConsumer(null);
      setSelectedSupplier(null);
      setSelectedStockAllocations([]);
      setFilters({ state: '', supplyType: '', quality: '' });
      setAlert({ type: '', message: '' });
    };
  }, []);

  // Fetch Consumers and Suppliers on mount or when focused
  useEffect(() => {
    if (isFocused) {
      fetchConsumers();
      fetchSuppliers();
    }
  }, [isFocused]);

  // Filter suppliers whenever filters or list changes
  useEffect(() => {
    if (isMounted.current) {
      filterSuppliersList();
    }
  }, [suppliers, filters.state, filters.supplyType]);

  // Fetch stock when supplier changes
  useEffect(() => {
    if (isMounted.current) {
      if (selectedSupplier) {
        fetchSupplierStock(selectedSupplier.id);
      } else {
        setStockItems([]);
        setFilteredStockItems([]);
      }
    }
  }, [selectedSupplier]);

  // Filter stock items when quality filter changes
  useEffect(() => {
    if (isMounted.current) {
      filterStockItems();
    }
  }, [stockItems, filters.quality]);

  const fetchConsumers = async () => {
    try {
      const { data, error } = await supabase.from('Consumers').select('*');
      if (error) throw error;
      if (isMounted.current) {
        setConsumers(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase.from('Suppliers').select('*');
      if (error) throw error;
      if (isMounted.current) {
        setSuppliers(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterSuppliersList = () => {
    let temp = [...suppliers];

    if (filters.state) {
      temp = temp.filter(s => s.State === filters.state);
    }

    if (filters.supplyType) {
      temp = temp.filter(s => s.Supply_Type == filters.supplyType);
    }

    setFilteredSuppliers(temp);
  };

  const fetchSupplierStock = async (supplierId) => {
    const yesterday=new Date();
    yesterday.setDate(yesterday.getDate());

    const formattedDate=yesterday.toISOString().split('T')[0];
    console.log(formattedDate);
    

    try {
      const { data, error } = await supabase
        .from('Stock')
        .select('*')
        .eq('Supplier_ID', supplierId)
        .gt('Remaining_Quantity', 0)
        .gte('Date',formattedDate)
        .order('Date', { ascending: false });

      if (error) throw error;

      console.log('data',data);
      

      if (isMounted.current) {
        setStockItems(data || []);
      }

    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  const filterStockItems = () => {
    let temp = [...stockItems];

    if (filters.quality) {
      temp = temp.filter(item => item.Quality === filters.quality);
    }

    setFilteredStockItems(temp);
  };

  const handleStockSelection = (stockItem, quantity) => {
    const qty = Number(quantity) || 0;
    
    if (qty < 0 || qty > stockItem.Remaining_Quantity) {
      return;
    }

    const existingIndex = selectedStockAllocations.findIndex(
      item => item.stockId === stockItem.id
    );

    if (qty === 0) {
      // Remove allocation if quantity is 0
      if (existingIndex !== -1) {
        setSelectedStockAllocations(prev => 
          prev.filter(item => item.stockId !== stockItem.id)
        );
      }
    } else {
      // Calculate proportional amount based on stock's rate
      const rate = stockItem.Net_Amount;
      const bags = selectedSupplier?.Supply_Type === 1 
        ? qty 
        : Math.min(qty, stockItem.Remaining_Bags);
      const amount = qty * rate;

      const allocation = {
        stockId: stockItem.id,
        stockItem: stockItem,
        quantity: qty,
        bags: bags,
        amount: amount
      };

      if (existingIndex !== -1) {
        setSelectedStockAllocations(prev => {
          const updated = [...prev];
          updated[existingIndex] = allocation;
          return updated;
        });
      } else {
        setSelectedStockAllocations(prev => [...prev, allocation]);
      }
    }
  };

  const getTotalAmount = () => {
    return selectedStockAllocations.reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalQuantity = () => {
    return selectedStockAllocations.reduce((sum, item) => sum + item.quantity, 0);
  };

  const saveOrder = async () => {
    if (!selectedConsumer) {
      showAlert('error', 'Please select a consumer');
      return;
    }

    if (selectedStockAllocations.length === 0) {
      showAlert('error', 'Please select at least one stock item');
      return;
    }

    const totalAmount = getTotalAmount();
    const today = new Date().toISOString().split("T")[0];

    try {
      // 1. Create transaction record (consumer order is debit - they owe money)
      const { data: transactionData, error: transactionError } = await supabase
        .from('Transactions')
        .insert({
          ref_type: 'consumer',
          ref_id: selectedConsumer.id,
          amount: totalAmount,
          transaction_type: 'debit',
          mode: null,
          date: today,
          remarks: `Order from ${selectedSupplier?.Name || 'supplier'}`
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // 2. Insert stock allocations and update stock
      for (const allocation of selectedStockAllocations) {
        // Insert allocation
        const { error: allocError } = await supabase
          .from('Stock_Allocations')
          .insert({
            Transaction_ID: transactionData.id,
            Stock_ID: allocation.stockId,
            Bags_Allocated: allocation.bags,
            Quantity_Allocated: allocation.quantity,
            Amount: allocation.amount
          });

        if (allocError) throw allocError;

        // Update stock remaining quantities
        const stockItem = allocation.stockItem;
        const newRemainingQty = stockItem.Remaining_Quantity - allocation.quantity;
        const newRemainingBags = stockItem.Remaining_Bags - allocation.bags;

        const { error: updateStockError } = await supabase
          .from('Stock')
          .update({
            Remaining_Quantity: newRemainingQty,
            Remaining_Bags: newRemainingBags
          })
          .eq('id', allocation.stockId);

        if (updateStockError) throw updateStockError;
      }

      // 3. Update consumer pending amount
      const newPending = Number(selectedConsumer.Pending_Amount) + totalAmount;
      const { error: updateError } = await supabase
        .from('Consumers')
        .update({ Pending_Amount: newPending })
        .eq('id', selectedConsumer.id);

      if (updateError) throw updateError;

      showAlert('success', 'Order Placed Successfully');
      
      // Reset form
      setSelectedStockAllocations([]);
      setSelectedConsumer(null);
      setSelectedSupplier(null);
      setFilters({ state: '', supplyType: '', quality: '' });
      fetchConsumers();
      fetchSuppliers();

    } catch (err) {
      console.error(err);
      showAlert('error', err.message || 'An error occurred');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  return (
    <ScrollView style={styles.container}>
      {alert.message !== "" && (
        <MessageBox type={alert.type} message={alert.message} />
      )}
      
      <Text style={styles.header}>Place Consumer Order</Text>

      {/* 1. Select Consumer */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Consumer</Text>
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedConsumer?.id || ""}
                onValueChange={(val) => setSelectedConsumer(consumers.find(c => c.id === val))}
            >
                <Picker.Item label="Select Consumer" value="" />
                {consumers.map(c => <Picker.Item key={c.id} label={c.Name} value={c.id} />)}
            </Picker>
        </View>
        {selectedConsumer && (
            <Text style={styles.infoText}>Current Due: ₹{selectedConsumer.Pending_Amount}</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* 2. Filter Suppliers & Stock */}
      <Text style={styles.subHeader}>Filter Suppliers & Stock</Text>
      
      <View style={styles.row}>
          <View style={[styles.pickerContainer, {flex: 1, marginRight: 5}]}>
            <Picker
                selectedValue={filters.state}
                onValueChange={(v) => setFilters(prev => ({...prev, state: v}))}
            >
                <Picker.Item label="All States" value="" />
                {southStates.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>

          <View style={[styles.pickerContainer, {flex: 1, marginLeft: 5}]}>
            <Picker
                selectedValue={filters.supplyType}
                onValueChange={(v) => setFilters(prev => ({...prev, supplyType: v}))}
            >
                <Picker.Item label="All Types" value="" />
                <Picker.Item label="Bags" value={1} />
                <Picker.Item label="Kgs" value={2} />
            </Picker>
          </View>
      </View>

      {/* 3. Select Supplier */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Supplier</Text>
        <View style={styles.pickerContainer}>
            <Picker
                selectedValue={selectedSupplier?.id || ""}
                onValueChange={(val) => setSelectedSupplier(filteredSuppliers.find(s => s.id === val))}
            >
                <Picker.Item label="Select Supplier" value="" />
                {filteredSuppliers.map(s => <Picker.Item key={s.id} label={s.Name} value={s.id} />)}
            </Picker>
        </View>
      </View>

      {/* 4. Filter by Quality */}
      {selectedSupplier && stockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Filter by Quality</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.quality}
              onValueChange={(v) => setFilters(prev => ({...prev, quality: v}))}
            >
              <Picker.Item label="All Qualities" value="" />
              <Picker.Item label="Good" value="Good" />
              <Picker.Item label="Average" value="Average" />
              <Picker.Item label="Bad" value="Bad" />
            </Picker>
          </View>
        </View>
      )}

      {/* 5. Available Stock List */}
      {selectedSupplier && (
        <View style={styles.section}>
          <Text style={styles.subHeader}>Available Stock</Text>
          {filteredStockItems.length === 0 ? (
            <Text style={styles.emptyText}>No stock available</Text>
          ) : (
            <FlatList
              data={filteredStockItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <StockItemCard
                  item={item}
                  supplyType={selectedSupplier.Supply_Type}
                  onQuantityChange={(qty) => handleStockSelection(item, qty)}
                  selectedQty={
                    selectedStockAllocations.find(a => a.stockId === item.id)?.quantity || 0
                  }
                />
              )}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* 6. Order Summary */}
      {selectedStockAllocations.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Quantity:</Text>
            <Text style={styles.summaryValue}>{getTotalQuantity()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryAmount}>₹{getTotalAmount().toLocaleString()}</Text>
          </View>
          
          <TouchableOpacity style={styles.btn} onPress={saveOrder}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.btnText}>Confirm Order</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f9f9f9'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#444'
  },
  section: {
    marginBottom: 15
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10
  },
  label: {
      fontSize: 14,
      marginBottom: 5,
      color: '#666'
  },
  infoText: {
      fontSize: 12,
      color: '#d9534f', // Red for due amount
      marginTop: 2,
      fontWeight: 'bold'
  },
  pickerContainer: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      overflow: 'hidden'
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8
  },
  divider: {
      height: 1,
      backgroundColor: '#ddd',
      marginVertical: 15
  },
  btn: {
    backgroundColor: "#07c3f7",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontStyle: 'italic'
  },
  stockCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 }
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  qualityText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  stockDate: {
    color: '#666',
    fontSize: 12
  },
  stockDetails: {
    marginBottom: 10
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  stockLabel: {
    color: '#666',
    fontSize: 14
  },
  stockValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500'
  },
  stockNotes: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10
  },
  quantityLabel: {
    color: '#444',
    fontSize: 14,
    marginRight: 10
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
    textAlign: 'center',
    marginRight: 10
  },
  maxText: {
    color: '#999',
    fontSize: 12
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  selectedText: {
    color: '#51CF66',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666'
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#07c3f7'
  }
})

const StockItemCard = ({ item, supplyType, onQuantityChange, selectedQty }) => {
  const [quantity, setQuantity] = useState(selectedQty.toString());

  const handleChange = (value) => {
    setQuantity(value);
    const num = Number(value) || 0;
    onQuantityChange(num);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN');
  };

  const getQualityColor = (quality) => {
    switch(quality) {
      case 'Good': return '#51CF66';
      case 'Average': return '#FFA500';
      case 'Bad': return '#FF6B6B';
      default: return '#999';
    }
  };

  return (
    <View style={styles.stockCard}>
      <View style={styles.stockHeader}>
        <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(item.Quality) }]}>
          <Text style={styles.qualityText}>{item.Quality}</Text>
        </View>
        <Text style={styles.stockDate}>{formatDate(item.Date)}</Text>
      </View>

      <View style={styles.stockDetails}>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Available:</Text>
          <Text style={styles.stockValue}>
            {item.Remaining_Quantity} {supplyType === 1 ? 'Bags' : 'Kg'}
          </Text>
        </View>
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>Rate:</Text>
          <Text style={styles.stockValue}>₹{item.Net_Amount}</Text>
        </View>
        {item.Notes && (
          <Text style={styles.stockNotes}>{item.Notes}</Text>
        )}
      </View>

      <View style={styles.quantitySelector}>
        <Text style={styles.quantityLabel}>Select Quantity:</Text>
        <TextInput
          style={styles.quantityInput}
          keyboardType="numeric"
          placeholder="0"
          value={quantity}
          onChangeText={handleChange}
        />
        <Text style={styles.maxText}>Max: {item.Remaining_Quantity}</Text>
      </View>

      {selectedQty > 0 && (
        <View style={styles.selectedInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#51CF66" />
          <Text style={styles.selectedText}>
            Amount: ₹{(selectedQty * item.Net_Amount).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
};

export default AddOrder
