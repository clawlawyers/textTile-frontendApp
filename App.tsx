/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import HomeStackNavigator from './src/stacks/Home';
import AddNewUserStackNavigator from './src/stacks/AddNewUser';
import OrderHistoryNavigator from './src/stacks/OrderHistory';
import AccountStackNavigator from './src/stacks/Account';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';

import CustomTabBar from './src/components/CustomTabBar';
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
  // const currentUser = useSelector((state: RootState) => state.auth.user);
  // const loading = useSelector((state: RootState) => state.auth.status);
  // console.log(currentUser);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(retrieveAuth());
  //   dispatch(fetchCartDetails());
  // }, [dispatch]);

  // if (loading === 'loading') {
  //   return (
  //     <ActivityIndicator
  //       size="large"
  //       color="#0000ff"
  //       style={{flex: 1, justifyContent: 'center'}}
  //     />
  //   );
  // }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        tabBar={props => <CustomTabBar {...props} />}
        initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeStackNavigator} />
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
      <AppInner />
    </Provider>
  );
};

export default App;
