import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import ConsumerList from './ConsumerList';
import Reports from './Reports';
import AddOrder from './AddOrder';
import AddPayment from './AddPayment';
import SOrder from '../Supplier/SOrder';
import AddOrderNew from './COrder';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Separate stack for Reports tab
const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name='ReportsScreen' component={Reports} />
  </Stack.Navigator>
);

function BackToScreen({ navigation }) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && navigation) {
      const timer = setTimeout(() => {
        navigation.navigate('Index');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFocused, navigation]);

  return null;
}
export default function ConsumerTabs() {
  return (
    <Tab.Navigator
      initialRouteName='ConsumerList'
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0a84ff',
        tabBarInactiveTintColor: '#8e8e93',
      }}
    >
      <Tab.Screen
        name='HomeRedirect'
        component={BackToScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='arrow-back-circle-outline' size={size} color={color} />
          )
        }}
      />


      <Tab.Screen
        name='ConsumerList'
        component={ConsumerList}
        options={{
          tabBarLabel: 'Consumers',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='people-outline' size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />

      <Tab.Screen
        name='AddOrder'
        component={AddOrderNew}
        options={{
          tabBarLabel: 'Add Order',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='cart-outline' size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />
      <Tab.Screen
        name='AddPayment'
        component={AddPayment}
        options={{
          tabBarLabel: 'Add Payment',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='wallet-outline' size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />
      <Tab.Screen
        name='Reports'
        component={Reports}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='document-text-outline' size={size} color={color} />
          ),
          unmountOnBlur: true
        }}
      />
    </Tab.Navigator>
  )
}
