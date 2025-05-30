import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AddNewUserStackParamList} from '../stacks/AddNewUser';

type AddNewUserAddedProps = NativeStackScreenProps<
  AddNewUserStackParamList,
  'AddNewUserAdded'
>;

const AddNewUserAdded = ({navigation}: AddNewUserAddedProps) => {
  return (
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.replace('AddNewUser')}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        {/* <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity> */}
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
          New User Added
        </Text>
        <Text className="text-center text-[#292C33] text-sm">
          An invite has been sent to their email with{'\n'}login instructions.
        </Text>
      </View>
    </View>
  );
};

export default AddNewUserAdded;
