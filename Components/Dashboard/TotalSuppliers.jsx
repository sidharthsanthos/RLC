import { Platform, StatusBar, StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import { useNavigation } from '@react-navigation/native';
import UserIcon from '../../assets/user_icon.jpg';

const TotalSuppliers = () => {

    const navigation=useNavigation();

    const [suppliers,setSuppliers]=useState([]);

    const fetchSuppliers=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Suppliers')
               .select('*')
               .eq('Activity_Status',1);

            if(error){
                console.error('Suppliers Fetching Error Occured',error.message);
                return;
            }

            setSuppliers(data);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchSuppliers();
    },[]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.supplierCard} onPress={()=>navigation.navigate('SupplierDetails',{supplierID:item.id})}>
            <Image source={item.Image_URL ? { uri:item.Image_URL }:UserIcon} style={styles.supplierImage} />
            <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{item.Name}</Text>
                {item.By_Name ? <Text style={styles.byName}>By: {item.By_Name}</Text> : null}
            </View>
        </TouchableOpacity>
    );

    if (suppliers.length === 0) { // Check for empty array to show loading/no data
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading Suppliers...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={suppliers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

export default TotalSuppliers

const styles = StyleSheet.create({
    container:{
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
    supplierCard: {
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
    supplierImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#e0e0e0', // Placeholder background
    },
    supplierInfo: {
        flex: 1,
    },
    supplierName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    byName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
})