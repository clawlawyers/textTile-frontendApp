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
import {HomeStackParamList} from '../stacks/Home';

type AddNewFirmScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddNewFirmScreen'
>;

const AddNewFirmScreen = ({navigation}: AddNewFirmScreenProps) => {
  return (
    <ScrollView className="flex-1 bg-[#FAD9B3] px-6 pt-12">
      {/* Top Navigation */}
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
          source={require('../assets/logo.png')} // Replace with your icon
          className="w-28 h-28"
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-black text-2xl font-bold mb-2">Add New Firm</Text>
      <Text className="text-sm text-black mb-6 leading-relaxed">
        Enter All The Firm Details to Proceed with Adding A Firm. Currently One
        Inventory is designated to each Firm.
      </Text>

      {/* Input Fields */}
      <TextInput
        placeholder="Enter Firm Name"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        placeholder="Enter Firm Address"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        placeholder="Enter Firm GST Number"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-10 text-[#666666]"
      />

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#D6872A] py-4 rounded-xl items-center justify-center"
        onPress={() => navigation.navigate('FirmAddedScreen')}>
        <Text className="text-white font-semibold text-base">
          Save New Firm
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddNewFirmScreen;
