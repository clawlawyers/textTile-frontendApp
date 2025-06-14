/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';

type InvoiceUpdatedProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoiceUpdated'
>;

const InvoiceUpdated = ({ navigation, route }: InvoiceUpdatedProps) => {
  return (
    <SafeAreaView className="flex-1 bg-[#FBDBB5]">
      <View className="flex-1 px-5 pt-6 relative">
        {/* Top Header Icons */}
        <View className="flex-row justify-between items-center px-4 mt-6">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GenerateInvoiceScreen', {
                invoiceStatus: 'new',
                orderId: undefined,
                testOrderId: undefined,
                invoiceNumber: undefined,
                billingDetails: {},
                paymentDetails: { totalAmount: '0', dueAmount: '0', payments: [] },
                paymentHistory: [],
                cartProducts: [],
                discountValue: '0',
                discountMode: 'percent',
                gstValue: '0',
              })
            }
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center"
          >
            <Icon1 name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center pb-12">
          {/* Logo with Shadow */}
          <View>
            <Image
              source={require('../assets/logo.png')}
              style={{
                width: scale(150),
                height: verticalScale(140),
              }}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Subtext */}
          <Text className="text-3xl font-bold text-black text-center mt-6">
            Invoice Updated
          </Text>
          <Text className="text-center mt-2 text-black text-base">
            Your Invoice is Updated{'\n'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InvoiceUpdated;