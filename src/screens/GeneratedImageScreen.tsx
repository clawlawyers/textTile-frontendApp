/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type GeneratedImageScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'GeneratedImageScreen'
>;

const GeneratedImageScreen = ({
  navigation,
  route,
}: GeneratedImageScreenProps) => {
  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-2 flex">
      {/* Header */}
      <SafeAreaView className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('TextileImageGenerator')}>
          <Icon name="home" size={24} color="#DB9245" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('Wallet')}>
          <Icon name="wallet" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Title */}
      <Text className="text-center text-black font-semibold text-lg mb-4">
        Image Generated
      </Text>

      {/* Generated Image */}
      <View className="items-center mb-6">
        <Image
          source={{uri: route.params.imageUrl}}
          // source={require('../assets/cactus.png'))} // Replace with actual image
          style={{width: 350, height: 500, borderRadius: 12}}
          resizeMode="stretch"
        />
      </View>

      <View className="mt-auto mb-10">
        {/* Top Buttons */}
        <View className="flex-row justify-center gap-4 mb-6">
          <TouchableOpacity
            className="bg-[#FAD9B3] w-[45%] border border-[#DB9245] px-4 py-2 rounded-xl"
            onPress={() =>
              ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT)
            }>
            <Text className="text-[#DB9245] font-semibold text-sm text-center">
              Colorify
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FAD9B3] w-[45%] border border-[#DB9245] px-4 py-2 rounded-xl"
            onPress={() => {
              ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
            }}>
            <Text className="text-[#DB9245] font-semibold text-sm text-center">
              Make Grid Pattern
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl mb-3"
          onPress={() =>
            navigation.navigate('EditImageScreen', {
              imageUrl: route.params.imageUrl,
            })
          }>
          <Text className="text-white text-center font-semibold text-base">
            Edit Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl">
          <Text className="text-white text-center font-semibold text-base">
            Download Design
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GeneratedImageScreen;
