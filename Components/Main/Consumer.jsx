import { StyleSheet, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator();

const Consumer = () => {
  return (
    <Stack.Navigator 
      screenOptions={{headerShown:false}}
    >
      <Stack.Screen name="ConsumerTabs">
        {props => {
          const ConsumerTabs = require('../Consumer/ConsumerTabs').default
          return <ConsumerTabs {...props} />
        }}
      </Stack.Screen>
      <Stack.Screen name="Index">
        {props => {
          const Index = require('../Index').default 
          return <Index {...props} />
        }}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

export default Consumer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});