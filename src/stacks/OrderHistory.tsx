// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import CompletedOrdersScreen from '../screens/CompletedOrdersScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import InvoiceBreakdownScreen from '../screens/InvoiceBreakdownScreen';
import ActiveOrdersScreen from '../screens/ActiveOrderScreen';
import { CardStyleInterpolators } from '@react-navigation/stack';
// import Favorites from '../screens/Favorites';

// Params for Home Stack
export type OrderHistoryParamList = {
  CompletedOrder: undefined; // No parameters expected
  ActiveOrdersScreen: undefined;
  InvoiceDetailScreen: {orderDetails: {}}; // Example of a screen with parameters
  InvoiceBreakdownScreen: {orderDetails: {}};
};

const OrderHistory = createNativeStackNavigator<OrderHistoryParamList>();

function OrderHistoryStackNavigator() {
  return (
    <OrderHistory.Navigator initialRouteName="CompletedOrder"
    screenOptions={{
      animation: 'slide_from_right',
    }}>
      <OrderHistory.Screen
        name="CompletedOrder"
        component={CompletedOrdersScreen}
        options={{headerShown: false}}
      />

      <OrderHistory.Screen
        name="ActiveOrdersScreen"
        component={ActiveOrdersScreen}
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
