import { Platform,StatusBar,StyleSheet,Text,View,TouchableOpacity,Image,ScrollView,FlatList,Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseConfig';
import { Ionicons } from '@expo/vector-icons';

const formatDate=(isoDate)=>{
        if(!isoDate) return "";
        const d=new Date(isoDate);
        const day=String(d.getDate()).padStart(2,'0');
        const month=String(d.getMonth()+1).padStart(2,'0');
        const year=d.getFullYear();
        return `${day}-${month}-${year}`;
};

const TransactionItem = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 120,
            useNativeDriver: true,
        }).start();

        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            delay: index * 120,
            useNativeDriver: true,
        }).start();
    }, []);

    const modeColors = {
        cash: "#FF8A65",
        upi: "#4CAF50",
        bank: "#42A5F5",
        null: "#BDBDBD",
    };

    return (
        <Animated.View
            style={[
                styles.txCard,
                { opacity: fadeAnim, transform: [{ translateY }] }
            ]}
        >
            {/* Left Icon */}
            <View style={styles.txIconBox}>
                <Ionicons name="swap-vertical" size={22} color="#fff" />
            </View>

            {/* Main Content */}
            <View style={styles.txContent}>
                <Text style={styles.txAmount}>₹ {item.amount}</Text>
                <Text style={styles.txDate}>{formatDate(item.date)}</Text>
            </View>

            {/* Mode Tag */}
            <View style={[styles.modeTag, { backgroundColor: modeColors[item.mode] || "#BDBDBD" }]}>
                <Text style={styles.modeText}>
                    {item.mode ? item.mode.toUpperCase() : "NA"}
                </Text>
            </View>
        </Animated.View>
    );
};

const OrderItem = ({ item, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 120,
            useNativeDriver: true,
        }).start();

        Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            delay: index * 120,
            useNativeDriver: true,
        }).start();
    }, []);

    const typeColors = {
        "in-stock": "#4CAF50",
        "out-stock": "#EF5350",
    };

    return (
        <Animated.View
            style={[
                styles.orderCard,
                { opacity: fadeAnim, transform: [{ translateY }] },
            ]}
        >
            {/* Icon */}
            <View style={styles.orderIconBox}>
                <Ionicons name="cube-outline" size={22} color="#fff" />
            </View>

            {/* Content */}
            <View style={styles.orderContent}>
                <Text style={styles.orderAmount}>₹ {item.Total_Amount}</Text>
                <Text style={styles.orderDate}>{formatDate(item.Date)}</Text>
                <Text style={styles.orderQty}>
                    {item.Net_Quantity} Bags
                </Text>
            </View>

            {/* Tag */}
            <View
                style={[
                    styles.typeTag,
                    { backgroundColor: typeColors[item.Stock_Type] || "#607D8B" },
                ]}
            >
                <Text style={styles.typeText}>
                    {item.Stock_Type.toUpperCase()}
                </Text>
            </View>
        </Animated.View>
    );
};



const SupplierDetails = ({ route }) => {

    const { supplierID } = route.params;

    const [supplier, setSupplier] = useState(null);
    const [stock,setStock]=useState(null);
    const [transactions,setTransactions]=useState(null);

    const fetchSupplier = async () => {
        try {
            const { data, error } = await supabase
                .from('Suppliers')
                .select('*')
                .eq('id', supplierID);

            if (error) {
                console.error('Supplier Fetch Error:', error.message);
                return;
            }

            setSupplier(data[0]);

        } catch (err) {
            console.error('Unexpected Error', err);
        }
    };

    const fetchStock=async ()=>{
        try{
            console.log(supplierID);

            const {data,error}=await supabase
               .from('Stock') 
               .select('*') 
               .eq('Supplier_ID',supplierID)
               .order('created_at',{ascending:false})
               .limit(3);
            
            if(error){ 
                console.error('Stock Fetching Error Occured',error.message); 
                return; 
            }

            console.log('data2:',data[0]);
            
            setStock(data);
        
        }catch(err){ 
            console.error('Unexpected Error Occured',err); 
        } 
    } 
        
    const fetchTransactions=async ()=>{ 
        try{ 
            console.log('id:',supplierID);

            const {data,error}=await supabase
                .from('Transactions') 
                .select('*') 
                .eq('ref_type','supplier') 
                .eq('ref_id',supplierID)
                .order('created_at',{ascending:false})
                .limit(3);
                
            if(error){ 
                console.error('Transaction Fetching Error Occured',error.message);
                return; 
            } 
            
            console.log('transactions:',data[0]);

            setTransactions(data);

        }catch(err){ 
            console.error('Unexpected Error Occured',err); 
        } 
    }

    useEffect(() => {
        if (supplierID) {
            fetchSupplier();
            fetchStock();
            fetchTransactions();
        }
    }, []);

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <View style={{position:'relative'}}>

                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name='create-outline' size={22} color='#fff'/>
                </TouchableOpacity>

                {/* --- Profile Image Placeholder --- */}
                <View style={styles.profileContainer}>
                    <TouchableOpacity>
                        <Image
                            source={supplier?.Image_URL ? { uri: supplier.Image_URL } : require('E:/projects/RLC/assets/user_icon.jpg')}
                            style={styles.profileImage}
                        />

                    </TouchableOpacity>

                    <Text style={styles.nameText}>
                        {supplier?.Name || "Loading..."}
                    </Text>

                    {supplier?.By_Name ? (
                        <Text style={styles.byNameText}>{supplier.By_Name}</Text>
                    ) : null}
                </View>

            </View>

            {/* --- Action Buttons --- */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Add Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Add Transaction</Text>
                </TouchableOpacity>
            </View>

            {/* --- Pending Amount --- */}
            <View style={styles.pendingCard}>
                <Text style={styles.pendingLabel}>Pending Amount</Text>
                <Text style={styles.pendingAmount}>
                    ₹ {supplier?.Pending_Amount ?? 0}
                </Text>
            </View>

            {/* --- Basic Details --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Supplier Details</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue}>{supplier?.Address}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{supplier?.Contact}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>State:</Text>
                    <Text style={styles.detailValue}>{supplier?.State}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Supply Type:</Text>
                    <Text style={styles.detailValue}>
                        {supplier?.Supply_Type === 1 ? "Sack" : "Kg"}
                    </Text>
                </View>
            </View>

            {/* --- Last Orders Header --- */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Last Orders</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMoreText}>See All</Text>
                </TouchableOpacity>
            </View>

            {stock && stock.length > 0 ? (
                <FlatList
                    data={stock.slice(0, 3)}   // latest 3 only
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <OrderItem item={item} index={index} />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    scrollEnabled={false}
                />
            ) : (
                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>No orders available</Text>
                </View>
            )}


            {/* --- Recent Transactions Header --- */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Recent Transactions</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMoreText}>See All</Text>
                </TouchableOpacity>
            </View>

            {transactions && transactions.length > 0 ? (
                <FlatList
                    data={transactions.slice(0, 3)}   // Already fetched latest 3
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TransactionItem item={item} index={index} />
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    scrollEnabled={false} // FlatList acts like static list
                />
            ) : (
                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>No transactions available</Text>
                </View>
            )}


            {/* --- Delete Button --- */}
            <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete Supplier</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default SupplierDetails;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingHorizontal: 16,
        backgroundColor: "#F7F7F7"
    },
    /* Profile Section */
    profileContainer: { 
        alignItems: 'center',
        marginTop: 20
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#ddd'
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
        color: "#333"
    },
    byNameText: {
        fontSize: 15,
        color: "#666"
    },
    /* Buttons */
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#0066FF',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600'
    },
    /* Pending Card */
    pendingCard: {
        marginTop: 20,
        backgroundColor: '#FFE4CC',
        padding: 20,
        borderRadius: 12
    },
    pendingLabel: {
        fontSize: 14,
        color: "#555"
    },
    pendingAmount: {
        fontSize: 26,
        fontWeight: 'bold',
        color: "#CC5200",
        marginTop: 5
    },
    /* Details Section */
    section: {
        marginTop: 25,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4
    },
    detailLabel: {
        fontWeight: '600',
        color: "#444"
    },
    detailValue: {
        color: "#666"
    },
    /* Headers */
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        paddingHorizontal: 5
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700'
    },
    seeMoreText: {
        fontSize: 14,
        fontWeight: '600',
        color: "#0066FF"
    },
    placeholderBox: {
        marginTop: 10,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: 'center'
    },
    placeholderText: {
        color: "#999"
    },
    /* Delete Button */
    deleteButton: {
        marginTop: 30,
        padding: 14,
        backgroundColor: "#FF4444",
        borderRadius: 10,
        alignItems: 'center'
    },
    deleteButtonText: {
        color: "#fff",
        fontWeight: '600'
    },
    section: {
        marginTop: 20,
    },
    // headerRow: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     paddingHorizontal: 5,
    //     marginBottom: 10,
    // },
    // headerTitle: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     color: '#222',
    // },
    // seeMoreText: {
    //     color: '#4A90E2',
    //     fontSize: 14,
    // },
    card: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    cardLabel: {
        fontSize: 14,
        color: '#555',
    },
    cardValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    txCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    txIconBox: {
        width: 40,
        height: 40,
        backgroundColor: "#6C63FF",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    txContent: {
        flex: 1,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    txDate: {
        fontSize: 13,
        marginTop: 2,
        color: "#757575",
    },
    modeTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    modeText: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "600",
    },
    separator: {
        height: 12,
    },
    orderCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 14,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    orderIconBox: {
        width: 42,
        height: 42,
        backgroundColor: "#6C63FF",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    orderContent: {
        flex: 1,
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    orderDate: {
        fontSize: 13,
        color: "#757575",
        marginTop: 3,
    },
    orderQty: {
        fontSize: 13,
        marginTop: 3,
        color: "#424242",
    },
    typeTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    typeText: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "600",
    },
    editButton: {
        position: "absolute",
        top: 10,
        right: 15,
        backgroundColor: "#6C63FF",
        padding: 8,
        borderRadius: 20,
        zIndex: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
});
