/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity, SafeAreaView, Image} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../../stacks/Home';

type CompleteUploadProps = NativeStackScreenProps<
  HomeStackParamList,
  'CompleteUpload'
>;

const CompleteUpload = ({navigation}: CompleteUploadProps) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-between">
        {/* Header */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
              <Icon name="arrow-left" size={20} color="#292C33" />
            </TouchableOpacity>
            <View className="flex-1 items-end -ml-4">
              <Text className="text-sm text-black">Inventory For</Text>
              <Text className="text-base font-bold text-black">
                CLAW Textile Manufacturing
              </Text>
            </View>
          </View>

          {/* Logo Image */}
          <View className=" my-6 ml-2">
            <Image
              source={require('../../assets/logo.png')}
              style={{width: 80, height: 80, resizeMode: 'contain'}}
            />
          </View>

          {/* Title and Description */}
          <View className="mb-6 ml-2">
            <Text className="text-xl font-bold text-black">
              Add Items to Inventory
            </Text>
            <Text className="text-sm text-black mt-2 mb-4">
              Please choose how you want to{' '}
              <Text className="text-[#B8601C] font-medium">Add Items</Text> to
              your inventory
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('CompleteUpload')}
            className="flex-row items-center mb-2 border justify-center rounded px-4 my-4 py-2"
            style={{borderColor: '#DB9245'}}>
            <Image
              source={require('../../assets/icons/upload.png')}
              style={{width: 20, height: 20, marginRight: 8}}
              resizeMode="contain"
            />
            <Text className="text-base font-bold text-[#666666] p-2">
              Click Here To Upload File
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}>
            {/* Left Icon and Text */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={require('../../assets/icons/uploadedfile.png')}
                style={{width: 15, height: 15, marginRight: 8}}
                resizeMode="contain"
              />
              <Text style={{fontSize: 14, color: 'black'}}>
                inventory_set_green.csv
              </Text>
            </View>

            {/* Delete Icon */}
            <TouchableOpacity onPress={() => console.log('Delete pressed')}>
              <Icon name="trash-2" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#DB9245] py-4 rounded-xl items-center justify-center mt-4"
          onPress={() => navigation.navigate('UploadProgressModal')}>
          <Text className="text-white font-semibold text-base">
            Complete Upload
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CompleteUpload;
