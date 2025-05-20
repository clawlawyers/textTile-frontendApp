/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity, SafeAreaView, Image} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../../stacks/Home';

type AddItemsToInventory1Props = NativeStackScreenProps<
  HomeStackParamList,
  'AddItemsToInventory'
>;

const AddItemsToInventory = ({navigation}: AddItemsToInventory1Props) => {
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

          {/* Logo Image */}
          <View className=" my-6 ml-2">
            <Image
              source={require('../../assets/logo.png')}
              style={{width: 80, height: 80, resizeMode: 'contain'}}
            />
          </View>

          {/* Title and Description */}
          <View className="mb-6 ml-2">
            <Text className="text-xl font-bold text-black">
              Add Items to Inventory
            </Text>
            <Text className="text-sm text-black mt-2 mb-4">
              Please choose how you want to{' '}
              <Text className="text-[#B8601C] font-medium">Add Items</Text> to
              your inventory
            </Text>
          </View>

          {/* Buttons */}
          <View className="gap-4 mx-2">
            <TouchableOpacity
              className="bg-[#B8601C] py-4 rounded-lg items-center"
              onPress={() => navigation.navigate('UploadCSV')}>
              <Text className="text-white font-semibold">Add Single Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#B8601C] py-4 rounded-lg items-center"
              onPress={() => navigation.navigate('UploadCSV')}>
              <Text className="text-white font-semibold">Upload CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddItemsToInventory;
