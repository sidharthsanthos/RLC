import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

// ─── Number to Words Utility (Indian numbering) ────────────────────────────────
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero';

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const intPart = Math.floor(n);
  const paise = Math.round((Math.abs(num) - intPart) * 100);

  let result = convert(intPart) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' only';
};

// ─── Date Formatter ─────────────────────────────────────────────────────────────
const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// ─── Tax Invoice HTML Generator (for PDF only) ─────────────────────────────────
const generateTaxInvoiceHTML = ({
  businessName,
  businessEmail,
  businessContact,
  businessAddress,
  invoiceNo,
  date,
  customerName,
  customerContact,
  items,
  totalAmount,
  received,
  balance,
}) => {
  const itemRows = items.map((item, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${item.name || item.Stock_ID || '-'}</td>
      <td></td>
      <td style="text-align:center;">${item.Quantity_Allocated || item.quantity || ''}</td>
      <td style="text-align:center;">${item.unit || 'Kg'}</td>
      <td style="text-align:right;">₹ ${item.pricePerUnit ? item.pricePerUnit.toFixed(2) : ((item.Amount && item.Quantity_Allocated) ? (item.Amount / item.Quantity_Allocated).toFixed(2) : '0.00')}</td>
      <td style="text-align:right;">${item.Amount ? item.Amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
    </tr>
  `).join('');

  const totalQty = items.reduce((s, it) => s + (it.Quantity_Allocated || it.quantity || 0), 0);

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 12mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a2e; }
        .invoice-box { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; }

        .title { text-align: center; font-size: 18px; font-weight: bold; padding: 10px 0; }

        .business-box { border: 1px solid #ccc; margin: 0 10px 10px; padding: 10px 14px; }
        .business-name { font-size: 16px; font-weight: bold; }
        .business-detail { font-size: 11px; color: #555; margin-top: 2px; }

        .info-row { display: flex; border: 1px solid #ccc; margin: 0 10px 10px; }
        .info-col { flex: 1; padding: 8px 12px; }
        .info-col + .info-col { border-left: 1px solid #ccc; }
        .info-col-header { font-weight: bold; font-size: 11px; background: #f0f0f5; padding: 4px 12px; border-bottom: 1px solid #ccc; }

        table.items { width: calc(100% - 20px); margin: 0 10px; border-collapse: collapse; }
        table.items th, table.items td { border: 1px solid #ccc; padding: 5px 8px; font-size: 11px; }
        table.items th { background: #f0f0f5; font-weight: bold; text-align: center; }

        .totals { width: calc(100% - 20px); margin: 0 10px; border-collapse: collapse; }
        .totals td { border: 1px solid #ccc; padding: 5px 8px; font-size: 11px; }
        .totals .label { font-weight: bold; }

        .terms-box { border: 1px solid #ccc; margin: 10px; }
        .terms-header { font-weight: bold; font-size: 11px; background: #f0f0f5; padding: 4px 12px; border-bottom: 1px solid #ccc; }
        .terms-content { padding: 8px 12px; font-size: 11px; }

        .sig-box { border: 1px solid #ccc; margin: 0 10px 10px; margin-left: 50%; }
        .sig-header { font-weight: bold; font-size: 11px; background: #f0f0f5; padding: 4px 12px; border-bottom: 1px solid #ccc; }
        .sig-space { height: 60px; }
        .sig-label { text-align: center; font-size: 11px; padding: 4px 0 8px; }
      </style>
    </head>
    <body>
      <div class="invoice-box">

        <!-- Title -->
        <div class="title">Tax Invoice</div>

        <!-- Business Info -->
        <div class="business-box">
          <div class="business-name">${businessName}</div>
          <div class="business-detail">Contact: ${businessContact || 'N/A'}</div>
          ${businessEmail ? `<div class="business-detail">Email: ${businessEmail}</div>` : ''}
          ${businessAddress ? `<div class="business-detail">Address: ${businessAddress}</div>` : ''}
        </div>

        <!-- Bill To / Invoice Details -->
        <div class="info-row">
          <div class="info-col" style="flex:1;">
            <div class="info-col-header" style="margin:-8px -12px 8px; padding:4px 12px;">Bill To:</div>
            <div>${customerName}</div>
            <div style="margin-top:4px;">Contact No: ${customerContact || 'N/A'}</div>
          </div>
          <div class="info-col" style="flex:1;">
            <div class="info-col-header" style="margin:-8px -12px 8px; padding:4px 12px;">Invoice Details:</div>
            <div>No: ${invoiceNo}</div>
            <div style="margin-top:4px;">Date: ${date}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="items">
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th>Item Name</th>
              <th style="width:70px;">HSN/ SAC</th>
              <th style="width:70px;">Quantity</th>
              <th style="width:50px;">Unit</th>
              <th style="width:90px;">Price/ Unit (₹)</th>
              <th style="width:90px;">Amount(₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <!-- Total row -->
            <tr>
              <td></td>
              <td style="font-weight:bold;">Total</td>
              <td></td>
              <td style="text-align:center; font-weight:bold;">${totalQty}</td>
              <td></td>
              <td></td>
              <td style="text-align:right; font-weight:bold;">₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals / Summary -->
        <table class="totals" style="margin-top:0;">
          <tr>
            <td rowspan="5" style="width:55%; vertical-align:top;">&nbsp;</td>
            <td class="label">Sub Total</td>
            <td style="text-align:center;">:</td>
            <td style="text-align:right;">₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="label">Total</td>
            <td style="text-align:center;">:</td>
            <td style="text-align:right; font-weight:bold;">₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td colspan="3" class="label">Invoice Amount In Words :</td>
          </tr>
          <tr>
            <td colspan="3">${numberToWords(totalAmount)}</td>
          </tr>
          <tr>
            <td>Received</td>
            <td style="text-align:center;">:</td>
            <td style="text-align:right;">₹ ${received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="width:55%;"></td>
            <td>Balance</td>
            <td style="text-align:center;">:</td>
            <td style="text-align:right;">₹ ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>

        <!-- Terms & Conditions -->
        <div class="terms-box">
          <div class="terms-header">Terms And Conditions:</div>
          <div class="terms-content">Thank you for doing business with us.</div>
        </div>

        <!-- Authorized Signatory -->
        <div class="sig-box">
          <div class="sig-header">For ${businessName}:</div>
          <div class="sig-space"></div>
          <div class="sig-label">Authorized Signatory</div>
        </div>

      </div>
    </body>
  </html>
  `;
};

// ─── Main Invoice Component ────────────────────────────────────────────────────
const Invoice = ({ consumer, transaction, orderDetails, onClose }) => {
  const viewShotRef = useRef();

  const totalAmount = transaction.amount || 0;
  const received = 0;
  const balance = totalAmount - received;

  // PDF download using Tax Invoice format
  const downloadInvoice = async () => {
    try {
      const html = generateTaxInvoiceHTML({
        businessName: consumer?.Name || 'N/A',
        businessEmail: consumer?.Email || '',
        businessContact: consumer?.Contact || consumer?.Phone_Number || 'N/A',
        businessAddress: consumer?.Address || '',
        invoiceNo: `${transaction.id}`,
        date: formatDate(transaction.date),
        customerName: 'GUEST',
        customerContact: 'N/A',
        items: orderDetails || [],
        totalAmount,
        received,
        balance,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const fileName = `Tax_Invoice_${transaction.id}.pdf`;
      const destination = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: destination,
      });

      await Sharing.shareAsync(destination);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert('Error', 'Failed to generate Tax Invoice PDF');
    }
  };

  // ─── Original in-app UI preview ──────────────────────────────────────────────
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
                <Text style={styles.consumerName}>{consumer?.Name || "N/A"}</Text>
                <Text style={styles.consumerDetail}>Phone: {consumer?.Contact || consumer?.Phone_Number || 'N/A'}</Text>
                {consumer?.Email && <Text style={styles.consumerDetail}>Email: {consumer.Email}</Text>}
                {consumer?.Address && <Text style={styles.consumerDetail}>Address: {consumer.Address}</Text>}
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
