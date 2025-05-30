/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';

const orderData = new Array(5).fill({
  bailNo: 'TX-BL-001',
  designNo: 'DS24COT101',
  lotNo: '24-500',
  category: 'Cotton Shirting',
  quantity: '5,000',
});

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InvoiceScreen'
>;

const InvoiceScreen = ({navigation, route}: AddNewUserProps) => {
  const {width, height} = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const fontSize = isSmallDevice ? 10 : 12;
  const listMaxHeight = height * 0.35; // 35% of screen height
  const [cartProducts, setCartProducts] = useState(
    route.params.orderDetails.products,
  );

  console.log(route.params.orderDetails);

  return (
    <SafeAreaView className="flex-1 bg-[#FBD7A2] pt-14 px-4 pb-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        {/*
        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Client Info */}
      <View className="bg-[#DB9245] rounded-lg mt-8 mb-5 p-4">
        <Text className="text-sm text-white">Rameswarm Das</Text>
        <Text className="text-xl font-bold text-white mt-1">
          Ram Enterprise
        </Text>
      </View>

      {/* Table Header */}
      <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between">
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold">
          Bail No
        </Text>
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold">
          Design
        </Text>
        <Text
          style={{fontSize, width: '15%'}}
          className="text-white font-semibold text-center">
          Lot No
        </Text>
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold text-center">
          Category
        </Text>
        <Text
          style={{fontSize, width: '25%'}}
          className="text-white font-semibold text-center">
          Quantity
        </Text>
      </View>

      {/* Cart Items Container */}
      <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mb-4">
        {/* Scrollable Items List */}
        <ScrollView
          style={{maxHeight: listMaxHeight}}
          showsVerticalScrollIndicator={false}
          className="mb-2">
          {cartProducts?.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between mb-3 py-1 ">
              <Text style={{fontSize, width: '20%'}} className="text-white">
                {item?.inventoryProduct?.bail_number}
              </Text>
              <Text style={{fontSize, width: '20%'}} className="text-white">
                {item?.inventoryProduct?.design_code}
              </Text>
              <Text
                style={{fontSize, width: '20%'}}
                className="text-white text-center">
                {item?.inventoryProduct?.lot_number}
              </Text>
              <Text style={{fontSize, width: '25%'}} className="text-white">
                {item?.inventoryProduct?.category_code}
              </Text>
              <Text style={{fontSize, width: '15%'}} className="text-white">
                {item?.quantity}
              </Text>
              {/* <View style={{width: '25%'}} className="px-1">
                <TextInput
                  style={{fontSize}}
                  className="border border-white rounded-md px-2 py-1 text-white text-center"
                  value={item.unitPrice.toString()}
                  editable={false}
                />
              </View> */}
              {/* <TouchableOpacity
                  style={{width: '15%'}}
                  className="items-center"
                  onPress={() => handleRemoveItem(item.inventoryProduct._id)}>
                  <Icon name="trash-2" size={16} color="#fff" />
                </TouchableOpacity> */}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Download Button */}
      <TouchableOpacity className="bg-[#DB9245] mx-6 mb-6 py-3 rounded-lg items-center justify-center mt-auto">
        <Text className="text-white font-semibold text-base">
          Download Invoice
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default InvoiceScreen;
