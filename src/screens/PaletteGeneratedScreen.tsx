import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeStackParamList} from '../stacks/Home';

const colorPalette = [
  '#E0DFDB',
  '#D39C5E',
  '#C0771E',
  '#4E4D4C',
  '#7F6D6B',
  '#B85DF3',
  '#18120F',
  '#E2DCD6',
  '#0E3A19',
  '#C478F1',
  '#121F39',
];

type PaletteGeneratedScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'PaletteGeneratedScreen'
>;

const PaletteGeneratedScreen = ({navigation}: PaletteGeneratedScreenProps) => {
  const renderItem = ({item}: {item: string}) => (
    <View className="flex-row items-center gap-3 mb-3">
      <View className="w-8 h-8 rounded" style={{backgroundColor: item}} />
      <View>
        <Text className="text-black font-medium text-xs">
          Colour Name : <Text className="font-bold">Ocean Blue</Text>
        </Text>
        <Text className="text-black font-medium text-xs">
          Hex Code : <Text className="font-bold">{item}</Text>
        </Text>
      </View>
    </View>
  );

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
        Palatte Generated
      </Text>

      {/* Color List */}
      <View className="bg-[#EEBE88] border border-[#DB9245] rounded-xl p-4 mb-6">
        <FlatList
          data={colorPalette}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
      <View className="mt-auto mb-10">
        {/* Buttons */}
        <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl mb-3">
          <Text className="text-white text-center font-semibold text-base">
            Edit Indexed Colours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl">
          <Text className="text-white text-center font-semibold text-base">
            Download Palatte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaletteGeneratedScreen;
