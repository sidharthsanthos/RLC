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

// ─── Supplier Payment Receipt HTML Generator (for PDF only) ──────────────────────
const generateSupplierPaymentReceiptHTML = ({
  supplier,
  transaction,
}) => {
  const amount = transaction.amount || 0;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a2e; }
        .invoice-box { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; }

        .title { text-align: center; font-size: 18px; font-weight: bold; padding: 10px 0; }

        .business-box { border: 1px solid #ccc; margin: 0 10px 10px; padding: 10px 14px; }
        .business-name { font-size: 16px; font-weight: bold; }
        .business-email { font-size: 11px; color: #555; margin-top: 2px; }

        .info-row { display: flex; border: 1px solid #ccc; margin: 0 10px 10px; }
        .info-col { flex: 1; padding: 8px 12px; }
        .info-col + .info-col { border-left: 1px solid #ccc; }
        .info-col-header { font-weight: bold; font-size: 11px; background: #f0f0f5; padding: 4px 12px; border-bottom: 1px solid #ccc; margin: -8px -12px 8px; }

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
        
        <div class="title">Payment Receipt</div>

        <!-- Business Info -->
        <div class="business-box">
          <div class="business-name">${supplier?.Name || 'SUPPLIER'}</div>
          <div class="business-email">Contact: ${supplier?.Contact || supplier?.Phone_Number || 'N/A'}</div>
          <div class="business-email">Vegetables Wholesale & Commission Agent, ${supplier?.Address || ''}</div>
        </div>

        <!-- Bill To / Invoice Details -->
        <div class="info-row">
          <div class="info-col">
            <div class="info-col-header">Bill To:</div>
            <div>sidharth santhosh</div>
            <div style="margin-top:4px;">Contact No: N/A</div>
          </div>
          <div class="info-col">
            <div class="info-col-header">Receipt Details:</div>
            <div>No: ${transaction.id}</div>
            <div style="margin-top:4px;">Date: ${formatDate(transaction.date)}</div>
          </div>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th style="text-align: left;">Particulars</th>
              <th style="text-align: center;">Payment Mode</th>
              <th style="text-align: right;">Amount(₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">1</td>
              <td style="text-align: left;">Payment towards account</td>
              <td style="text-align: center;">${transaction.mode ? transaction.mode.toUpperCase() : 'CASH'}</td>
              <td style="text-align: right;">₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals / Summary -->
        <table class="totals" style="margin-top:0;">
          <tr>
            <td rowspan="3" style="width:55%; vertical-align:top;">&nbsp;</td>
            <td class="label">Total Amount Paid</td>
            <td style="text-align:center;">:</td>
            <td style="text-align:right; font-weight:bold;">₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td colspan="3" class="label">Amount In Words :</td>
          </tr>
          <tr>
            <td colspan="3">${numberToWords(amount)}</td>
          </tr>
        </table>

        <div class="terms-box">
          <div class="terms-header">Terms And Conditions:</div>
          <div class="terms-content">Thank you for your payment!</div>
        </div>

        <div class="sig-box">
          <div class="sig-header">For ${supplier?.Name || 'SUPPLIER'}:</div>
          <div class="sig-space"></div>
          <div class="sig-label">Authorized Signatory</div>
        </div>
      </div>
    </body>
  </html>
  `;
};

// ─── Main Supplier Invoice Component ───────────────────────────────────────────
const SupplierInvoice = ({ supplier, transaction, onClose }) => {
  const viewShotRef = useRef();
  const totalAmount = transaction.amount || 0;

  // PDF download using Green Supplier Receipt format
  const downloadReceipt = async () => {
    try {
      const html = generateSupplierPaymentReceiptHTML({
        supplier,
        transaction,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const fileName = `Supplier_Receipt_${transaction.id}.pdf`;
      const destination = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: destination,
      });

      await Sharing.shareAsync(destination);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert('Error', 'Failed to generate Payment Receipt PDF');
    }
  };

  // ─── In-app UI preview (Green Themed) ────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        <View style={styles.invoiceCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.invoiceTitle}>PAYMENT RECEIPT</Text>
            <Text style={styles.invoiceNumber}>RCPT-{transaction.id}</Text>
          </View>

          {/* Supplier Info */}
          <View style={styles.supplierSection}>
            <View style={styles.supplierHeader}>
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="business" size={40} color="#ccc" />
              </View>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{supplier.Name}</Text>
                <Text style={styles.supplierDetail}>Contact: {supplier.Contact || 'N/A'}</Text>
                <Text style={styles.supplierDetail}>Date: {formatDate(transaction.date)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount Paid:</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.modeRow}>
              <Ionicons name="checkmark-circle" size={18} color="#51CF66" />
              <Text style={styles.modeText}>
                Paid via {transaction.mode ? transaction.mode.toUpperCase() : 'CASH'}
              </Text>
            </View>

            {transaction.remarks && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.notesLabel}>Remarks:</Text>
                <Text style={styles.notesText}>{transaction.remarks}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your payment!</Text>
          </View>
        </View>
      </ViewShot>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.downloadButton} onPress={downloadReceipt}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Download Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SupplierInvoice;

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
  supplierSection: {
    marginBottom: 24,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  supplierDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  paymentSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  notesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 2
  },
  notesText: {
    fontSize: 13,
    color: '#444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  downloadButton: {
    backgroundColor: '#FF9966',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
