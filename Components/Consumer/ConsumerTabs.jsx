import {useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import ConsumerList from './ConsumerList';
import AddConsumer from './AddConsumer';


const Tab = createBottomTabNavigator();

function BackToScreen({navigation}){
  const isFocused=useIsFocused();

  useEffect(() => {
    if(isFocused){
      navigation.navigate('Index')
    }
  }, [isFocused]);

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
          tabBarLabel:"Home",
          tabBarIcon:({color,size})=>(
            <Ionicons name='arrow-back-circle-outline' size={size} color={color}/>
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
          )
        }}
      />
      <Tab.Screen
        name='AddConsumer'
        component={AddConsumer}
        options={{
          tabBarLabel: 'Add Consumer',
          tabBarIcon: ({ color, size }) => (

            <Ionicons name='person-add-outline' size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}
