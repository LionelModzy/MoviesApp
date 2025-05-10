import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import VideoScreen from './screens/VideoScreen';

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'THT Cartoon'}}/>
      <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ title: 'Watch Video' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
