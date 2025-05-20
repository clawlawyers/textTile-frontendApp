/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
import {View, Text, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../stacks/Home';
import Icon from 'react-native-vector-icons/Feather';

type UploadProgressModalProps = NativeStackScreenProps<
  HomeStackParamList,
  'UploadProgressModal'
>;

const UploadProgressModal = ({navigation}: UploadProgressModalProps) => {
  // Navigate after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('InventoryMappingScreen');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-center items-center">
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}>
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
        </View>
        {/* Logo Image and Text Centered */}
        <View className="justify-center items-center">
          <Image
            source={require('../../assets/logo.png')}
            style={{
              width: 80,
              height: 80,
              resizeMode: 'contain',
              marginBottom: 10,
            }}
          />
          <Text className="text-sm text-black text-center">
            Please Wait While Your Inventory is Updating
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UploadProgressModal;
