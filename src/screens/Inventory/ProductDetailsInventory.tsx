/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeStackParamList} from '../../stacks/Home';

type ProductDetailsInventoryScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProductDetailsInventoryScreen'
>;

const ProductDetailsInventoryScreen = ({
  navigation,
}: ProductDetailsInventoryScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-between">
        {/* Header */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
              <Icon name="arrow-left" size={20} color="#292C33" />
            </TouchableOpacity>
            <View className="flex-1 items-end -ml-4">
              <Text className="text-sm text-black">Inventory For</Text>
              <Text className="text-base font-bold text-black">
                CLAW Textile Manufacturing
              </Text>
            </View>
          </View>

          {/* Image */}
          <Image
            source={require('../../assets/Sari.png')} // Replace with actual image
            resizeMode="cover"
            className="w-full h-56 rounded-lg mb-2 my-4"
          />

          {/* Warning + Trash Icons (Below Image) */}
          <View className="flex-row justify-end space-x-4 mb-4">
            <TouchableOpacity className="bg-[#F4D5B2] p-2 m-2 rounded-full border border-gray-800]">
              <Ionicons name="warning-outline" size={18} color="#292C33" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#F4D5B2] p-2 m-2 rounded-full border border-gray-800">
              <Ionicons name="trash-outline" size={18} color="#292C33" />
            </TouchableOpacity>
          </View>
          <View className="space-y-1 mt-2">
            <View className="flex-row">
              <Text className="text-black font-normal w-[130px]">
                Category Name :
              </Text>
              <Text className="text-black font-bold">Saffron Mixed Rayon</Text>
            </View>
            <View className="flex-row">
              <Text className="text-black font-normal w-[130px]">
                Design Number :
              </Text>
              <Text className="text-black font-bold">SFFRN–RAY–22GH</Text>
            </View>
            <View className="flex-row">
              <Text className="text-black font-normal w-[130px]">
                Textile Type :
              </Text>
              <Text className="text-black font-bold">Cotton Blend</Text>
            </View>
          </View>

          {/* Download Option */}
        </View>
        <TouchableOpacity className="flex-row items-center mt-28 justify-end mb-3">
          <Ionicons name="cloud-download-outline" size={14} color="black" />
          <Text className="ml-1 text-[12px] text-black font-medium">
            Download Product Details
          </Text>
        </TouchableOpacity>

        {/* Available Stock Info */}
        <View className="flex-row items-center justify-between bg-[#F4D5B2] px-3 py-2 rounded-md border border-[#000000] mb-6">
          <Text className="text-[12px] text-black">
            Available Stock ( Bail Quantity ) :
          </Text>
          <Text className="text-[14px] text-black font-bold">375.26</Text>
        </View>

        {/* Bottom Buttons */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity className="flex-1 bg-[#F4D5B2]  py-3 rounded-md border border-[#00000] mr-2">
            <Text className="text-black text-center font-semibold">
              Add Stock
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('SaveChangesScreen')}
            className="flex-1 bg-[#D6872A] py-3 rounded-md ml-2">
            <Text className="text-white text-center font-semibold">
              Edit Product
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailsInventoryScreen;
