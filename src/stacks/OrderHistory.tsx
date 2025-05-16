// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import CompletedOrdersScreen from '../screens/CompletedOrdersScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import InvoiceBreakdownScreen from '../screens/InvoiceBreakdownScreen';
// import Favorites from '../screens/Favorites';

// Params for Home Stack
export type OrderHistoryParamList = {
  CompletedOrder: undefined; // No parameters expected
  InvoiceDetailScreen: undefined; // Example of a screen with parameters
  InvoiceBreakdownScreen: undefined;
};

const OrderHistory = createNativeStackNavigator<OrderHistoryParamList>();

function OrderHistoryStackNavigator() {
  return (
    <OrderHistory.Navigator initialRouteName="InvoiceDetailScreen">
      <OrderHistory.Screen
        name="CompletedOrder"
        component={CompletedOrdersScreen}
        options={{headerShown: false}}
      />
      <OrderHistory.Screen
        name="InvoiceDetailScreen"
        component={InvoiceDetailScreen}
        options={{headerShown: false}}
      />
      <OrderHistory.Screen
        name="InvoiceBreakdownScreen"
        component={InvoiceBreakdownScreen}
        options={{headerShown: false}}
      />
    </OrderHistory.Navigator>
  );
}

export default OrderHistoryStackNavigator;
