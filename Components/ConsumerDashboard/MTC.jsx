import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../utils/supabase';

const screenWidth = Dimensions.get('window').width;

const MonthlyTransactionChart = ({ refreshKey }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalSales, setTotalSales] = useState(0);
    const [totalPayments, setTotalPayments] = useState(0);
    const [currentPending, setCurrentPending] = useState(0);

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

            const salesValues = sortedData.map(item => parseFloat(item.total_sales) || 0);
            const paymentValues = sortedData.map(item => parseFloat(item.total_payments) || 0);

            // Calculate totals for display
            const totalSalesSum = salesValues.reduce((sum, val) => sum + val, 0);
            const totalPaymentsSum = paymentValues.reduce((sum, val) => sum + val, 0);
            const latestPending = parseFloat(sortedData[sortedData.length - 1]?.current_pending) || 0;

            setTotalSales(totalSalesSum);
            setTotalPayments(totalPaymentsSum);
            setCurrentPending(latestPending);

            setChartData({
                labels,
                datasets: [
                    {
                        data: salesValues,
                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                        strokeWidth: 2
                    },
                    {
                        data: paymentValues,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                        strokeWidth: 2
                    }
                ]
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

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.salesCard]}>
                    <Text style={styles.statLabel}>Total Sales</Text>
                    <Text style={[styles.statAmount, styles.salesAmount]}>₹{totalSales.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.statCard, styles.paymentsCard]}>
                    <Text style={styles.statLabel}>Total Payments</Text>
                    <Text style={[styles.statAmount, styles.paymentsAmount]}>₹{totalPayments.toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.statCard, styles.pendingCard]}>
                    <Text style={styles.statLabel}>Current Pending</Text>
                    <Text style={[styles.statAmount, styles.pendingAmount]}>₹{currentPending.toLocaleString('en-IN')}</Text>
                </View>
            </View>

            <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={240}
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
                        r: '4',
                        strokeWidth: '2'
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
                    <Text style={styles.legendText}>Sales</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.legendText}>Payments</Text>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 8
    },
    statCard: {
        flex: 1,
        minWidth: '30%',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3
    },
    salesCard: {
        backgroundColor: '#eff6ff',
        borderLeftColor: '#2563EB'
    },
    paymentsCard: {
        backgroundColor: '#f0fdf4',
        borderLeftColor: '#22C55E'
    },
    pendingCard: {
        backgroundColor: '#fef3c7',
        borderLeftColor: '#f59e0b'
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 4
    },
    statAmount: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    salesAmount: {
        color: '#2563EB'
    },
    paymentsAmount: {
        color: '#22C55E'
    },
    pendingAmount: {
        color: '#f59e0b'
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
