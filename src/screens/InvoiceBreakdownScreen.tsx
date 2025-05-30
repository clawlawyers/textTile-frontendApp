import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {OrderHistoryParamList} from '../stacks/OrderHistory';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const paymentDetails = [
  {label: 'Total Amount', value: '₹ 63000'},
  {label: 'Advance Payment', value: '₹ 3000'},
  {label: 'Final Payment', value: '₹ 60000'},
  {label: 'Mode Of Payment', value: 'Cheque'},
  {label: 'Invoice Status', value: 'Paid'},
];

type InvoiceBreakdownScreenProps = NativeStackScreenProps<
  OrderHistoryParamList,
  'InvoiceBreakdownScreen'
>;

const InvoiceBreakdownScreen = ({
  navigation,
  route,
}: InvoiceBreakdownScreenProps) => {
  console.log(route.params.orderDetails);

  const [orderDetails, setOrderDetails] = React.useState(
    route.params.orderDetails,
  );

  // const commonSlice = useSelector((state: RootState) => state.common);

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

      {/* Invoice Date & Time */}
      <View className="flex-row justify-end mb-4">
        <View>
          <Text className="text-sm font-semibold text-black text-right">
            Invoice Date & Time
          </Text>
          <Text className="text-sm text-black text-right">
            {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Firm Details */}
      <View className="mb-4 ">
        <View className="flex flex-row gap-6">
          <Text className="text-sm text-black font-bold">Firm Name :</Text>
          <Text className="text-sm text-black mb-1">
            {orderDetails.client.firmName}
          </Text>
        </View>

        <View className="flex flex-row gap-12">
          <Text className="text-sm text-black font-bold">GST No :</Text>
          <Text className="text-sm text-black mb-1">012356985421525445</Text>
        </View>
        <View className="flex flex-row gap-11">
          <Text className="text-sm text-black font-bold">Address :</Text>
          <Text className="text-sm text-black mb-2">
            {orderDetails.client.address}
          </Text>
        </View>

        <View className="flex flex-row gap-5">
          <Text className="text-sm text-black font-bold">Client Name :</Text>
          <Text className="text-sm text-black mb-1">
            {orderDetails.client.name}
          </Text>
        </View>

        <View className="flex flex-row gap-7">
          <Text className="text-sm text-black font-bold">Contact No :</Text>
          <Text className="text-sm text-black mb-2">
            {orderDetails.client.phone}
          </Text>
        </View>
      </View>

      <View className="rounded-xl overflow-hidden mb-6">
        <View className="flex-row mb-1">
          {/* Label (left side) */}
          <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
            <Text className="text-white font-semibold text-sm">
              Total Amount
            </Text>
          </View>
          {/* Value (right side) */}
          <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
            <Text className="text-black font-semibold text-sm text-right">
              {orderDetails.totalAmount}
            </Text>
          </View>
        </View>
        {orderDetails.payments.map((item, index) => (
          <View key={index} className="flex-row mb-1">
            {/* Label (left side) */}
            <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
              <Text className="text-white font-semibold text-sm">
                {item.paymentMethod}
              </Text>
            </View>
            {/* Value (right side) */}
            <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
              <Text className="text-black font-semibold text-sm text-right">
                {item.amount}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-[#D6872A] py-3 rounded-xl"
        onPress={() => navigation.goBack()}>
        <Text className="text-center text-white font-semibold text-base">
          View Invoice Items
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity className="flex-1 py-3 rounded-xl border border-black mr-2">
          <Text className="text-center text-black font-semibold ">
            <Icon name="share-2" size={20} color="#292C33" />
            {'   '} Share
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

export default InvoiceBreakdownScreen;
