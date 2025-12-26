import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseConfig';
import KPICard from './KPICard';
import { useNavigation } from '@react-navigation/native';

const KPI = () => {

    const [kpi,setKpi]=useState(null);
    const [loading,setLoading]=useState(false);
    const navigation=useNavigation();

    const fetchKPI=async ()=>{
        try{
            const {data,error}=await supabase
               .from('dashboard_kpis')
               .select('*')
               .single();

            if(error){
                console.error('KPI fetch error occured',error.message);
                return;
            }

            setKpi(data);
        }catch(err){
            console.error('Unexpected error occured',err);
        }
    }

    useEffect(()=>{
        fetchKPI();
    },[]);

    if(loading){
        return <Text style={{padding:16}}>Loading KPIs....</Text>;
    }

    if(!kpi) return null;

    const data=[
        {
            title:'Total Pending',
            value:`₹${kpi.total_pending_amount}`,
            route:'PendingSuppliers',
        },
        {
            title:'Payments This Month',
            value:`₹${kpi.payments_this_month}`,
            route:'PaymentsThisMonth',
        },
        {
            title:'Total Suppliers',
            value:kpi.total_suppliers,
            route:'TotalSuppliers',
        },
        {
            title:'Stock Value',
            value:`₹${kpi.total_stock_values}`,
            route:'PendingSuppliers',
        },
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item)=>item.title}
                renderItem={({item})=>(
                    <KPICard title={item.title} value={item.value} onPress={()=>navigation.navigate(item.route)}/>
                )}
            />
        </View>
    )
}

export default KPI

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingLeft: 16
    },
})