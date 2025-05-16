import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {OrderHistoryParamList} from '../stacks/OrderHistory';

const invoiceItems = Array(7).fill({
  bailNo: 'TX-BL-001',
  designNo: 'DS24COT101',
  lotNo: '24-500',
  category: 'Cotton Shirting',
  quantity: '5,000',
});

type InvoiceDetailScreenProps = NativeStackScreenProps<
  OrderHistoryParamList,
  'InvoiceDetailScreen'
>;

const InvoiceDetailScreen = ({navigation}: InvoiceDetailScreenProps) => {
  return (
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        {/* <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity> */}
      </View>

      {/* Date & Time */}
      <View className="flex-row justify-end mb-4">
        <View>
          <Text className="text-sm font-semibold text-black text-right">
            Invoice Date & Time
          </Text>
          <Text className="text-sm text-black text-right">
            01/05/2025 &nbsp; 14:32
          </Text>
        </View>
      </View>

      {/* Firm Details */}
      <View className="mb-4 ">
        <View className="flex flex-row gap-6">
          <Text className="text-sm text-black font-bold">Firm Name :</Text>
          <Text className="text-sm text-black mb-1">RR Enterprise</Text>
        </View>

        <View className="flex flex-row gap-12">
          <Text className="text-sm text-black font-bold">GST No :</Text>
          <Text className="text-sm text-black mb-1">012356985421525445</Text>
        </View>
        <View className="flex flex-row gap-11">
          <Text className="text-sm text-black font-bold">Address :</Text>
          <Text className="text-sm text-black mb-2">
            AF–56, Prasanta Apartment,{'\n'}
            Kestopur, Kolkata– 700101 , India
          </Text>
        </View>

        <View className="flex flex-row gap-5">
          <Text className="text-sm text-black font-bold">Client Name :</Text>
          <Text className="text-sm text-black mb-1">Soumya Snigdha Banik</Text>
        </View>

        <View className="flex flex-row gap-7">
          <Text className="text-sm text-black font-bold">Contact No :</Text>
          <Text className="text-sm text-black mb-2">+917384242486</Text>
        </View>
      </View>

      {/* Table Header */}
      <View className="bg-[#1F1F1F] px-3 py-2 rounded-t-xl flex-row justify-between">
        <Text className="text-white text-xs w-[20%]">Bail No</Text>
        <Text className="text-white text-xs w-[25%]">Design No</Text>
        <Text className="text-white text-xs w-[15%]">Lot No</Text>
        <Text className="text-white text-xs w-[25%]">Category</Text>
        <Text className="text-white text-xs w-[15%]">Quantity</Text>
      </View>

      {/* Table Rows */}
      <View className="bg-[#DA8B2C] px-3 py-2 rounded-b-xl">
        {invoiceItems.map((item, index) => (
          <View key={index} className="flex-row justify-between py-1">
            <Text className="text-xs text-[#292C33] w-[20%]">
              {item.bailNo}
            </Text>
            <Text className="text-xs text-[#292C33] w-[25%]">
              {item.designNo}
            </Text>
            <Text className="text-xs text-[#292C33] w-[15%]">{item.lotNo}</Text>
            <Text className="text-xs text-[#292C33] w-[25%]">
              {item.category}
            </Text>
            <Text className="text-xs text-[#292C33] w-[15%] text-right">
              {item.quantity}
            </Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-[#D6872A] py-3 rounded-xl mt-6"
        onPress={() => navigation.navigate('InvoiceBreakdownScreen')}>
        <Text className="text-center text-white font-semibold text-base py-1">
          View Invoice Price Breakup
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity className="flex-1 py-3 rounded-xl border border-black mr-2">
          <Text className="text-center text-black font-semibold">
            {' '}
            <Icon name="share-2" size={20} color="#292C33" /> {'   '} Share
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-3 rounded-xl bg-[#D6872A] ml-2">
          <Text className="text-center text-white font-semibold">
            Download Invoice
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default InvoiceDetailScreen;
