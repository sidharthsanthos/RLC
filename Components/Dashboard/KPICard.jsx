import { Pressable, StyleSheet, Text, View } from 'react-native';

const KPICard = ({ title, value, onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </Pressable>
  );
};

export default KPICard;

const styles = StyleSheet.create({
  card: {
    width: 170,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 3
  },
  title: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111'
  }
});
