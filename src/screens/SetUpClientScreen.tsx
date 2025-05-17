import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'SetUpClientScreen'
>;

const SetUpClientScreen = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FBD7A2] px-6 pt-14 pb-8">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
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

      {/* Centered Logo */}
      <View className="items-start mt-4">
        <Image
          source={require('../assets/logo.png')} // Replace with your image
          style={{width: 80, height: 80, resizeMode: 'contain'}}
        />
      </View>

      {/* Title and Description */}
      <View className="mt-8 items-start">
        <Text className="text-black text-xl font-bold">Set Up Client</Text>
        <Text className="text-black text-sm mt-2">
          Set Up Your Client first to proceed with {'\n'}
          <Text className="text-[#D6872A]">Order Placement</Text>
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-10 space-y-4 gap-4">
        <TouchableOpacity
          className="bg-[#D6872A] py-3 rounded-md items-center"
          onPress={() => navigation.navigate('AddClientScreen')}>
          <Text className="text-white font-semibold text-base">
            Add New Client
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#D6872A] py-3 rounded-md items-center"
          onPress={() => navigation.navigate('ClientListScreen')}>
          <Text className="text-white font-semibold text-base">
            Existing Client
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SetUpClientScreen;
