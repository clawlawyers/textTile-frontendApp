import React from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryProductDetails'
>;

const InventoryProductDetails = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View>
          <Text className="text-xs text-[#292C33] text-right">
            Inventory For
          </Text>
          <Text className="text-sm font-semibold text-black text-right">
            CLAW Textile Manufacturing
          </Text>
        </View>
      </View>

      {/* Product Image */}
      <View className="items-center mb-4">
        <Image
          source={require('../assets/Sari.png')}
          className="w-full h-52 rounded-xl"
          resizeMode="cover"
        />
      </View>

      {/* Action Icons */}
      <View className="flex-row justify-end gap-4 mb-4">
        <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="alert-triangle" size={20} color="#292C33" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="trash-2" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <Text className="text-base font-bold mb-2 text-black">
        Product Name Line Goes Here ...
      </Text>

      <View className="space-y-1 mb-6">
        <Text className="text-sm text-black">
          <Text className="font-medium">Category Name : </Text>
          {'  '}
          <Text className="font-bold">Saffron Mixed Rayon</Text>
        </Text>
        <Text className="text-sm text-black">
          <Text className="font-medium">Design Number : </Text>
          {'  '}
          <Text className="font-bold">SFFRN–RAY–22GH</Text>
        </Text>
        <Text className="text-sm text-black">
          <Text className="font-medium">Textile Type : </Text>
          {'        '}
          <Text className="font-bold"> Cotton Blend</Text>
        </Text>
      </View>

      {/* Download and Stock Section */}
      <View className="flex-row items-center justify-end mb-2  mt-12">
        <View className="flex-row items-center gap-2">
          <Icon name="download" size={14} color="#292C33" />
          <Text className="text-xs text-[#292C33]">
            Download Product Details
          </Text>
        </View>
      </View>

      <View className="mb-3 flex border flex-row justify-center rounded-md py-2">
        <Text className="text-base text-black mb-1">
          Available Stock ( Bail Quantity ) :
        </Text>
        <Text className="text-sm text-black">375.26</Text>
      </View>

      {/* Footer Buttons */}
      <View className="flex-row justify-between gap-4">
        <TouchableOpacity
          className="flex-1 border border-[#292C33] py-3 rounded-lg items-center"
          onPress={() => navigation.navigate('EditInventoryProduct')}>
          <Text className="text-black font-semibold">Add Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-[#DB9245] py-3 rounded-lg items-center">
          <Text className="text-white font-semibold">Edit Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InventoryProductDetails;
