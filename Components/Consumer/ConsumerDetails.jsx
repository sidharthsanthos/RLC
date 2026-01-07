import { Platform, StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, FlatList, Animated, ActivityIndicator, Alert, Modal } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import uuid from 'react-native-uuid';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Invoice from '../ConsumerInvoice/Invoice';

const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

const TransactionItem = ({ item, index, consumer }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay: index * 80,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            })
        ]).start();
    }, []);

    const fetchOrderDetails = async () => {
        setLoadingOrder(true);
        try {
            const { data, error } = await supabase
                .from('Stock_Allocations')
                .select('*')
                .eq('Transaction_ID', item.id);

            if (error) throw error;
            setOrderDetails(data || []);
        } catch (err) {
            console.error('Error fetching order details:', err);
        } finally {
            setLoadingOrder(false);
        }
    };

    const handleGenerateInvoice = async () => {
        // Only allow invoice for credit transactions (payments)
        if (item.transaction_type !== 'credit') {
            Alert.alert('Info', 'Invoices can only be generated for payments');
            return;
        }

        await fetchOrderDetails();
        setShowInvoice(true);
    };

    const modeColors = {
        cash: "#FF6B6B",
        upi: "#4ECDC4",
        bank: "#45B7D1",
        null: "#95A5A6",
    };

    const modeIcons = {
        cash: "cash-outline",
        upi: "phone-portrait-outline",
        bank: "business-outline",
        null: "help-circle-outline",
    };

    return (
        <>
            <TouchableOpacity onPress={handleGenerateInvoice} activeOpacity={0.7}>
                <Animated.View
                    style={[
                        styles.txCard,
                        { opacity: fadeAnim, transform: [{ translateY }] }
                    ]}
                >
                    <View style={[styles.txIconBox, { backgroundColor: modeColors[item.mode] || "#95A5A6" }]}>
                        <Ionicons name={modeIcons[item.mode] || "help-circle-outline"} size={24} color="#fff" />
                    </View>

                    <View style={styles.txContent}>
                        <Text style={styles.txAmount}>₹{item.amount.toLocaleString()}</Text>
                        <Text style={styles.txDate}>{formatDate(item.date)}</Text>
                    </View>

                    <View style={styles.actionGroup}>
                        <View style={[styles.modeTag, { backgroundColor: modeColors[item.mode] || "#95A5A6" }]}>
                            <Text style={styles.modeText}>
                                {item.mode ? item.mode.toUpperCase() : "N/A"}
                            </Text>
                        </View>
                        {item.transaction_type === 'credit' && (
                            <Ionicons name="receipt-outline" size={20} color="#FF9966" style={{ marginLeft: 8 }} />
                        )}
                    </View>
                </Animated.View>
            </TouchableOpacity>

            {showInvoice && (
                <Modal
                    animationType="slide"
                    transparent
                    visible={showInvoice}
                    onRequestClose={() => setShowInvoice(false)}
                >
                    <ScrollView style={styles.invoiceModalBackground}>
                        {loadingOrder ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#FF9966" />
                                <Text style={styles.loadingText}>Loading invoice...</Text>
                            </View>
                        ) : (
                            <Invoice
                                consumer={consumer}
                                transaction={item}
                                orderDetails={orderDetails}
                                onClose={() => setShowInvoice(false)}
                            />
                        )}
                    </ScrollView>
                </Modal>
            )}
        </>
    );
};

const OrderItem = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    const [modalView,setModalView]=useState(false);
    const navigation=useNavigation();
    const itemID=item.id;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay: index * 80,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            })
        ]).start();
    }, []);

    const typeColors = {
        "debit": "#FF6B6B",
        "credit": "#51CF66",
    };

    return (
        <>
            <TouchableOpacity onPress={()=>setModalView(true)}>
                <Animated.View
                    style={[
                        styles.orderCard,
                        { opacity: fadeAnim, transform: [{ translateY }] },
                    ]}
                >
                    <View style={styles.orderIconBox}>
                        <Ionicons name="cart-outline" size={24} color="#fff" />
                    </View>

                    <View style={styles.orderContent}>
                        <Text style={styles.orderAmount}>₹{item.amount ? item.amount.toLocaleString() : '0'}</Text>
                        <View style={styles.orderMetaRow}>
                            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
                            {item.remarks && <Text style={styles.orderQty}>• {item.remarks.substring(0, 20)}...</Text>}
                        </View>
                    </View>

                    <View style={[styles.typeTag, { backgroundColor: typeColors[item.transaction_type] || "#FF9966" }]}>
                        <Text style={styles.typeText}>
                            ORDER
                        </Text>
                    </View>
                </Animated.View>
            </TouchableOpacity>

            {modalView && (
                <Modal
                    animationType="slide"
                    transparent
                    visible={modalView}
                    onRequestClose={() => setModalView(false)}
                >
                    <View style={styles.modalBackground}>
                    <View style={styles.reportContainer}>

                        {/* ===== HEADER ===== */}
                        <View style={styles.header}>
                        <Text style={styles.title}>Sale Report</Text>
                        <Text style={styles.subTitle}>DETAILS</Text>
                        </View>

                        {/* ===== ORDER INFO ===== */}
                        <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sale Information</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.value}>{formatDate(item.date)}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Transaction Type</Text>
                            <Text style={styles.value}>
                            {item.transaction_type ? item.transaction_type.toUpperCase() : 'DEBIT'}
                            </Text>
                        </View>
                        </View>

                        {/* ===== FINANCIAL DETAILS ===== */}
                        <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Financial Summary</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Total Amount</Text>
                            <Text style={styles.totalValue}>
                            ₹ {item.amount ? item.amount.toLocaleString() : '0'}
                            </Text>
                        </View>
                        </View>

                        {/* ===== NOTES ===== */}
                        {item.remarks && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Remarks</Text>
                            <Text style={styles.notes}>{item.remarks}</Text>
                        </View>
                        )}

                        {/* ===== EDIT BUTTON ===== */}
                        <TouchableOpacity
                            style={styles.OrderEditBtn}
                            onPress={() => {
                                setModalView(false);
                                navigation.navigate('EditOrder', { itemID });
                            }}
                        >
                            <Text style={styles.closeText}>Edit Order</Text>
                        </TouchableOpacity>

                        {/* ===== CLOSE BUTTON ===== */}
                        <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setModalView(false)}
                        >
                        <Text style={styles.closeText}>Close Report</Text>
                        </TouchableOpacity>

                    </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.infoIconWrapper}>
            <Ionicons name={icon} size={18} color="#FF9966" />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const ConsumerDetails = ({ route }) => {
    const { consumerID } = route.params;

    const navigation=useNavigation();

    const [consumer, setConsumer] = useState(null);
    const [orders, setOrders] = useState(null);
    const [transactions, setTransactions] = useState(null);
    const [uploading, setUploading] = useState(false);

    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchConsumer = async () => {
        try {
            const { data, error } = await supabase
                .from('Consumers')
                .select('*')
                .eq('id', consumerID);

            if (error) {
                console.error('Consumer Fetch Error:', error.message);
                return;
            }

            setConsumer(data[0]);
        } catch (err) {
            console.error('Unexpected Error', err);
        }
    };

    const fetchOrders = async () => {
        try {
            // Fetch consumer's transactions (orders are debits)
            const { data, error } = await supabase
                .from('Transactions')
                .select('*')
                .eq('ref_type', 'consumer')
                .eq('ref_id', consumerID)
                .eq('transaction_type', 'debit')
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) {
                console.log('Order Fetching info:', error.message); 
                return;
            }

            setOrders(data);
        } catch (err) {
            console.error('Unexpected Error:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            // Fetch consumer's payments (credits)
            const { data, error } = await supabase
                .from('Transactions')
                .select('*')
                .eq('ref_type', 'consumer')
                .eq('ref_id', consumerID)
                .eq('transaction_type', 'credit')
                .order('created_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('Transaction Fetching Error:', error.message);
                return;
            }

            setTransactions(data);
        } catch (err) {
            console.error('Unexpected Error:', err);
        }
    };

    useEffect(() => {
        if (consumerID) {
            fetchConsumer();
            fetchOrders();
            fetchTransactions();
        }
    }, []);

    const base64ToUint8Array = (base64) => {
        const binaryString = global.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const handlePickImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow photo access to change image');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                quality: 0.7,
            });

            if (result.canceled) return;

            const localUri = result.assets[0].uri;
            await uploadImageAndReplaceOld(localUri);
        } catch (e) {
            console.error('Image Upload Error', e);
            Alert.alert('Error', 'Could not pick image');
        }
    };

    const uploadImageAndReplaceOld = async (localUri) => {
        setUploading(true);
        try {
            let oldUrl = consumer?.Image_URL;

            if (!oldUrl) {
                const { data: fresh, error: fetchErr } = await supabase
                    .from('Consumers')
                    .select('Image_URL')
                    .eq('id', consumerID)
                    .single();

                if (!fetchErr) oldUrl = fresh?.Image_URL;
            }

            const base64 = await FileSystem.readAsStringAsync(localUri, {
                encoding: 'base64',
            });

            const fileBytes = base64ToUint8Array(base64);
            const fileExt = localUri.split('.').pop().split('?')[0];
            const fileName = `${uuid.v4()}.${fileExt}`;
            const filePath = `Logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('consumer_logos')
                .upload(filePath, fileBytes, {
                    contentType: `image/${fileExt}`,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                Alert.alert('Upload failed', uploadError.message || 'Could not upload image.');
                setUploading(false);
                return;
            }

            const { data: publicData } = supabase.storage
                .from('consumer_logos')
                .getPublicUrl(filePath);

            const newPublicUrl = publicData?.publicUrl;

            if (!newPublicUrl) {
                Alert.alert('Error', 'Could not obtain public URL.');
                setUploading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from('Consumers')
                .update({ Image_URL: newPublicUrl })
                .eq('id', consumerID);

            if (updateError) {
                Alert.alert('Error', 'Could not update consumer record.');
                setUploading(false);
                return;
            }

            if (oldUrl) {
                const { error: removeErr } = await supabase.storage
                    .from('consumer_logos')
                    .remove([oldUrl]);
                if (removeErr) {
                    console.warn('Failed to delete old image:', removeErr.message);
                }
            }

            setConsumer(prev => ({ ...(prev || {}), Image_URL: newPublicUrl }));
            Alert.alert('Success', 'Image updated successfully!');
        } catch (e) {
            console.error('Upload error', e);
            Alert.alert('Error', 'Something went wrong during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Gradient */}
            <Animated.View style={[styles.headerSection, { opacity: headerAnim }]}>
                <LinearGradient
                    colors={['#FF9966', '#FF5E62']}
                    style={styles.gradientHeader}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity style={styles.editButton} onPress={()=>navigation.navigate('EditConsumer',{consumerID})}>
                        <Ionicons name='create-outline' size={20} color='#fff' />
                    </TouchableOpacity>

                    <View style={styles.profileContainer}>
                        <TouchableOpacity onPress={handlePickImage} disabled={uploading} style={styles.imageWrapper}>
                            <Image
                                source={consumer?.Image_URL ? { uri: consumer.Image_URL } : require('../../assets/user_icon.jpg')}
                                style={styles.profileImage}
                            />
                            {uploading && (
                                <View style={styles.uploadOverlay}>
                                    <ActivityIndicator size='small' color='#fff' />
                                </View>
                            )}
                            <View style={styles.cameraIconWrapper}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.nameText}>
                            {consumer?.Name || "Loading..."}
                        </Text>

                        {consumer?.By_Name && (
                            <Text style={styles.byNameText}>{consumer.By_Name}</Text>
                        )}
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Action Buttons */}
            <View style={styles.contentContainer}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={()=>navigation.navigate('ConsumerOrder',{ consumer })}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.actionButtonText}>
                            Add Sale
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={()=>navigation.navigate('ConsumerPayment',{ consumer })}>
                        <Ionicons name="wallet-outline" size={20} color="#FF9966" style={{ marginRight: 6 }} />
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Receive Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* Pending Amount Card */}
                <View style={styles.pendingCard}>
                    <View style={styles.pendingHeader}>
                        <Ionicons name="time-outline" size={22} color="#FF6B6B" />
                        <Text style={styles.pendingLabel}>Due Amount</Text>
                    </View>
                    <Text style={styles.pendingAmount}>
                        ₹{consumer?.Pending_Amount?.toLocaleString() ?? 0}
                    </Text>
                    
                    {/* Aggregated Cost Hint */}
                    <Text style={styles.aggregatedCostText}>
                        * Includes aggregated costs (transport, etc.)
                    </Text>
                </View>

                {/* Consumer Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Consumer Information</Text>

                    <View style={styles.detailsCard}>
                        <InfoRow
                            icon="location-outline"
                            label="Address"
                            value={consumer?.Address || "N/A"}
                        />
                        <View style={styles.divider} />

                        <InfoRow
                            icon="call-outline"
                            label="Contact"
                            value={consumer?.Contact || "N/A"}
                        />
                    </View>
                </View>

                {/* Last Orders (Sales) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Sales</Text>
                        {orders && orders.length>0?(
                            <TouchableOpacity onPress={()=>navigation.navigate('OrderDetails',{consumerID})}>
                                <Text style={styles.seeMoreText}>See All →</Text>
                            </TouchableOpacity>):''
                        }
                    </View>

                    {orders && orders.length > 0 ? (
                        <FlatList
                            data={orders}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <OrderItem item={item} index={index} />
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="cart-outline" size={48} color="#E0E0E0" />
                            <Text style={styles.emptyText}>No sales yet</Text>
                        </View>
                    )}
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        {transactions && transactions.length > 0 ? (
                            <TouchableOpacity onPress={() => navigation.navigate('RecentTransactions', { consumerID, consumer })}>
                                <Text style={styles.seeMoreText}>See All →</Text>
                            </TouchableOpacity>
                        ) : ''}
                    </View>

                    {transactions && transactions.length > 0 ? (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <TransactionItem item={item} index={index} consumer={consumer} />
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="wallet-outline" size={48} color="#E0E0E0" />
                            <Text style={styles.emptyText}>No transactions yet</Text>
                        </View>
                    )}
                </View>

                {/* Delete Button */}
                <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.deleteButtonText}>Delete Consumer</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ConsumerDetails;
export { OrderItem, TransactionItem };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA"
    },
    headerSection: {
        marginBottom: -30,
    },
    gradientHeader: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    editButton: {
        position: "absolute",
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 55,
        right: 20,
        backgroundColor: "rgba(255,255,255,0.3)",
        padding: 10,
        borderRadius: 12,
        zIndex: 10,
    },
    profileContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    imageWrapper: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconWrapper: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FF9966',
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#fff',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
        color: "#fff"
    },
    byNameText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#FF9966',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#FF9966',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#FF9966',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    secondaryButtonText: {
        color: '#FF9966',
    },
    pendingCard: {
        marginTop: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    pendingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    pendingLabel: {
        fontSize: 15,
        color: "#666",
        fontWeight: '500',
    },
    pendingAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: "#FF6B6B",
        marginTop: 4,
    },
    aggregatedCostText: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 5
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: '#1A1A1A',
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: "#FF9966"
    },
    detailsCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#FFF0E6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#999',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
    },
    txCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    txIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    txContent: {
        flex: 1,
    },
    txAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    txDate: {
        fontSize: 13,
        marginTop: 4,
        color: "#999",
    },
    modeTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    modeText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    actionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    invoiceModalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    separator: {
        height: 12,
    },
    orderCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    orderIconBox: {
        width: 48,
        height: 48,
        backgroundColor: "#FF9966",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    orderContent: {
        flex: 1,
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    orderMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    orderDate: {
        fontSize: 13,
        color: "#999",
    },
    orderQty: {
        fontSize: 13,
        color: "#666",
        marginLeft: 4,
    },
    typeTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        color: "#fff",
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    emptyState: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    emptyText: {
        color: "#999",
        marginTop: 12,
        fontSize: 15,
    },
    deleteButton: {
        marginTop: 30,
        padding: 16,
        backgroundColor: "#FF6B6B",
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: '600',
        fontSize: 15,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        padding: 16,
    },
    reportContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 6,
    },
    header: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    subTitle: {
        fontSize: 13,
        color: '#FF9966',
        fontWeight: '600',
        marginTop: 4,
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    label: {
        fontSize: 13,
        color: '#777',
    },
    value: {
        fontSize: 13,
        fontWeight: '500',
        color: '#222',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    qualityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    good: {
        backgroundColor: '#2e7d32',
    },
    average: {
        backgroundColor: '#f9a825',
    },
    bad: {
        backgroundColor: '#c62828',
    },
    notes: {
        fontSize: 13,
        color: '#444',
        marginTop: 4,
    },
    closeBtn: {
        marginTop: 16,
        backgroundColor: '#000',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    OrderEditBtn:{
        marginTop:16,
        backgroundColor:'#ba0b1a',
        paddingVertical:10,
        borderRadius:8,
        alignItems:'center'
    },
    closeText: {
        color: '#fff',
        fontWeight: '600',
    },
});