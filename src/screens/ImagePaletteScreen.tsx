/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type ImagePaletteScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ImagePaletteScreen'
>;

const ImagePaletteScreen = ({navigation, route}: ImagePaletteScreenProps) => {
  const [imageUrl, setImageUrl] = React.useState(route.params.imageUrl);

  return (
    <View className="flex-1 bg-[#FAD9B3] px-5 pt-4 flex">
      {/* Header Icons */}
      <SafeAreaView className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('TextileImageGenerator')}>
          <Icon name="home" size={24} color="#DB9245" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('Wallet')}>
          <Icon name="wallet" size={24} color="#DB9245" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Illustration */}
      <View className="items-center mt-2 mb-3">
        <Image
          source={require('../assets/illustration.gif')}
          resizeMode="contain"
          style={{width: 300, height: 250}}
        />
      </View>

      {/* Heading */}
      <Text className="text-center text-[#DB9245] text-2xl font-bold">
        Bring Dream Colours To Design
      </Text>
      <Text className="text-center text-black text-base mb-5">
        Change Image Index Colours
      </Text>

      {/* Advanced Settings */}
      <View className="bg-[#EEBE88] p-4 rounded-2xl border border-[#DB9245] mt-auto mb-10">
        <Text className="text-black font-semibold mb-3">
          Advanced Design Settings
        </Text>

        {/* Number of Colors */}
        {/* <View className="flex-row items-center bg-[#DB9245] rounded-md overflow-hidden mb-3">
          <Text className="text-white px-2 py-2 text-sm">
            No. of Colours To Generate Image Palatte
          </Text>
          <View className="flex-row bg-[#FBDBB5] my-2 mr-2 rounded-md ml-auto">
            <TouchableOpacity className="px-3 py-1 border-r border-gray-200">
              <Text className="text-black text-lg">-</Text>
            </TouchableOpacity>
            <Text className="text-black px-3 mt-1 py-1 min-w-[30px] text-center">
              10
            </Text>
            <TouchableOpacity className="px-3 py-1 border-l border-gray-200">
              <Text className="text-black text-lg">+</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Reference Image Upload */}
        <View className="flex-row items-center bg-[#DB9245] rounded-md overflow-hidden mb-2">
          <Text className="text-white px-2 py-2 text-sm">Reference Image</Text>
          <TextInput
            editable={route.params.imageUrl ? false : true}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Paste Image URL or Upload Image"
            placeholderTextColor="#666666"
            className="flex-1 py-2 bg-[#FBDBB5] text-[#666666] text-xs px-2"
          />
          <TouchableOpacity className="bg-[#292C33] p-2">
            <Icon name="upload" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
        <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl mt-6">
          <Text className="text-white text-center font-bold text-base">
            Start Palatte Generation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePaletteScreen;
