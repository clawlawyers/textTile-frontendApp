import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type FirmAddedScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'FirmAddedScreen'
>;

const FirmAddedScreen = ({navigation}: FirmAddedScreenProps) => {
  return (
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12">
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

      {/* Centered Content */}
      <View className="flex-1 items-center justify-center -mt-20">
        {/* <View className="bg-[#CA6800] w-10 h-10 rounded-full items-center justify-center mb-6">
          <Text className="text-white text-xl font-bold">!</Text>
        </View> */}
        <View className="mb-5">
          <Ionicons name="alert-circle" size={40} color="#CA6800" />
        </View>

        <Text className="text-black text-xl font-bold mb-2">
          New Firm Added
        </Text>
        <Text className="text-center text-[#292C33] text-sm">
          You can now manage its details and inventory{'\n'}from the dashboard
        </Text>
      </View>
    </View>
  );
};

export default FirmAddedScreen;
