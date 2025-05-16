// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import HomeScreen from '../screens/Home';
// import ShowProduct from '../screens/ShowProduct';
// import LoginScreen from '../screens/LoginScreen';
// import SignUpScreen from '../screens/SignUpScreen';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
// import SuccessScreen from '../screens/SuccessScreen';
import {ActivityIndicator, Text, View} from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingData';
import FirmAccordion from '../screens/FirmAccordion';
import Login from '../screens/LoginScreen';
import Signup from '../screens/CreateAccountScreen';
import OptVerification from '../screens/OtpVerificationScreen';
import NewPassword from '../screens/NewPassword';
import ResetPassword from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/FirmAccordion';
import NotificationScreen from '../screens/NotificationScreen';
import AddNewFirmScreen from '../screens/AddNewFirmScreen';
import FirmAddedScreen from '../screens/FirmAddedScreen';

// Params for Home Stack
export type HomeStackParamList = {
  FirmAddedScreen: undefined;
  AddNewFirmScreen: undefined;
  Notification: undefined;
  Test: undefined;
  NewPassword: undefined;
  OptVerification: undefined;
  ResetPassword: undefined;
  Home: undefined; // No parameters expected
  Splash: undefined; // No parameters expected
  Onboarding: undefined; // No parameters expected
  Login: undefined; // No parameters expected
  Signup: undefined; // No parameters expected
  SuccessScreen: undefined; // No parameters expected
  Details: {productId: string};
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
    </HomeStack.Navigator>
  );
}

export default HomeStackNavigator;
