/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ToastAndroid,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setActiveFirm} from '../redux/commonSlice';
import {company, updateCompanies} from '../redux/authSlice';
import {AccountStackParamList} from '../stacks/Account'
import { verticalScale } from '../utils/scaling';

type AddNewUserProps = NativeStackScreenProps<
 AccountStackParamList,
  'InvoicesScreen'
>;

const InvoiceScreen = ({navigation}: AddNewUserProps) => {

  return (
    <View className="flex-1 bg-[#fdd8ac] px-6 pt-12 relative">
      {/* Top Header Icons */}
      <View className="flex-row justify-between items-center mb-14">
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
      <View className="items-start mt-4">
        <Image
          source={require('../assets/logo.png')} // Replace with your icon
          style={{width: 90, height: 90, resizeMode: 'contain'}}
        />
      </View>

      {/* Heading */}
      <Text className="text-3xl font-bold text-black text-start mt-8">
      Generate New Invoice
      </Text>
      <Text className="text-start mt-2 text-black">
       Please select a Option To Proceed Further {'\n'}
      </Text>
      {/* Button */}
      <View className="mt-6 mb-20">
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4"
              onPress={() =>
                navigation.navigate('GenerateInvoiceScreen', {
                  invoiceStatus: 'new',
                  orderId: '60d5ec49f8c7b00015e4a1b1', // You may want to provide a valid orderId here
                })
              }
            >
              <Text
                className="text-center text-white font-semibold text-lg justify-center align-center"
                style={{ height: verticalScale(25) }}
              >
                Create New Invoice
              </Text>
            </Pressable>
            <Pressable
              className="bg-[#DB9245] rounded-md py-3 mb-4 "
              onPress={() => navigation.navigate('PreviousInvoiceScreen')}>
              <Text className="text-center text-white font-semibold text-lg justify-center align-center"
               style={{height:verticalScale(25)}}>
                Previous Invoices
              </Text>
            </Pressable>
      </View>
    </View>
  );
};

export default InvoiceScreen;
