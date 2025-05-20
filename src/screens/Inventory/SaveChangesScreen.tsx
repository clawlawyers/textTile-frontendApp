/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {HomeStackParamList} from '../../stacks/Home';

type SaveChangesScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'SaveChangesScreen'
>;

const SaveChangesScreen = ({navigation}: SaveChangesScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-between">
        {/* Top Section */}
        <View>
          {/* Header */}
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
            source={require('../../assets/Sari.png')}
            resizeMode="cover"
            className="w-full h-56 rounded-lg mb-2 my-4"
          />

          {/* Icons Below Image */}
          <View className="flex-row justify-end space-x-4 mb-4">
            <TouchableOpacity className="bg-[#F4D5B2] p-2 m-2 rounded-full border border-gray-800">
              <Ionicons name="warning-outline" size={18} color="#292C33" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#F4D5B2] p-2 m-2 rounded-full border border-gray-800">
              <Ionicons name="trash-outline" size={18} color="#292C33" />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          <View className="space-y-1 mt-2 mb-6">
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
        </View>

        {/* Fixed Bottom Section */}
        <View className="bg-[#D29C63] p-4 rounded-lg space-y-2">
          <Text className="text-black text-[12px] font-bold">
            Stock to Add :
          </Text>
          <View className="bg-[#FBDBB5] rounded-md flex-row items-center px-3 py-1 my-2">
            <Text className="text-black font-semibold mr-4 width-'50%">
              Add Stock
            </Text>
            <View
              className="flex-row items-center bg-white border border-gray-300 rounded-md "
              style={{width: '75%'}}>
              <TextInput
                className="flex-1 text-black pl-5"
                keyboardType="numeric"
                defaultValue="100"
              />
              <Image
                source={require('../../assets/icons/add.png')}
                className="w-[15px] h-[15px] mr-2"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Available Stock Info */}
          <View className="bg-[#F4D5B2] px-3 py-2 rounded-md flex-row justify-center">
            <Text className="text-[12px] text-black mx-3">
              Available Stock ( Bail Quantity ) :
            </Text>
            <Text className="text-[14px] text-black font-bold mx-3">
              375.26
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UpdateProductScreen')}
          className="bg-[#D29C63] py-4 rounded-xl items-center justify-center ">
          <Text className="text-white font-semibold text-base">
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SaveChangesScreen;
