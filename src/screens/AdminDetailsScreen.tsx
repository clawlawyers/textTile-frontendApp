/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';

type AddNewUserProps = NativeStackScreenProps<AccountStackParamList, 'Account'>;

const AdminDetailsScreen = ({navigation}: AddNewUserProps) => {
  const adminInfo = {
    name: 'Soumya Snigdha Banik',
    company: 'CLAW Design Enterprise',
    contact: '+917384242486',
    email: 'soumyabanik0@gmail.com',
    gst: '0123654789654J23',
  };

  return (
    <ScrollView className="bg-[#FAD9B3] flex-1 px-4 pt-10 ">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity>
      </View>

      {/* Admin Card */}
      <View className="bg-[#DB9245] rounded-xl p-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-white">Admin Details</Text>
          <Feather name="edit-2" size={16} color="white" />
        </View>
        {[
          {label: 'Name', value: adminInfo.name},
          {label: 'Company', value: adminInfo.company},
          {label: 'Contact', value: adminInfo.contact},
          {label: 'Email ID', value: adminInfo.email},
          {label: 'GST No', value: adminInfo.gst},
        ].map((item, idx) => (
          <View
            key={idx}
            style={{backgroundColor: '#FBDBB5'}}
            className=" rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
            <Text className="text-xs font-medium text-black">
              {item.label} :
            </Text>
            <Text className="text-sm  text-black">{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View className="mt-6 mb-20">
        <Pressable
          className="bg-[#DB9245] rounded-md py-3 mb-4"
          onPress={() => navigation.navigate('FirmScreens')}>
          <Text className="text-center text-white font-semibold">
            View All Firms
          </Text>
        </Pressable>
        <Pressable
          className="bg-[#DB9245] rounded-md py-3 mb-4"
          onPress={() => navigation.navigate('UsersScreen')}>
          <Text className="text-center text-white font-semibold">
            View All Users
          </Text>
        </Pressable>
        <Pressable className="bg-[#DB9245] rounded-md py-3">
          <Text className="text-center text-white font-semibold">
            Generate Insights{' '}
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="mt-6 items-center ">
        <View className="w-full h-px bg-black mb-1" />
        <View className="flex flex-row justify-between items-center w-[90%]">
          <Text className="text-xs text-gray-500">
            Version <Text className="font-bold">1.0.0</Text>
          </Text>
          <Text className="text-xs text-gray-500">
            Powered By{' '}
            <Text className="font-bold text-black">Claw Legal Tech</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AdminDetailsScreen;
