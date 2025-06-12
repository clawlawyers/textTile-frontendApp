/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Animated,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';
import {CommonActions, useFocusEffect} from '@react-navigation/native';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {logout} from '../redux/authSlice';
import {useNavigation} from '@react-navigation/native';

type AddNewUserProps = NativeStackScreenProps<AccountStackParamList, 'Account'>;

export type adminInfo = {
  name: string;
  organisationName: string;
  phoneNumber: string;
  email: string;
  GSTNumber: string;
  phone: string;
};

const AdminDetailsScreen = ({navigation}: AddNewUserProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const rootNavigation = useNavigation();

  const [adminDetails, setAdminDetails] = React.useState<adminInfo>();
  const [loading, setLoading] = React.useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const dispatch = useDispatch();
  console.log(adminDetails);

  useFocusEffect(
    useCallback(() => {
      const getUserDetails = async () => {
        setLoading(true);
        // Use different endpoint based on login type
        const endpoint =
          currentUser?.type === 'manager'
            ? `${NODE_API_ENDPOINT}/managers/${currentUser?.userId}`
            : `${NODE_API_ENDPOINT}/salesmen/${currentUser?.userId}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
        });
        if (!response.ok) {
          setLoading(false);
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch admin details: ${response.status} ${errorText}`,
          );
        }

        setLoading(false);
        const data = await response.json();
        console.log(data);
        setAdminDetails(data);
        console.log(data);
      };
      if (currentUser) {
        getUserDetails();
      }
    }, [currentUser]),
  );

  const userDetailsArray =
    currentUser?.type === 'manager'
      ? [
          {label: 'Name', value: adminDetails?.name},
          {label: 'Oranization Name', value: adminDetails?.organisationName},
          {label: 'Contact', value: adminDetails?.phoneNumber},
          {label: 'Email ID', value: adminDetails?.email},
          {label: 'GST No', value: adminDetails?.GSTNumber},
        ]
      : [
          {label: 'Name', value: adminDetails?.name},
          // {label: 'Oranization Name', value: adminDetails?.organisationName},
          {label: 'Contact', value: adminDetails?.phone},
          {label: 'Email ID', value: adminDetails?.email},
        ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">
          Loading {currentUser?.type === 'manager' ? 'Admin' : 'User'}{' '}
          Details...
        </Text>
      </View>
    );
  }

  const handleLogout = () => {
    // Show toast first
    ToastAndroid.show('Logout Successful', ToastAndroid.SHORT);

    dispatch(logout());

    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            state: {
              routes: [{name: 'Login'}],
            },
          },
        ],
      }),
    );

    // // Start fade out animation
    // Animated.timing(fadeAnim, {
    //   toValue: 0,
    //   duration: 300,
    //   useNativeDriver: true,
    // }).start(() => {
    //   // Dispatch logout action after animation starts

    // });
  };

  return (
    <Animated.View
      style={{flex: 1, opacity: fadeAnim}}
      className="bg-[#FAD9B3] px-4 pt-10">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Admin Card */}
      <View className="bg-[#DB9245] rounded-xl p-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-white">
            {currentUser?.type === 'manager' ? 'Admin' : 'User'} Details
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditAccountDetails', {
                userDetails: adminDetails,
              })
            }>
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>
        {userDetailsArray.map((item, idx) => (
          <View
            key={idx}
            style={{backgroundColor: '#FBDBB5'}}
            className=" rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
            <Text className="text-xs font-medium text-black">
              {item.label} :
            </Text>
            <Text className="text-sm  text-black">{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="mt-6 mb-20">
        {currentUser?.type === 'manager' && (
          <>
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4"
              onPress={() => navigation.navigate('FirmScreens')}>
              <Text className="text-center text-white font-semibold">
                View All Firms
              </Text>
            </Pressable>
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4"
              onPress={() => navigation.navigate('UsersScreen')}>
              <Text className="text-center text-white font-semibold">
                View All Users
              </Text>
            </Pressable>
            <View className='flex-row justify-around gap-4'>
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4 flex-1"
              onPress={() => {
                ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
                // navigation.navigate('InsightsEmpty');
              }}>
              <Text className="text-center text-white font-semibold">
                Generate Insights{' '}
              </Text>
            </Pressable>
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4 flex-1"
              onPress={() => navigation.navigate('InvoicesScreen')}>
              <Text className="text-center text-white font-semibold">
                Generate Invoice
              </Text>
            </Pressable>
            </View>
          </>
        )}
        <Pressable
          className="bg-[#DB9245] rounded-md py-3"
          onPress={handleLogout}>
          <Text className="text-center text-white font-semibold">Logout</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className=" items-center mt-auto mb-8">
        <View className="w-full h-px bg-black mb-1" />
        <View className="flex flex-row justify-between items-center w-[90%]">
          <Text className="text-xs text-gray-500">
            Version <Text className="font-bold">1.0.1</Text>
          </Text>
          <Text className="text-xs text-gray-500">
            Powered By{' '}
            <Text className="font-bold text-black">Claw Legal Tech</Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default AdminDetailsScreen;
