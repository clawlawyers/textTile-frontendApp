import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const colorPalette = [
  {name: 'Ocean Blue', hex: '#0077BE', color: '#E0DFDB'},
  {name: 'Sunset Orange', hex: '#FF5733', color: '#D39C5E'},
  {name: 'Forest Green', hex: '#228B22', color: '#33FF57'},
  {name: 'Crimson Red', hex: '#DC143C', color: '#335F76'},
  {name: 'Golden Yellow', hex: '#FFD700', color: '#F1C40F'},
  {name: 'Lavender Purple', hex: '#E6E6FA', color: '#7E43C3'},
  {name: 'Charcoal Gray', hex: '#36454F', color: '#E4E4AD'},
  {name: 'Slate Blue', hex: '#6A5ACD', color: '#349B0B'},
  {name: 'Soft Pink', hex: '#FFB6C1', color: '#2EC7C1'},
  {name: 'Mint Green', hex: '#98FF98', color: '#6E76E2'},
];

type EditPaletteScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'EditPaletteScreen'
>;

const EditPaletteScreen = ({navigation}: EditPaletteScreenProps) => {
  const renderItem = ({item}: {item: (typeof colorPalette)[0]}) => (
    <View className="flex-row items-center gap-3 mb-3">
      {/* Color Preview Box */}
      <View className="w-8 h-8 rounded" style={{backgroundColor: item.color}} />

      {/* Name & Hex Info */}
      <View className="flex-1">
        <Text className="text-black text-xs font-medium">
          Colour Name : <Text className="font-bold">{item.name}</Text>
        </Text>
        <Text className="text-black text-xs font-medium">
          Hex Code : <Text className="font-bold">{item.hex}</Text>
        </Text>
      </View>

      {/* Hex Code Input & Edit Icon */}
      <View className="flex-row items-center bg-white rounded-md overflow-hidden border border-[#DB9245]">
        <TextInput
          defaultValue={item.hex}
          className="text-black text-xs px-2 py-1 w-20"
        />
        <TouchableOpacity className="px-2 py-1 bg-[#DB9245]">
          <Icon name="pencil" size={16} color="white" />
        </TouchableOpacity>
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
        Edit Palatte Colour
      </Text>

      {/* Editable List */}
      <View className="bg-[#EEBE88] border border-[#DB9245] rounded-xl p-4 mb-6">
        <FlatList
          data={colorPalette}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>

      <View className="mt-auto mb-10">
        {/* Update Button */}
        <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl">
          <Text className="text-white text-center font-semibold text-base">
            Update Palatte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditPaletteScreen;
