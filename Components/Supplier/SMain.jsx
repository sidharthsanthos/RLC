import { FlatList, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseConfig';
import { useNavigation } from '@react-navigation/native';


const SMain = () => {

    const navigation=useNavigation();    
    const [searchText,setSearchText]=useState('');
    const [suppliers,setSuppliers]=useState([]);
    const [filtered,setFiltered]=useState([]);
    const [debouncedText,setDebouncedText]=useState('');

    const fetchSuppliers=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Suppliers')
               .select('id,Name,By_Name');
            
            if(error){
                console.error('Supplier Selection Error Occured');
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

    useEffect(()=>{
        if(searchText.trim()===""){
            setFiltered([]);
            return;
        }

        const results=suppliers.filter(item=>
            item.Name.toLowerCase().includes(searchText.toLowerCase())
        );

        setFiltered(results);
    },[searchText]);

    // useEffect(()=>{
    //     const timer=setTimeout(()=>{
    //         setDebouncedText(searchText);
    //         console.log('debouncedText:',debouncedText);
            
    //     },300);

    //     return ()=>clearTimeout(timer);
    // },[searchText]);

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons name='search' size={20} color='#888' style={{ marginLeft:10 }}/>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search Supplier Name'
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {searchText?(
                <View>
                    {filtered.length>0 && (
                        <Text style={styles.resultsHeader}>
                            Showing Results for {searchText?searchText:'machine'}
                        </Text>
                    )}

                    <FlatList
                       data={filtered}
                       keyExtractor={(item)=>item.id.toString()}
                       renderItem={({item})=>(
                        <TouchableOpacity style={styles.itemBox} onPress={()=>navigation.navigate("SupplierDetails",  {supplierID:item.id})}>
                            <Text style={styles.name}>{item.Name}</Text>                        
                        </TouchableOpacity>
                       )}
                    />

                    {searchText!=="" && filtered.length===0 && (
                        <Text style={styles.placeholderText}>No Suppliers Found</Text>
                    )}

                </View>
            ):(
                <View>
                    <Text>
                        Main Area for Displaying Supplier Details
                    </Text>
                </View>
            )}

        </View>
  )
}

export default SMain

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 15,
    },

    // 🔎 Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },

    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },

    // 📌 Results Header
    resultsHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#444',
    },

    // 📦 Supplier Item Box
    itemBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginVertical: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },

    name: {
        fontSize: 17,
        fontWeight: '500',
        color: '#222',
    },

    // ⛔ No Results Text
    noResultText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#888',
    },

    // 📝 Placeholder text (when no search)
    placeholderText: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    }
});
