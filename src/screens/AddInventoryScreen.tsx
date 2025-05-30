import React from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddInventoryScreen'
>;

const AddInventoryScreen = ({navigation}: AddNewUserProps) => {
  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );
  return (
    <View className="flex-1 bg-[#FAD9B3] px-6 pt-12">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Back button and header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Logo */}
      <View className="items-start mb-8">
        <Image
          source={require('../assets/logo.png')} // Replace with your actual image
          className="w-24 h-24"
          resizeMode="contain"
        />
        a
      </View>

      {/* Heading */}
      <Text className="text-xl font-bold text-black mb-2">
        Add Items to Inventory
      </Text>
      <Text className="text-sm text-[#292C33] mb-10">
        Please Choose How you want to{' '}
        <Text className="text-[#DB9245]">Add Items</Text> to Your Inventory
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg mb-4 items-center"
        onPress={() => navigation.navigate('AddInventoryProduct')}>
        <Text className="text-white font-semibold">Add Single Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center"
        onPress={() => navigation.navigate('UploadCSVScreen')}>
        <Text className="text-white font-semibold">Upload CSV</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddInventoryScreen;
