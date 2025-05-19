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
import HomeScreen from '../screens/HomeScreen';
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
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderUpdateConfirmationScreen from '../screens/OrderUpdateConfirmation';
import SetUpInventoryScreen from '../screens/SetUpInventoryScreen';
import InventoryEmptyScreen from '../screens/InventoryEmptyScreen';
import landingScreen from '../screens/LandingScreen';
import {ActivityIndicator} from 'react-native';
import AddInventoryScreen from '../screens/AddInventoryScreen';
import UploadCSVScreen from '../screens/UploadCSVScreen';
import InventoryUpdatingScreen from '../screens/InventoryUpdatingScreen';
import InventoryMappingScreen from '../screens/InventoryMappingScreen';
import InventoryProductList from '../screens/InventoryProductList';
import InventoryProductDetails from '../screens/InventoryProductDetails';
import StockManagement from '../screens/StockManagement';
// import EditInventoryProduct from '../screens/EditInventoryProduct';

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
  OrderConfirmationScreen: undefined;
  OrderUpdateConfirmationScreen: undefined;
  SetUpInventoryScreen: undefined;
  OrderProductSelectionScreen: undefined;
  OrderSummaryScreen: undefined;
  OptVerification: undefined;
  ResetPassword: undefined;
  ClientFabricDetailsScreen: undefined;
  AddClientScreen: undefined;
  Home: undefined; // No parameters expected
  Splash: undefined; // No parameters expected
  LandingScreen: undefined; // No parameters expected
  Onboarding: undefined; // No parameters expected
  Login: undefined; // No parameters expected
  ProductDetailCard: undefined;
  Signup: undefined; // No parameters expected
  SuccessScreen: undefined; // No parameters expected
  Details: {productId: string};
  InventoryEmptyScreen: undefined;
  AddInventoryScreen: undefined;
  UploadCSVScreen: undefined;
  InventoryUpdatingScreen: undefined;
  InventoryMappingScreen: undefined;
  InventoryProductList: undefined;
  InventoryProductDetails: undefined;
  StockManagement: undefined;
  EditInventoryProduct: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.status);
  console.log(currentUser);

  if (loading === 'loading') {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{flex: 1, justifyContent: 'center'}}
      />
    );
  }

  return (
    // <HomeStack.Navigator initialRouteName={currentUser ? 'Home' : 'Login'}>
    <HomeStack.Navigator
      initialRouteName={currentUser ? 'LandingScreen' : 'Splash'}>
      <HomeStack.Screen
        name="Splash"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="LandingScreen"
        component={landingScreen}
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
        name="PaymentScreen"
        component={PaymentScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="OrderConfirmationScreen"
        component={OrderConfirmationScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="OrderUpdateConfirmationScreen"
        component={OrderUpdateConfirmationScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="SetUpInventoryScreen"
        component={SetUpInventoryScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="InventoryEmptyScreen"
        component={InventoryEmptyScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="AddInventoryScreen"
        component={AddInventoryScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="UploadCSVScreen"
        component={UploadCSVScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryUpdatingScreen"
        component={InventoryUpdatingScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryMappingScreen"
        component={InventoryMappingScreen}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryProductList"
        component={InventoryProductList}
        options={{headerShown: false}}
      />

      <HomeStack.Screen
        name="InventoryProductDetails"
        component={InventoryProductDetails}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="StockManagement"
        component={StockManagement}
        options={{headerShown: false}}
      />
      {/* <HomeStack.Screen
        name="EditInventoryProduct"
        component={EditInventoryProduct}
        options={{headerShown: false}}
      /> */}
    </HomeStack.Navigator>
  );
}

export default HomeStackNavigator;
