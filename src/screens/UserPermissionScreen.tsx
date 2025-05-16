import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {AddNewUserStackParamList} from '../stacks/AddNewUser';

type UserPermissionsProps = NativeStackScreenProps<
  AddNewUserStackParamList,
  'UserPermissions'
>;

const UserPermissionScreen = ({navigation}: UserPermissionsProps) => {
  return (
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-1">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          {/* <FontistoIcon name="bell" size={25} color={'#DB9245'} /> */}
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View className="items-start mt-4 mb-6">
        <Image
          source={require('../assets/logo.png')} // Replace with actual logo
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Title and Subtitle */}
      <Text className="text-black text-2xl font-bold mb-1">
        Set User Permissions
      </Text>
      <Text className="text-sm text-black mb-4 leading-snug">
        Set User Permissions as to what{' '}
        <Text className="text-[#C16800] font-semibold">Deepika Padukone</Text>{' '}
        can be allowed to access and modify.
      </Text>

      {/* Permissions Sections */}
      <View className="bg-[#1E1E1E] rounded-xl p-4 mb-2">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
          <View className="w-4 h-4 border border-[#DB9245] rounded-full mr-3" />
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Order Management
            </Text>
          </View>
        </View>
        {[
          'Add / Delete Client',
          'Create / Delete Order',
          'Complete Order',
          'Invoice Generation',
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center mb-1 ml-5">
            <View className="w-4 h-4 border border-[#DB9245] rounded-full mr-3" />
            <Text className="text-[#FBDBB5] text-sm">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-[#1E1E1E] rounded-xl p-4 mb-5">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
          <View className="w-4 h-4 border border-[#DB9245] rounded-full mr-3" />
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Inventory Management
            </Text>
          </View>
        </View>

        {['View Inventory', 'Edit Inventory', 'Create / Remove Inventory'].map(
          (item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center mb-1 ml-5">
              <View className="w-4 h-4 border border-[#DB9245] rounded-full mr-3" />
              <Text className="text-[#FBDBB5] text-sm">{item}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#D6872A] py-4 rounded-xl items-center justify-center"
        onPress={() => navigation.navigate('AddNewUserAdded')}>
        <Text className="text-white font-semibold text-base">
          Update User Permission
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserPermissionScreen;
