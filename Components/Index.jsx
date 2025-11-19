import { Settings, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons';
import Home from './Main/Home'
import Supplier from './Main/Supplier'
import Consumer from './Main/Consumer'
import SettingsMain from './Main/SettingsMain'


const Tab=createBottomTabNavigator();

const Index = () => {
  return (
        <Tab.Navigator
           screenOptions={({route})=>({
            headerShown:false,
            tabBarIcon:({focused,size,color})=>{
                let iconName;

                switch (route.name){
                    case 'Home':
                      iconName = focused ? 'home' : 'home-outline';
                      break;
                    case 'Supplier':
                      iconName = focused ? 'storefront' : 'storefront-outline';
                      break;
                    case 'Consumer':
                      iconName = focused ? 'business' : 'business-outline';
                      break;
                    case 'Settings':
                      iconName = focused ? 'settings' : 'settings-outline';
                      break;
                    default:
                      iconName = 'ellipse-outline';  
                }

                return <Ionicons name={iconName} size={focused?30:24} color={color}/>
            },
            tabBarActiveTintColor:'#0a84ff',
            tabBarInactiveTintColor:'#8e8e93',
           })}
           >
              <Tab.Screen name='Home' component={Home}/>
              <Tab.Screen name='Supplier' component={Supplier} options={{ tabBarStyle:{ display:'none' }}}/>
              <Tab.Screen name='Consumer' component={Consumer}/>
              <Tab.Screen name='Settings' component={SettingsMain}/>
           </Tab.Navigator>
  )
}

export default Index

const styles = StyleSheet.create({})