import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';



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

  // const downloadInvoice = async () => {
  //   try {
  //     // Request media library permissions
  //     const { status } = await MediaLibrary.requestPermissionsAsync();

  //     if (status !== 'granted') {
  //       Alert.alert('Permission Required', 'Please grant media library permissions to save the invoice');
  //       return;
  //     }

  //     // Capture the view as image
  //     const uri = await viewShotRef.current.capture();
      
  //     // Save to media library
  //     const asset = await MediaLibrary.createAssetAsync(uri);
      
  //     // Optionally create an album for invoices
  //     const album = await MediaLibrary.getAlbumAsync('Invoices');
  //     if (album == null) {
  //       await MediaLibrary.createAlbumAsync('Invoices', asset, false);
  //     } else {
  //       await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  //     }
      
  //     Alert.alert('Success', 'Invoice saved to your gallery in the "Invoices" folder!');
  //   } catch (error) {
  //     console.error('Error downloading invoice:', error);
  //     Alert.alert('Error', 'Failed to save invoice. Please try again.');
  //   }
  // };

  // const generateReceiptHTML = ({
  //   businessName,
  //   receiptNo,
  //   date,
  //   customerName,
  //   customerPhone,
  //   amountPaid,
  //   paymentMode,
  //   referenceNo,
  //   remarks
  // }) => {
  //   return `
  //   <html>
  //     <head>
  //       <style>
  //         @page {
  //           size: A4;
  //           margin: 20mm;
  //         }

  //         body {
  //           font-family: Arial, sans-serif;
  //           font-size: 12px;
  //           color: #000;
  //         }

  //         .header {
  //           display: flex;
  //           justify-content: space-between;
  //           border-bottom: 2px solid #000;
  //           padding-bottom: 10px;
  //           margin-bottom: 15px;
  //         }

  //         .business-name {
  //           font-size: 18px;
  //           font-weight: bold;
  //         }

  //         .doc-title {
  //           font-size: 16px;
  //           font-weight: bold;
  //           text-transform: uppercase;
  //         }

  //         .row {
  //           display: flex;
  //           justify-content: space-between;
  //         }

  //         .section {
  //           margin-bottom: 15px;
  //         }

  //         .label {
  //           font-weight: bold;
  //         }

  //         .amount-box {
  //           border: 2px solid #000;
  //           padding: 14px;
  //           text-align: center;
  //           font-size: 16px;
  //           font-weight: bold;
  //           margin: 20px 0;
  //         }

  //         .footer {
  //           margin-top: 30px;
  //           padding-top: 10px;
  //           border-top: 1px solid #ccc;
  //           font-size: 10px;
  //           text-align: center;
  //           color: #555;
  //         }
  //       </style>
  //     </head>

  //     <body>

  //       <div class="header">
  //         <div class="business-name">${businessName}</div>
  //         <div class="doc-title">Payment Receipt</div>
  //       </div>

  //       <div class="section row">
  //         <div><span class="label">Receipt No:</span> ${receiptNo}</div>
  //         <div><span class="label">Date:</span> ${date}</div>
  //       </div>

  //       <div class="section">
  //         <div class="label">Received From:</div>
  //         <div>${customerName}</div>
  //         <div>Phone: ${customerPhone}</div>
  //       </div>

  //       <div class="amount-box">
  //         Amount Received: ₹${amountPaid}
  //       </div>

  //       <div class="section row">
  //         <div><span class="label">Payment Mode:</span> ${paymentMode}</div>
  //         <div><span class="label">Reference No:</span> ${referenceNo || '-'}</div>
  //       </div>

  //       <div class="section">
  //         <span class="label">Remarks:</span><br/>
  //         ${remarks}
  //       </div>

  //       <div class="footer">
  //         This is a system-generated payment receipt.<br/>
  //         Thank you for your business.
  //       </div>

  //     </body>
  //   </html>
  //   `;
  // };

  const generateReceiptHTML = ({
    businessName,
    businessLogo64, // URL or base64 image string
    businessAddress,
    businessContact,
    receiptNo,
    date,
    customerName,
    customerPhone,
    customerAddress,
    amountPaid,
    paymentMode,
    referenceNo,
    remarks
  }) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            color: #1a1a1a;
            line-height: 1.5;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 20px;
            border-bottom: 3px solid #2c3e50;
            margin-bottom: 25px;
          }
          
          .business-info {
            flex: 1;
          }
          
          .logo-container {
            width: 100px;
            height: 100px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .logo-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          
          .business-name {
            font-size: 22px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          
          .business-details {
            font-size: 10px;
            color: #555;
            line-height: 1.6;
          }
          
          .doc-info {
            text-align: right;
            padding: 15px 20px;
            background: #f8f9fa;
            border-radius: 4px;
            border-left: 4px solid #2c3e50;
          }
          
          .doc-title {
            font-size: 20px;
            font-weight: 700;
            color: #2c3e50;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }
          
          .receipt-meta {
            font-size: 10px;
            color: #666;
          }
          
          .receipt-meta div {
            margin: 4px 0;
          }
          
          .label {
            font-weight: 600;
            color: #2c3e50;
          }
          
          .section {
            margin-bottom: 20px;
          }
          
          .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #2c3e50;
            text-transform: uppercase;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #dee2e6;
            letter-spacing: 0.5px;
          }
          
          .customer-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #3498db;
          }
          
          .customer-box div {
            margin: 5px 0;
          }
          
          .amount-section {
            margin: 30px 0;
            text-align: center;
          }
          
          .amount-box {
            display: inline-block;
            border: 3px solid #27ae60;
            background: #f1f9f5;
            padding: 20px 40px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
          }
          
          .amount-label {
            font-size: 12px;
            color: #555;
            margin-bottom: 8px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .amount-value {
            font-size: 28px;
            font-weight: 700;
            color: #27ae60;
            letter-spacing: 1px;
          }
          
          .payment-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          
          .detail-item {
            padding: 10px;
            background: white;
            border-radius: 3px;
            border: 1px solid #e9ecef;
          }
          
          .detail-label {
            font-size: 9px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
          }
          
          .detail-value {
            font-size: 12px;
            color: #1a1a1a;
            font-weight: 500;
          }
          
          .remarks-box {
            background: #fffdf0;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #f39c12;
            min-height: 60px;
          }
          
          .remarks-content {
            color: #555;
            font-size: 11px;
            line-height: 1.6;
            white-space: pre-wrap;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 20px;
          }
          
          .signature-box {
            text-align: center;
            width: 200px;
          }
          
          .signature-line {
            border-top: 2px solid #1a1a1a;
            margin-top: 50px;
            padding-top: 8px;
            font-size: 10px;
            color: #555;
            font-weight: 600;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            font-size: 9px;
            color: #6c757d;
            line-height: 1.8;
          }
          
          .footer-note {
            font-style: italic;
            margin-top: 8px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="business-info">
              ${businessLogo64 ? `
              <div class="logo-container">
                <img src="data:image/png;base64,${businessLogo64}" alt="Company Logo" style="height:60px; object-fit:contain;"/>
              </div>
              ` : ''}
              <div class="business-name">${businessName}</div>
              ${businessAddress ? `<div class="business-details">${businessAddress}</div>` : 'Ernakulam Market'}
              ${businessContact ? `<div class="business-details">${businessContact}</div>` : '0484-2942183'}
            </div>
            
            <div class="doc-info">
              <div class="doc-title">Payment Receipt</div>
              <div class="receipt-meta">
                <div><span class="label">Receipt No:</span> ${receiptNo}</div>
                <div><span class="label">Date:</span> ${date}</div>
              </div>
            </div>
          </div>
          
          <!-- Customer Section -->
          <div class="section">
            <div class="section-title">Received From</div>
            <div class="customer-box">
              <div><span class="label">Name:</span> ${customerName}</div>
              <div><span class="label">Phone:</span> ${customerPhone}</div>
              ${customerAddress ? `<div><span class="label">Address:</span> ${customerAddress}</div>` : ''}
            </div>
          </div>
          
          <!-- Amount Section -->
          <div class="amount-section">
            <div class="amount-box">
              <div class="amount-label">Amount Received</div>
              <div class="amount-value">₹${amountPaid}</div>
            </div>
          </div>
          
          <!-- Payment Details -->
          <div class="section">
            <div class="section-title">Payment Details</div>
            <div class="payment-details">
              <div class="detail-item">
                <div class="detail-label">Payment Mode</div>
                <div class="detail-value">${paymentMode}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Reference Number</div>
                <div class="detail-value">${referenceNo || '-'}</div>
              </div>
            </div>
          </div>
          
          <!-- Remarks Section -->
          ${remarks ? `
          <div class="section">
            <div class="section-title">Remarks</div>
            <div class="remarks-box">
              <div class="remarks-content">${remarks}</div>
            </div>
          </div>
          ` : ''}
          
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Received By</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Authorized Signature</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div>This is a system-generated payment receipt and requires no signature.</div>
            <div class="footer-note">Thank you for your business.</div>
          </div>
        </div>
      </body>
    </html>
    `;
  };


  const downloadInvoice = async () => {
    const businessLogo=`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`;
    try {
      // 1. Prepare data from existing props
      const html = generateReceiptHTML({
        businessName: 'RLC', // or from config
        businessLogo64:businessLogo,
        receiptNo: `${transaction.id}`,
        date: formatDate(transaction.date),
        customerName: consumer.Name,
        customerPhone: consumer.Contact || 'N/A',
        amountPaid: transaction.amount.toLocaleString(),
        paymentMode: transaction.mode?.toUpperCase() || 'CASH',
        referenceNo: "NIL",
        remarks:'Payment received successfully'
      });

      // 2. Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // 3. Move PDF to app storage
      const fileName = `Payment_Receipt_${transaction.id}.pdf`;
      const destination = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: destination,
      });

      // 4. Allow user to open/share/save
      await Sharing.shareAsync(destination);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert('Error', 'Failed to generate receipt PDF');
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
