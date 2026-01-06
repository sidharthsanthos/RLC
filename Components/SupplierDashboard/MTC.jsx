import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../utils/supabase';

const screenWidth = Dimensions.get('window').width;

const MonthlyTransactionChart = ({refreshKey}) => {
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
        .from('dashboard_transactions_monthly_trend')
        .select('*')
        .order('month', { ascending: false })
        .limit(6); // Get 6 months for better trend visibility

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
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!chartData) {
    return null;
  }

  // Format total amount with Indian currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <View style={styles.card}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Monthly Payments Trend</Text>
          <Text style={styles.subtitle}>Last 6 months</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 64} // Account for card padding
          height={240}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '3',
              stroke: '#4f46e5',
              fill: '#ffffff'
            },
            propsForBackgroundLines: {
              strokeDasharray: '', // solid lines
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
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Payment Amount</Text>
        </View>
      </View>
    </View>
  );
};

export default MonthlyTransactionChart;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  totalContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4f46e5',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4f46e5',
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});