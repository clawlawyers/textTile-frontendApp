// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import AdminDetailsScreen from '../screens/AdminDetailsScreen';
import FirmsScreen from '../screens/FirmsScreen';
import FirmDetailsScreen from '../screens/FirmDetailsScreen';
import UsersScreen from '../screens/UsersScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
// import AccountScreen from '../screens/AccountScreen';
// import OrderScreen from '../screens/OrdersScreen';
// import OrderDetailsScreen from '../screens/OrderDetailsScreen';
// import PaymentMethods from '../screens/PaymentMethodsScreen';
// import ShippingAddress from '../screens/AddressScreen';
// import HomeScreen from '../screens/Home';

// Params for Home Stack
export type AccountStackParamList = {
  Account: undefined; // No parameters expected
  FirmScreens: undefined; // No parameters expected
  FirmDetailsScreens: undefined;
  UserDetailsScreen: undefined;
  UsersScreen: undefined;
  MyOrder: undefined;
  OrderDetails: {orderId: string};
  ShippingAddress: undefined;
  PaymentMethod: undefined;
  MyReviews: undefined;
  Setting: undefined;
  Home: undefined;
};

const AccountStack = createNativeStackNavigator<AccountStackParamList>();

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator initialRouteName="Account">
      <AccountStack.Screen
        name="Account"
        component={AdminDetailsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="FirmScreens"
        component={FirmsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="FirmDetailsScreens"
        component={FirmDetailsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="UserDetailsScreen"
        component={UserDetailsScreen}
        options={{headerShown: false}}
      />
    </AccountStack.Navigator>
  );
}

export default AccountStackNavigator;
