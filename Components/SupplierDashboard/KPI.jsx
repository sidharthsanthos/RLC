import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import KPICard from './KPICard';
import { useNavigation } from '@react-navigation/native';

const KPI = ({refreshKey}) => {

    const [kpi,setKpi]=useState(null);
    const [loading,setLoading]=useState(false);
    const navigation=useNavigation();

    const fetchKPI=async ()=>{
        try{
            const {data,error}=await supabase
               .from('dashboard_kpis')
               .select('*')
               .limit(1);

            if(error){
                console.error('KPI fetch error occured',error.message);
                return;
            }

            setKpi(data && data.length > 0 ? data[0] : null);
        }catch(err){
            console.error('Unexpected error occured',err);
        }
    }

    useEffect(()=>{
        fetchKPI();
    },[refreshKey]);

    if(loading){
        return <Text style={{padding:16}}>Loading KPIs....</Text>;
    }

    if(!kpi) return null;

    const data=[
        {
            title:'Total Pending',
            value:`₹${kpi.total_pending_amount}`,
            route:'PendingSuppliers',
            color:'#FF9800',
        },
        {
            title:'Payments (Month)',
            value:`₹${kpi.payments_this_month}`,
            route:'PaymentsThisMonth',
            color:'#4CAF50',
        },
        {
            title:'Total Suppliers',
            value:kpi.total_suppliers,
            route:'TotalSuppliers',
            color:'#2563EB',
        },
        {
            title:'Stock Value',
            value:`₹${kpi.total_stock_values}`,
            route:'StockValue',
            color:'#DC2626',
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
                    <KPICard title={item.title} value={item.value} onPress={()=>navigation.navigate(item.route)} color={item.color}/>
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