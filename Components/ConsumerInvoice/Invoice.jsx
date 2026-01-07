import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';


const Invoice = ({ consumer, transaction, orderDetails, onClose }) => {
  const viewShotRef = useRef();

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const downloadInvoice = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to save the invoice');
        return;
      }

      // Capture the view as image
      const uri = await viewShotRef.current.capture();
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      
      // Optionally create an album for invoices
      const album = await MediaLibrary.getAlbumAsync('Invoices');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Invoices', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      
      Alert.alert('Success', 'Invoice saved to your gallery in the "Invoices" folder!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to save invoice. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.invoiceCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.invoiceTitle}>PAYMENT INVOICE</Text>
            <Text style={styles.invoiceNumber}>INV-{transaction.id}</Text>
          </View>

          {/* Consumer Info */}
          <View style={styles.consumerSection}>
            <View style={styles.consumerHeader}>
              {consumer.Image_URL ? (
                <Image 
                  source={{ uri: consumer.Image_URL }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={40} color="#ccc" />
                </View>
              )}
              <View style={styles.consumerInfo}>
                <Text style={styles.consumerName}>{consumer.Name}</Text>
                <Text style={styles.consumerDetail}>Phone: {consumer.Phone_Number || 'N/A'}</Text>
                <Text style={styles.consumerDetail}>Date: {formatDate(transaction.date)}</Text>
              </View>
            </View>
          </View>

          {/* Order Details */}
          {orderDetails && orderDetails.length > 0 && (
            <View style={styles.orderSection}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.divider} />
              {orderDetails.map((order, index) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Stock ID:</Text>
                    <Text style={styles.orderValue}>{order.Stock_ID}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Quantity:</Text>
                    <Text style={styles.orderValue}>{order.Quantity_Allocated} units</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Bags:</Text>
                    <Text style={styles.orderValue}>{order.Bags_Allocated}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Amount:</Text>
                    <Text style={styles.orderValue}>₹{order.Amount?.toLocaleString()}</Text>
                  </View>
                  {index < orderDetails.length - 1 && <View style={styles.itemDivider} />}
                </View>
              ))}
            </View>
          )}

          {/* Payment Details */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount Paid:</Text>
              <Text style={styles.totalAmount}>₹{transaction.amount.toLocaleString()}</Text>
            </View>

            <View style={styles.gstNote}>
              <Text style={styles.gstNoteText}>* GST included in the above amount</Text>
            </View>

            <View style={styles.modeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#51CF66" />
              <Text style={styles.modeText}>
                Paid via {transaction.mode ? transaction.mode.toUpperCase() : 'CASH'}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your payment!</Text>
          </View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.downloadButton} onPress={downloadInvoice}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Download Invoice</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Invoice;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF9966',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9966',
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  consumerSection: {
    marginBottom: 20,
  },
  consumerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  consumerInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  consumerDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  orderSection: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  orderItem: {
    marginTop: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  orderLabel: {
    fontSize: 13,
    color: '#666',
  },
  orderValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 8,
  },
  paymentSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9966',
  },
  gstNote: {
    marginTop: 4,
    paddingVertical: 6,
  },
  gstNoteText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  modeText: {
    fontSize: 13,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 16,
  },
  downloadButton: {
    backgroundColor: '#FF9966',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#666',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
