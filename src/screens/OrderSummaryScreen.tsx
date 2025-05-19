import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  // TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderSummaryScreen'
>;

const OrderSummaryScreen = ({navigation}: AddNewUserProps) => {
  const products = Array(7).fill({
    name: 'Product Name',
    category: 'Category',
    quantity: 'Quantity',
    price: 'Price',
  });

  return (
    <View className="flex-1 bg-[#F4D5B2] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        <View className="flex-1 items-end -ml-4">
          <Text className="text-sm text-black">Order Creation For</Text>
          <Text className="text-base font-bold text-black">
            Rameswaram Emporium
          </Text>
          <View className="w-full">
            <Text className="text-xs text-center text-black">
              Order Number : 023568458464
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-lg font-semibold text-center mb-2">
        Order Details
      </Text>

      {/* Table */}
      <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-2 flex-row justify-between">
        <Text className="text-white text-xs font-semibold w-[25%]">
          Product Name
        </Text>
        <Text className="text-white text-xs font-semibold w-[25%]">
          Category
        </Text>
        <Text className="text-white text-xs font-semibold w-[25%]">
          Quantity
        </Text>
        <Text className="text-white text-xs font-semibold w-[20%]">Price</Text>
      </View>

      <ScrollView className="bg-[#D1853A] rounded-b-lg px-3 py-2 max-h-[250px]">
        {products.map((item, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between mb-2">
            <Text className="text-xs w-[25%] text-white">{item.name}</Text>
            <Text className="text-xs w-[25%] text-white">{item.category}</Text>
            <Text className="text-xs w-[25%] text-white">{item.quantity}</Text>
            <View className="flex-row items-center w-[20%] justify-between ">
              <Text className="text-xs border border-white px-2 text-white">
                {item.price}
              </Text>
              <TouchableOpacity>
                <Icon name="trash-2" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity className="bg-[#FBDBB5] rounded-lg py-3 mt-2 items-center flex-row justify-center">
          <View className="border border-black rounded-lg ">
            <Icon name="plus" size={16} color="#000" />{' '}
          </View>
          <Text className="ml-2 text-sm font-medium">Add More Items</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Total Amount Section */}
      <View className="mt-12">
        <View className="flex-row items-center justify-between mt-6 border border-black rounded-lg overflow-hidden">
          <View className="bg-black px-4 py-4">
            <Text className="text-white font-semibold">Total Amount</Text>
          </View>
          <View className="px-4 py-3  flex-1">
            <Text className="text-left font-semibold text-base">
              ₹ 3,25,695
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-4 flex-row justify-between">
          <TouchableOpacity className="flex-1 border border-black py-3 rounded-xl items-center mr-2">
            <Text className="text-black font-medium">Payment Options</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-[#D1853A] py-3 rounded-xl items-center ml-2">
            <Text className="text-white font-medium">Update Order</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          className="bg-[#D1853A] py-3 rounded-xl items-center mt-4"
          onPress={() => navigation.navigate('PaymentScreen')}>
          <Text className="text-white font-semibold text-base">
            Confirm Order Placement
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderSummaryScreen;
