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

// ─── Payment Receipt HTML Generator (for PDF only) ──────────────────────
const generatePaymentReceiptHTML = ({
    consumer,
    transaction,
}) => {
    const amount = transaction.amount || 0;

    return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        body { font-family: sans-serif; font-size: 14px; margin: 0; padding: 0; color: #000; }
        .container { border: 1px solid #1a6b27; border-radius: 6px; padding: 15px; margin: 0 auto; max-width: 800px; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a6b27; padding-bottom: 15px; margin-bottom: 20px; }
        .header-left { flex: 2; }
        .title { color: #1a6b27; font-size: 28px; font-weight: bold; font-style: italic; margin-bottom: 5px; text-transform: uppercase; }
        .subtitle { background-color: #1a6b27; color: white; display: inline-block; padding: 4px 10px; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
        .address { font-size: 13px; font-weight: bold; font-style: italic; color: #1a6b27; line-height: 1.4; }
        .header-right { flex: 1; text-align: right; font-size: 13px; font-weight: bold; color: #1a6b27; line-height: 1.6; }
        
        .receipt-title { text-align: center; color: #1a6b27; font-size: 20px; font-weight: bold; text-decoration: underline; margin-bottom: 15px; }

        .meta-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
        .meta-client { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: right; font-size: 14px; }
        table.items th, table.items td { border: 1px solid #1a6b27; padding: 12px; }
        table.items th { background-color: #1a6b27; color: white; text-align: center; font-weight: bold; }
        table.items td { color: #000; }
        
        .amount-words-row td { text-align: left; font-weight: bold; font-style: italic; color: #1a6b27; padding: 15px 12px; }
        .net-amount-row td { font-weight: bold; color: #cc0000; padding: 15px 12px; }
        
        .sig-box { display: flex; justify-content: flex-end; margin-top: 40px; margin-right: 20px; }
        .sig-content { text-align: center; color: #1a6b27; font-weight: bold; }
        .sig-line { width: 150px; border-bottom: 1px solid #1a6b27; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <div class="title">sidharth santhosh</div>
            <div class="subtitle">Vegetables Wholesale & Commission Agent</div>
            <div class="address">Opp. SDPY School Play Ground,<br/>Near HDFC Bank, Palluruthy, Kochin - 6.</div>
          </div>
          <div class="header-right">
            99958 67008<br/>
            95670 27008<br/>
            0484 - 2964008
          </div>
        </div>
        
        <div class="receipt-title">PAYMENT RECEIPT</div>

        <div class="meta-row">
          <div class="meta-client">Received From: <br/>${consumer?.Name || 'CONSUMER'}</div>
          <div style="text-align: right;">
            Receipt No &nbsp;: &nbsp;&nbsp; ${transaction.id}<br/>
            Date &nbsp;: &nbsp;&nbsp; ${formatDate(transaction.date)}
          </div>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
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
              <td style="text-align: right;">${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="amount-words-row">
              <td colspan="4">Amount in Words: ${numberToWords(amount)}</td>
            </tr>
            <tr class="net-amount-row">
              <td colspan="3" style="text-align: right; border-right: none;">Total Amount Received</td>
              <td style="text-align: right; border-left: none;">₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        <div class="sig-box">
          <div class="sig-content">
            <div class="sig-line"></div>
            <div>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};

// ─── Main Payment Receipt Component ───────────────────────────────────────────
const ConsumerPaymentReceipt = ({ consumer, transaction, onClose }) => {
    const viewShotRef = useRef();
    const totalAmount = transaction.amount || 0;

    // PDF download using Green Receipt format
    const downloadReceipt = async () => {
        try {
            const html = generatePaymentReceiptHTML({
                consumer,
                transaction,
            });

            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
            });

            const fileName = `Payment_Receipt_${transaction.id}.pdf`;
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

                    {/* Consumer Info */}
                    <View style={styles.consumerSection}>
                        <View style={styles.consumerHeader}>
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Ionicons name="person" size={40} color="#1a6b27" />
                            </View>
                            <View style={styles.consumerInfo}>
                                <Text style={styles.consumerName}>{consumer?.Name || "N/A"}</Text>
                                <Text style={styles.consumerDetail}>Contact: {consumer?.Contact || consumer?.Phone_Number || 'N/A'}</Text>
                                <Text style={styles.consumerDetail}>Date: {formatDate(transaction.date)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payment Details */}
                    <View style={styles.paymentSection}>
                        <Text style={styles.sectionTitle}>Payment Summary</Text>
                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount Received:</Text>
                            <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</Text>
                        </View>

                        <View style={styles.modeRow}>
                            <Ionicons name="checkmark-circle" size={18} color="#1a6b27" />
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

export default ConsumerPaymentReceipt;

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
        borderBottomColor: '#1a6b27',
        marginBottom: 16,
    },
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a6b27',
        letterSpacing: 1,
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    consumerSection: {
        marginBottom: 24,
    },
    consumerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 8,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    placeholderImage: {
        backgroundColor: '#c8e6c9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    consumerInfo: {
        flex: 1,
    },
    consumerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a6b27',
        marginBottom: 4,
    },
    consumerDetail: {
        fontSize: 14,
        color: '#444',
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
        backgroundColor: '#e8f5e9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a6b27',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a6b27',
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
        backgroundColor: '#1a6b27',
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