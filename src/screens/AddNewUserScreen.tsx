import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {AddNewUserStackParamList} from '../stacks/AddNewUser';

type AddNewUserProps = NativeStackScreenProps<
  AddNewUserStackParamList,
  'AddNewUser'
>;

const AddNewUserScreen = ({navigation}: AddNewUserProps) => {
  return (
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-4">
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
          source={require('../assets/logo.png')} // Replace with your logo image
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Title & Subtitle */}
      <Text className="text-black text-2xl font-bold mb-2">Add New User</Text>
      <Text className="text-sm text-black mb-6 leading-relaxed">
        Enter Complete Details of New User, followed by{'\n'}setting up
        permissions for them
      </Text>

      {/* Input Fields */}
      <TextInput
        placeholder="Enter User Name"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        placeholder="Enter User Contact Number"
        placeholderTextColor="#666666"
        keyboardType="phone-pad"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        placeholder="Enter User Email ID"
        placeholderTextColor="#666666"
        keyboardType="email-address"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-10 text-[#666666]"
      />

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#D6872A] py-4 rounded-xl items-center justify-center"
        onPress={() => navigation.navigate('UserPermissions')}>
        <Text className="text-white font-semibold text-base">
          Create New User
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddNewUserScreen;
