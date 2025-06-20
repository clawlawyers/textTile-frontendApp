/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import HomeStackNavigator from './src/stacks/Home';
import AddNewUserStackNavigator from './src/stacks/AddNewUser';
import OrderHistoryNavigator from './src/stacks/OrderHistory';
import AccountStackNavigator from './src/stacks/Account';
import YourClientsStackNavigator from './src/stacks/YourClients';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {RootState, store} from './src/redux/store';
import CustomTabBar from './src/components/CustomTabBar';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import {logout, retrieveAuth} from './src/redux/authSlice';
import {setActiveFirm} from './src/redux/commonSlice';
import TextileImageGenerator from './src/screens/TextileImageGenerator';
import GenerateImageScreen from './src/screens/GenerateImageScreen';
import EditImageScreen from './src/screens/EditImageScreen';
import PatternToGridScreen from './src/screens/PatternToGridScreen';
import ImagePaletteScreen from './src/screens/ImagePaletteScreen';
import GeneratedImageGrid from './src/screens/GeneratedImageGrid';
import GeneratedImageScreen from './src/screens/GeneratedImageScreen';
import PaletteGeneratedScreen from './src/screens/PaletteGeneratedScreen';
import EditPaletteScreen from './src/screens/EditPaletteScreen';
import WalletScreen from './src/screens/WalletScreen';
import MagicLoadingScreen from './src/screens/MagicLoadingScreen';
// import {store, RootState} from './redux/store';
// import LoginScreen from './screens/LoginScreen';
// import {retrieveAuth} from './redux/authSlice';
// import {ActivityIndicator} from 'react-native';
// import {fetchCartDetails} from './redux/cartSlice';
// import ShippingAddress from './screens/AddressScreen';

// ================== Type Definitions ==================

// Params for Root Tab Navigator
type RootTabParamList = {
  Home: undefined;
  AddNewUser: undefined;
  OrderHistory: undefined;
  Account: undefined;
};

// Create the bottom tab navigator
const Tab = createBottomTabNavigator<RootTabParamList>();

const AppInner: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.status);
  console.log(currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retrieveAuth());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      dispatch(setActiveFirm(currentUser.companies[0]));
    }
  }, [currentUser, dispatch]);

  // if (loading === 'loading') {
  //   console.log('loafing');
  //   return (
  //     <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
  //       <ActivityIndicator
  //         size="large"
  //         color="#DB9245"
  //         // eslint-disable-next-line react-native/no-inline-styles
  //         style={{flex: 1, justifyContent: 'center'}}
  //       />
  //     </View>
  //   );
  // }

  return (

    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        tabBar={props => <CustomTabBar {...props} />}
        initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeStackNavigator} />
        <Tab.Screen name="YourClients" component={YourClientsStackNavigator} />
        <Tab.Screen name="AddNewUser" component={AddNewUserStackNavigator} />
        <Tab.Screen name="OrderHistory" component={OrderHistoryNavigator} />
        <Tab.Screen name="Account" component={AccountStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer> 
  
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      {/* <FirmAccordion /> */}
      {/* <StatusBar backgroundColor="#FAD9B3" barStyle="light-content"  /> */}
      <AppInner />
      {/* <MagicLoadingScreen /> */}
    </Provider>
  );
};

export default App;
