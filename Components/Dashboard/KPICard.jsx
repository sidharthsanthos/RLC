import { Pressable, StyleSheet, Text, View } from 'react-native';

const KPICard = ({ title, value, onPress, color }) => {
  // Determine if value is monetary
  const isMonetary = typeof value === 'string' && value.includes('₹');
  
  // Extract numeric part for potential formatting
  const displayValue = value;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.pressable,
      pressed && styles.pressed
    ]}>
      <View style={styles.card}>
        {/* Decorative accent bar */}
        <View style={[styles.accentBar,{backgroundColor:color}]} />
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {displayValue}
          </Text>
          
          {/* Subtle indicator */}
          <View style={styles.footer}>
            <Text style={[styles.viewDetails,{color:color}]}>View Details →</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default KPICard;

const styles = StyleSheet.create({
  pressable: {
    marginRight: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  card: {
    width: 180,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: '600',
  },
});