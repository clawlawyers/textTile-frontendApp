/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'SetUpInventoryScreen'
>;

const SetUpInventoryScreen = ({navigation}: AddNewUserProps) => {
  const [inventoryName, setInventoryName] = useState('');

  const handleCreateInventory = () => {
    navigation.navigate('InventoryEmptyScreen');
    // if (!inventoryName.trim()) {
    //   Alert.alert('Validation', 'Please enter inventory name');
    //   return;
    // }

    // // Handle inventory creation logic here
    // Alert.alert('Success', `Inventory "${inventoryName}" created successfully`);
  };

  return (
    <View className="flex-1 bg-[#fdd8ac] px-4 pt-12 relative">
      {/* Top Header Icons */}
      <View className="flex-row justify-between items-center mb-14">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity>
      </View>

      {/* Icon */}
      <View className="items-start">
        <Image
          source={require('../assets/logo.png')} // Replace with your icon
          style={{width: 80, height: 80, resizeMode: 'contain'}}
        />
      </View>

      {/* Heading */}
      <Text className="text-2xl font-bold text-black text-start mt-8">
        Set Up Inventory
      </Text>
      <Text className="text-start mt-2 text-black">
        Set Up Your Inventory first to proceed with{'\n'}
        <Text className="text-[#e67e22] font-medium">Order Placement</Text>
      </Text>

      {/* Input Field */}
      <TextInput
        value={inventoryName}
        onChangeText={setInventoryName}
        placeholder="Enter Inventory Name"
        className="mt-8 border border-[#b25d08] rounded-xl py-3 px-4 text-[#666666]"
        placeholderTextColor="#666666"
      />

      {/* Button */}
      <TouchableOpacity
        onPress={handleCreateInventory}
        className="mt-52 bg-[#DB9245] py-4 rounded-2xl items-center">
        <Text className="text-white font-bold text-base">Create Inventory</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetUpInventoryScreen;
