// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
// import SuccessScreen from '../screens/SuccessScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingData';
import Login from '../screens/LoginScreen';
import Signup from '../screens/CreateAccountScreen';
import OptVerification from '../screens/OtpVerificationScreen';
import NewPassword from '../screens/NewPassword';
import ResetPassword from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/FirmAccordion';
import NotificationScreen from '../screens/NotificationScreen';
import AddNewFirmScreen from '../screens/AddNewFirmScreen';
import FirmAddedScreen from '../screens/FirmAddedScreen';
import SetUpClientScreen from '../screens/SetUpClientScreen';
import AddClientScreen from '../screens/AddClientScreen';
import ClientListScreen from '../screens/ClientListScreen';
import ClientDetailsScreen from '../screens/ClientDetailsScreen';
import ClientFabricDetailsScreen from '../screens/ClientFabricDetailsScreen';
import OrderProductSelectionScreen from '../screens/OrderProductSelectionScreen';
import ProductDetailCard from '../screens/ProductDetailCard';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import PaymentScreen from '../screens/PaymentScreen';
import InventoryEmptyScreen from '../screens/Inventory/InventoryEmptyScreen';
import UploadCSV from '../screens/Inventory/UploadCSV';
import AddItemsToInventory from '../screens/Inventory/AddItemsToInventory';
import CompleteUpload from '../screens/Inventory/CompleteUpload';
import UploadProgressModal from '../screens/Inventory/UploadPregressModal';
import InventoryMappingScreen from '../screens/Inventory/InventoryMappingScreen';
import ProductListScreen from '../screens/Inventory/ProductList';
import ProductDetailsInventoryScreen from '../screens/Inventory/ProductDetailsInventory';
import SaveChangesScreen from '../screens/Inventory/SaveChangesScreen';
import UpdateProductScreen from '../screens/Inventory/UpdateProduct';
import InsightsEmpty from '../screens/Insights/InsightsEmpty';

// Params for Home Stack
export type HomeStackParamList = {
  FirmAddedScreen: undefined;
  PaymentScreen: undefined;
  AddNewFirmScreen: undefined;
  Notification: undefined;
  ClientListScreen: undefined;
  SetUpClientScreen: undefined;
  ClientDetailsScreen: undefined;
  NewPassword: undefined;
  OrderProductSelectionScreen: undefined;
  OrderSummaryScreen: undefined;
  OptVerification: undefined;
  ResetPassword: undefined;
  ClientFabricDetailsScreen: undefined;
  AddClientScreen: undefined;
  Home: undefined; // No parameters expected
  Splash: undefined; // No parameters expected
  Onboarding: undefined; // No parameters expected
  Login: undefined; // No parameters expected
  ProductDetailCard: undefined;
  Signup: undefined; // No parameters expected
  SuccessScreen: undefined; // No parameters expected
  Details: {productId: string};
  InventoryEmptyScreen: undefined;
  AddItemsToInventory: undefined;
  UploadCSV: undefined;
  CompleteUpload: undefined;
  UploadProgressModal: undefined;
  InventoryMappingScreen: undefined;
  ProductListScreen: undefined;
  ProductDetailsInventoryScreen: undefined;
  SaveChangesScreen: undefined;
  UpdateProductScreen: undefined;
  InsightsEmpty: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  // const loading = useSelector((state: RootState) => state.auth.status);
  console.log(currentUser);

  // if (loading === 'loading') {
  //   return (
  //     <ActivityIndicator
  //       size="large"
  //       color="#0000ff"
  //       // eslint-disable-next-line react-native/no-inline-styles
  //       style={{flex: 1, justifyContent: 'center'}}
  //     />
  //   );
  // }

  return (
    // <HomeStack.Navigator initialRouteName={currentUser ? 'Home' : 'Login'}>
    <HomeStack.Navigator initialRouteName={'Splash'}>
      <HomeStack.Screen
        name="Splash"
        component={SplashScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="Signup"
        component={Signup}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="OptVerification"
        component={OptVerification}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="NewPassword"
        component={NewPassword}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="AddNewFirmScreen"
        component={AddNewFirmScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="FirmAddedScreen"
        component={FirmAddedScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="SetUpClientScreen"
        component={SetUpClientScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="AddClientScreen"
        component={AddClientScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ClientListScreen"
        component={ClientListScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ClientDetailsScreen"
        component={ClientDetailsScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ClientFabricDetailsScreen"
        component={ClientFabricDetailsScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="OrderProductSelectionScreen"
        component={OrderProductSelectionScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="ProductDetailCard"
        component={ProductDetailCard}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="OrderSummaryScreen"
        component={OrderSummaryScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryEmptyScreen"
        component={InventoryEmptyScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="AddItemsToInventory"
        component={AddItemsToInventory}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="UploadCSV"
        component={UploadCSV}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="CompleteUpload"
        component={CompleteUpload}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryMappingScreen"
        component={InventoryMappingScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="UploadProgressModal"
        component={UploadProgressModal}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProductListScreen"
        component={ProductListScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="ProductDetailsInventoryScreen"
        component={ProductDetailsInventoryScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="SaveChangesScreen"
        component={SaveChangesScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="UpdateProductScreen"
        component={UpdateProductScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InsightsEmpty"
        component={InsightsEmpty}
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
}

export default HomeStackNavigator;
