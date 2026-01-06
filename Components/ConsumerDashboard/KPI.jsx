import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase';
import KPICard from './KPICard';
import { useNavigation } from '@react-navigation/native';

const KPI = ({ refreshKey }) => {

    const [kpi, setKpi] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const fetchKPI = async () => {
        try {
            const { data, error } = await supabase
                .from('consumer_dashboard_kpis')
                .select('*')
                .single();

            if (error) {
                console.error('KPI fetch error occurred', error.message);
                return;
            }

            setKpi(data);
        } catch (err) {
            console.error('Unexpected error occurred', err);
        }
    }

    useEffect(() => {
        fetchKPI();
    }, [refreshKey]);

    if (loading) {
        return <Text style={{ padding: 16 }}>Loading KPIs....</Text>;
    }

    if (!kpi) return null;

    const data = [
        {
            title: 'Total Pending',
            value: `₹${kpi.total_pending_amount || 0}`,
            route: 'PendingConsumers',
            color: '#FF9800',
        },
        {
            title: 'Sales (Month)',
            value: `₹${kpi.sales_this_month || 0}`,
            route: 'SalesThisMonth',
            color: '#4CAF50',
        },
        {
            title: 'Total Consumers',
            value: kpi.total_consumers || 0,
            route: 'TotalConsumers',
            color: '#2563EB',
        },
        {
            title: 'Payments (Month)',
            value: `₹${kpi.payments_this_month || 0}`,
            route: 'PaymentsThisMonth',
            color: '#DC2626',
        },
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                    <KPICard 
                        title={item.title} 
                        value={item.value} 
                        onPress={() => navigation.navigate(item.route)} 
                        color={item.color} 
                    />
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
