/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {AccountStackParamList} from '../stacks/Account';
import {retrieveAuth} from '../redux/authSlice';

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'EditAccountDetails'
>;

const EditAccountDetails = ({navigation, route}: AddNewUserProps) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const [userDetails, setUserDetails] = useState({
    name: route.params.userDetails.name,
    phone:
      route.params.userDetails.phoneNumber || route.params.userDetails.phone,
    email: route.params.userDetails.email,
    organisationName: route.params.userDetails.organisationName,
    GSTNumber: route.params.userDetails.GSTNumber,
  });

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const updateAccountDetails = async () => {
    setLoading(true);
    try {
      const endPoint =
        currentUser?.type === 'manager'
          ? `${NODE_API_ENDPOINT}/managers/${currentUser?.userId}`
          : `${NODE_API_ENDPOINT}/salesmen/${currentUser?.userId}`;

      const response = await fetch(endPoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(userDetails),
      });

      if (!response.ok) {
        setLoading(false);
        const errorText = await response.text();
        throw new Error(
          `Failed to update account details: ${response.status} ${errorText}`,
        );
      }
      setLoading(false);

      dispatch(retrieveAuth());

      ToastAndroid.show('Account details updated', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] px-6 pt-14 pb-8">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Icon */}
      <View className="items-start">
        <Image
          source={require('../assets/logo.png')} // Replace with your icon
          style={{width: 80, height: 80, resizeMode: 'contain'}}
        />
      </View>

      {/* Title & Subtitle */}
      <View className="mt-4 mb-2">
        <Text className="text-black text-xl font-bold">
          Update Account Details
        </Text>
      </View>

      {/* Input Form */}
      <ScrollView
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}>
        {currentUser?.type === 'manager' ? (
          <>
            <View className="space-y-4 gap-1">
              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Name"
                placeholderTextColor="#6B6B6B"
                value={userDetails.name}
                onChangeText={text =>
                  setUserDetails({...userDetails, name: text})
                }
              />
              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Contact"
                placeholderTextColor="#6B6B6B"
                keyboardType="phone-pad"
                value={userDetails.phone}
                onChangeText={text =>
                  setUserDetails({...userDetails, phone: text})
                }
              />

              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Email"
                placeholderTextColor="#6B6B6B"
                value={userDetails.email}
                onChangeText={text =>
                  setUserDetails({...userDetails, email: text})
                }
              />
              {/* <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Firm Name"
                placeholderTextColor="#6B6B6B"
                value={userDetails.organisationName}
                onChangeText={text =>
                  setUserDetails({...userDetails, organisationName: text})
                }
              /> */}

              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Firm GST"
                placeholderTextColor="#6B6B6B"
                value={userDetails.GSTNumber}
                onChangeText={text =>
                  setUserDetails({...userDetails, GSTNumber: text})
                }
              />
            </View>
          </>
        ) : (
          <>
            <View className="space-y-4 gap-1">
              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Name"
                placeholderTextColor="#6B6B6B"
                value={userDetails.name}
                onChangeText={text =>
                  setUserDetails({...userDetails, name: text})
                }
              />
              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Contact"
                placeholderTextColor="#6B6B6B"
                keyboardType="phone-pad"
                value={userDetails.phone}
                onChangeText={text =>
                  setUserDetails({...userDetails, phone: text})
                }
              />

              <TextInput
                className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
                placeholder="Enter Client Email"
                placeholderTextColor="#6B6B6B"
                value={userDetails.email}
                onChangeText={text =>
                  setUserDetails({...userDetails, email: text})
                }
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#DB9245] py-4 rounded-xl items-center mt-2"
        onPress={updateAccountDetails}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Update Client
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default EditAccountDetails;
