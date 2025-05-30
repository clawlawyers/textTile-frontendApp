// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import AddNewUserScreen from '../screens/AddNewUserScreen';
import UserPermissionScreen from '../screens/UserPermissionScreen';
import AddNewUserAdded from '../screens/NewUserAddedScreen';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
// import Cart from '../screens/CartScreen';
// import Checkout from '../screens/CheckoutScreen';
// import PaymentMethods from '../screens/PaymentMethodsScreen';
// import ShippingAddress from '../screens/AddressScreen';
// import SuccessScreen from '../screens/SuccessScreen';

// Define the type for an Address object based on your schema
export type Address = {
  name: string;
  phone: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  landmark?: string; // Optional field
  type: 'HOME' | 'WORK'; // Type of the address
  isDefault: boolean; // Whether the address is the default one
};

export type Card = {
  _id: string;
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  type: 'mastercard' | 'visa';
  isDefault: boolean;
};

// Params for Home Stack
export type AddNewUserStackParamList = {
  AddNewUser: undefined;
  UserPermissions: {salesmanId: string};
  AddNewUserAdded: undefined;
};

const BagStack = createNativeStackNavigator<AddNewUserStackParamList>();

function AddNewUserStackNavigator() {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  if (currentUser?.type !== 'manager') {
    return (
      <View>
        <Text>You are not authorized to view this screen</Text>
      </View>
    );
  }

  return (
    <BagStack.Navigator>
      <BagStack.Screen
        name="AddNewUser"
        component={AddNewUserScreen}
        options={{headerShown: false}}
      />
      <BagStack.Screen
        name="UserPermissions"
        component={UserPermissionScreen}
        options={{headerShown: false}}
      />
      <BagStack.Screen
        name="AddNewUserAdded"
        component={AddNewUserAdded}
        options={{headerShown: false}}
      />
    </BagStack.Navigator>
  );
}

export default AddNewUserStackNavigator;
