import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryUpdatingScreen'
>;

const InventoryUpdatingScreen = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            CLAW Textile Manufacturing
          </Text>
        </View>
      </View>

      {/* Center Content */}
      <View className="flex-1 justify-center items-center">
        <Image
          source={require('../assets/logo.png')} // Replace with your actual logo path
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-center text-[#292C33] text-sm font-medium">
          Please Wait While Your Inventory is Updating
        </Text>
      </View>
    </View>
  );
};

export default InventoryUpdatingScreen;
