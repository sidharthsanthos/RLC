import { Platform, StatusBar, StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../utils/supabase';
import UserIcon from '../../assets/user_icon.jpg';

const TotalConsumers = () => {

    const navigation = useNavigation();
    const [consumers, setConsumers] = useState([]);

    const fetchConsumers = async () => {
        try {
            const { data, error } = await supabase
                .from('Consumers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Consumers Fetching Error Occurred', error.message);
                return;
            }

            setConsumers(data);
        } catch (err) {
            console.error('Unexpected Error Occurred', err);
        }
    }

    useEffect(() => {
        fetchConsumers();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.consumerCard} 
            onPress={() => navigation.navigate('ConsumerDetails', { consumerID: item.id })}
        >
            <Image source={item.Image_URL ? { uri: item.Image_URL } : UserIcon} style={styles.consumerImage} />
            <View style={styles.consumerInfo}>
                <Text style={styles.consumerName}>{item.Name}</Text>
                {item.By_Name ? <Text style={styles.byName}>By: {item.By_Name}</Text> : null}
                {item.Contact ? <Text style={styles.contact}>📞 {item.Contact}</Text> : null}
                {item.Pending_Amount > 0 && (
                    <Text style={styles.pendingAmount}>Pending: ₹{parseFloat(item.Pending_Amount).toLocaleString('en-IN')}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (consumers.length === 0) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ marginTop: 10 }}>Loading Consumers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={consumers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

export default TotalConsumers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f0f2f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    consumerCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    consumerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#e0e0e0',
    },
    consumerInfo: {
        flex: 1,
    },
    consumerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    byName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    contact: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    pendingAmount: {
        fontSize: 14,
        color: '#FF9800',
        fontWeight: 'bold',
        marginTop: 4
    }
})
