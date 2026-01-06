import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

const icon = require('../../assets/user_icon.jpg');

const PendingSupplierRow = ({ supplier, onPress }) => {
  const imageSource = supplier.Image_URL
    ? { uri: supplier.Image_URL }
    : icon;

  // Format currency with Indian number format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
    >
      {/* Left: Supplier Icon with Badge */}
      <View style={styles.avatarContainer}>
        <Image source={imageSource} style={styles.avatar} />
        <View style={styles.avatarBorder} />
      </View>

      {/* Middle: Supplier Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {supplier.Name}
        </Text>
        <Text style={styles.label}>{supplier.By_Name?supplier.By_Name:''}</Text>
      </View>

      {/* Right: Pending Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          ₹{formatCurrency(supplier.Pending_Amount)}
        </Text>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default PendingSupplierRow;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pressed: {
    backgroundColor: '#f9fafb',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  avatarBorder: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#dc2626',
    marginRight: 8,
  },
  chevron: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 24,
    color: '#d1d5db',
    fontWeight: '300',
  },
});