import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';

const InventoryTrendCard = () => {

    const [data,setData]=useState(null);
    const [loading,setLoading]=useState(false);

    const fetchTodayInventory=async ()=>{
        const today=new Date().toISOString().split('T')[0];

        try{
            setLoading(true);

            const {data,error}=await supabase
               .from('daily_inventory_summary')
               .select('*')
               .eq('date',today)
               .single();

            if(error){
                console.error('Fetching View Error Occured',error.message);
                return;
            }

            setData(data);
            setLoading(false);
        }catch(err){
            console.error('Unexpected Error Occured',err);
        }
    }

    useEffect(()=>{
        fetchTodayInventory();
    },[]);

    if(loading){
        return(
            <View style={styles.card}>
                <Text style={styles.loadingText}>Loading Inventory....</Text>
            </View>
        )
    }

    if (!data) {
        return (
        <View style={styles.card}>
            <Text style={styles.loadingText}>No inventory data for today</Text>
        </View>
        )
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Today's Inventory</Text>
            
            <View style={styles.statsContainer}>
                <View style={[styles.statBox, styles.totalBox]}>
                    <Text style={styles.label}>Total Bags</Text>
                    <Text style={[styles.value, styles.totalValue]}>{data.total_bags}</Text>
                </View>

                <View style={[styles.statBox, styles.soldBox]}>
                    <Text style={styles.label}>Sold</Text>
                    <Text style={[styles.value, styles.soldValue]}>{data.sold_bags}</Text>
                </View>

                <View style={[styles.statBox, styles.remainingBox]}>
                    <Text style={styles.label}>Remaining</Text>
                    <Text style={[styles.value, styles.remainingValue]}>{data.remaining_bags}</Text>
                </View>
            </View>
        </View>
    )
}

export default InventoryTrendCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalBox: {
    backgroundColor: '#F0F4FF',
  },
  soldBox: {
    backgroundColor: '#FFF0EE',
  },
  remainingBox: {
    backgroundColor: '#E8F5E9',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
  },
  totalValue: {
    color: '#2563EB',
  },
  soldValue: {
    color: '#E5533D',
  },
  remainingValue: {
    color: '#2E7D32',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
})