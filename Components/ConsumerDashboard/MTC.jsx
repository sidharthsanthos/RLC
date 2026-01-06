import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../utils/supabase';

const screenWidth = Dimensions.get('window').width;

const MonthlyTransactionChart = ({ refreshKey }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        fetchMonthlyTrend();
    }, [refreshKey]);

    const fetchMonthlyTrend = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('consumer_transactions_monthly_trend')
                .select('*')
                .order('month', { ascending: false })
                .limit(6);

            if (error) {
                console.error('Chart data error:', error.message);
                setError('Failed to load chart data');
                return;
            }

            if (!data || data.length === 0) {
                setError('No data available');
                return;
            }

            const sortedData = data.reverse();

            // Convert SQL data → chart format
            const labels = sortedData.map(item =>
                new Date(item.month).toLocaleString('default', { month: 'short' })
            );

            const values = sortedData.map(item => parseFloat(item.total_amount) || 0);

            // Calculate total for display
            const total = values.reduce((sum, val) => sum + val, 0);
            setTotalAmount(total);

            setChartData({
                labels,
                datasets: [{ data: values }]
            });
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text style={styles.loadingText}>Loading chart...</Text>
                </View>
            </View>
        );
    }

    if (error || !chartData) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error || 'No data available'}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Monthly Sales Trend</Text>
                <Text style={styles.subtitle}>Last 6 Months</Text>
            </View>

            <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Total Sales</Text>
                <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>

            <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#2563EB'
                    },
                    propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#e5e7eb',
                        strokeWidth: 1
                    }
                }}
                bezier
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
            />

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                    <Text style={styles.legendText}>Consumer Sales</Text>
                </View>
            </View>
        </View>
    );
};

export default MonthlyTransactionChart;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    header: {
        marginBottom: 16
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 12,
        color: '#666'
    },
    totalSection: {
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB'
    },
    totalLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563EB'
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb'
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6
    },
    legendText: {
        fontSize: 12,
        color: '#666'
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666'
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 12
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
});
