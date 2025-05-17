import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';
import Icon from 'react-native-vector-icons/MaterialIcons';

const firmData = {
  companyName: 'RR Enterprise',
  firmName: 'RR Enterprise',
  gst: '012356985421525445',
  address: 'AF–56, Prasanta Apartment,\nKestopur, Kolkata– 700101,\nIndia',
};

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'UserDetailsScreen'
>;

const UserDetailsScreen = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 pb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Ionicons name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mt-8 mb-5">
        <Text className="text-xl  font-bold text-black">User Details</Text>

        <TouchableOpacity className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="delete" size={18} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-2">
          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">
              Company Name :
            </Text>
            <Text className="text-black flex-1">{firmData.companyName}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">
              Firm Name :
            </Text>
            <Text className="text-black flex-1">{firmData.firmName}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">GST No :</Text>
            <Text className="text-black flex-1">{firmData.gst}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">Address :</Text>
            <Text className="text-black flex-1">{firmData.address}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <TouchableOpacity className="bg-black py-4 mt-6 rounded-xl items-center justify-center">
        <Text className="text-white font-semibold text-base">
          View Inventory
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserDetailsScreen;
