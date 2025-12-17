import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CMain from './CMain';
import ConsumerDetails from './ConsumerDetails';
import AddSale from './AddSale';
import CPayment from './CPayment';

const Stack = createStackNavigator();

const ConsumerList = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='ConsumerMain' component={CMain} />
      <Stack.Screen name='ConsumerDetails' component={ConsumerDetails} />
      <Stack.Screen name='ConsumerOrder' component={AddSale} />
      <Stack.Screen name='ConsumerPayment' component={CPayment} />
    </Stack.Navigator>
  );
};

export default ConsumerList;
