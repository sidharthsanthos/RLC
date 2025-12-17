import { FlatList, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../utils/supabase';
import { useNavigation } from '@react-navigation/native';

const CMain = () => {

    const navigation=useNavigation();    
    const [searchText,setSearchText]=useState('');
    const [consumers,setConsumers]=useState([]);
    const [filtered,setFiltered]=useState([]);

    const fetchConsumers=async ()=>{
        try{
            const {data,error}=await supabase
               .from('Consumers')
               .select('id,Name,By_Name');
            
            if(error){
                console.error('Consumer Selection Error Occurred', error.message);
                return;
            }

            setConsumers(data);
        }catch(err){
            console.error('Unexpected Error Occurred',err);
        }
    }

    useEffect(()=>{
        fetchConsumers();
    },[]);

    useEffect(()=>{
        if(searchText.trim()===""){
            setFiltered([]);
            return;
        }

        const results=consumers.filter(item=>
            item.Name.toLowerCase().includes(searchText.toLowerCase())
        );

        setFiltered(results);
    },[searchText]);

    return (
        <View style={styles.container}>

            <View style={styles.searchContainer}>
                <Ionicons name='search' size={20} color='#888' style={{ marginLeft:10 }}/>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search Consumer Name'
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {searchText?(
                <View>
                    {filtered.length>0 && (
                        <Text style={styles.resultsHeader}>
                            Showing Results for {searchText}
                        </Text>
                    )}

                    <FlatList
                       data={filtered}
                       keyExtractor={(item)=>item.id.toString()}
                       renderItem={({item})=>(
                        <TouchableOpacity style={styles.itemBox} onPress={()=>navigation.navigate("ConsumerDetails",  {consumerID:item.id})}>
                            <Text style={styles.name}>{item.Name}</Text>                        
                        </TouchableOpacity>
                       )}
                    />

                    {searchText!=="" && filtered.length===0 && (
                        <Text style={styles.placeholderText}>No Consumers Found</Text>
                    )}

                </View>
            ):(
                <View style={styles.mainArea}>
                     <FlatList
                       data={consumers}
                       keyExtractor={(item)=>item.id.toString()}
                       renderItem={({item})=>(
                        <TouchableOpacity style={styles.itemBox} onPress={()=>navigation.navigate("ConsumerDetails",  {consumerID:item.id})}>
                            <Text style={styles.name}>{item.Name}</Text>
                            {item.By_Name && <Text style={styles.byName}>{item.By_Name}</Text>}
                        </TouchableOpacity>
                       )}
                    />
                </View>
            )}

        </View>
  )
}

export default CMain

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 15,
    },
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
    resultsHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#444',
    },
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
    byName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2
    },
    mainArea: {
        flex: 1,
    },
    placeholderText: {
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
    }
});
