// src/components/CustomTabBar.tsx

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useNavigationState} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const iconsMap: Record<string, {icon: string; label: string}> = {
  Home: {icon: 'home', label: 'Home'},
  AddNewUser: {icon: 'user-plus', label: 'Add User'},
  OrderHistory: {icon: 'list-alt', label: 'Order History'},
  Account: {icon: 'user-cog', label: 'Account'},
};

const HIDDEN_ROUTES = [
  'NewPassword',
  'OptVerification',
  'ResetPassword',
  'Onboarding',
  'Splash',
  'Login',
  'Signup',
  'OtpVerificationScreen',
  'SuccessScreen',
  'Details',
  'StockManagement',
  'EditInventoryProduct',
];

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const CostomeState = useNavigationState(state => state);
  console.log(CostomeState);

  const currentTabIndex = CostomeState?.index;
  const currentRoute = CostomeState?.routes[currentTabIndex];

  const nestedState = currentRoute?.state as any;
  const nestedRouteName =
    nestedState?.routes?.[nestedState.index]?.name ?? currentRoute?.name;

  console.log('Nested Route Name:', nestedRouteName);
  const shouldHide1 = HIDDEN_ROUTES.includes(nestedRouteName);

  if (shouldHide1 || nestedRouteName === undefined) {
    return null; // Don't render tab bar
  }

  return (
    <View className="flex-row justify-around bg-[#26272c] py-3 ">
      {CostomeState?.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const {icon, label} = iconsMap[route.name] || {
          icon: 'circle',
          label: route.name,
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            onPress={onPress}
            className="items-center flex-1">
            <View
              className={`items-center  justify-center ${
                isFocused
                  ? 'bg-[#e49a4c] p-4 rounded-full -mt-8 border-[6px] border-[#FAD9B3] '
                  : ''
              }`}>
              <FontAwesome
                name={icon}
                size={20}
                color={isFocused ? 'white' : 'white'}
              />
            </View>
            <Text
              className={`text-xs mt-1 ${
                isFocused ? 'text-white font-semibold' : 'text-white/70'
              }`}>
              {isFocused ? '' : label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;
