// ================== Type Definitions ==================
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AddNewFirmScreen from '../screens/AddNewFirmScreen';
import SetUpClientScreen from '../screens/SetUpClientScreen';
import ClientListScreen from '../screens/ClientListScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderProductDetailCard from '../screens/OrderProductDetailCard';
import OrderProductSelectionScreen from '../screens/OrderProductSelectionScreen';
import ClientFabricDetailsScreen from '../screens/ClientFabricDetailsScreen';
import ClientDetailsScreen from '../screens/ClientDetailsScreen';
import AddClientScreen from '../screens/AddClientScreen';
import EditClientScreen from '../screens/EditClientScreen';
import { CardStyleInterpolators } from '@react-navigation/stack';



// Stack parameter list
export type YourClientsStackParamList = {
    AddNewFirmScreen: undefined;
    SetUpClientScreen: undefined;
    AddClientScreen: undefined;
    ClientListScreen: undefined;
    ClientFabricDetailsScreen: undefined;
    ClientDetailsScreen: {clientId: string};
    OrderProductSelectionScreen: {clientName: string};
    OrderSummaryScreen: undefined;
    EditClientScreen: {clientDetails: {}};
    OrderProductDetailCard: {productDetails: {}};// assuming you pass client ID to detail screen
};

const ClientStack = createNativeStackNavigator<YourClientsStackParamList>();

function YourClientsStackNavigator() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  return (
    <ClientStack.Navigator
        initialRouteName="ClientListScreen"
        screenOptions={{
          animation: 'slide_from_right',
        }}>
        <ClientStack.Screen
        name="AddClientScreen"
        component={AddClientScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="ClientListScreen"
        component={ClientListScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="EditClientScreen"
        component={EditClientScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="ClientDetailsScreen"
        component={ClientDetailsScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="ClientFabricDetailsScreen"
        component={ClientFabricDetailsScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="OrderProductSelectionScreen"
        component={OrderProductSelectionScreen}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="OrderProductDetailCard"
        component={OrderProductDetailCard}
        options={{headerShown: false}}
      />
      <ClientStack.Screen
        name="OrderSummaryScreen"
        component={OrderSummaryScreen}
        options={{headerShown: false}}
      />
    </ClientStack.Navigator>
  );
}

export default YourClientsStackNavigator;
