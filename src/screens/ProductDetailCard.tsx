// ProductDetailCard.tsx

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProductDetailCard'
>;

const ProductDetailCard = ({navigation}: AddNewUserProps) => {
  const [quantity, setQuantity] = useState('120');

  return (
    <View className="flex-1 bg-[#F4D5B2] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        <View className="flex-1 items-end -ml-4">
          <Text className="text-sm text-black">Order Creation For</Text>
          <Text className="text-base font-bold text-black">
            Rameswaram Emporium
          </Text>
          <View className="w-full">
            <Text className="text-xs text-center text-black">
              Order Number : 023568458464
            </Text>
          </View>
        </View>
      </View>

      {/* Image */}
      <Image
        source={require('../assets/Sari.png')}
        className="w-full h-56 rounded-lg mb-4"
        resizeMode="cover"
      />

      {/* Product Info */}
      <Text className="text-base font-semibold mb-2">
        Product Name Line Goes Here ...
      </Text>

      <View className="mb-4">
        <Text className="text-sm">
          Category Name :{' '}
          <Text className="font-semibold">Saffron Mixed Rayon</Text>
        </Text>
        <Text className="text-sm">
          Design Number : <Text className="font-semibold">SFFRN–RAY–22GH</Text>
        </Text>
        <Text className="text-sm">
          Textile Type : <Text className="font-semibold">Cotton Blend</Text>
        </Text>
      </View>

      {/* Download */}
      <Pressable className="flex-row items-center justify-end mb-2">
        <Icon name="download" size={16} color="#000" />
        <Text className="ml-2 text-sm underline">Download Product Details</Text>
      </Pressable>

      <View className="mt-20">
        {/* Stock Display */}
        <View className=" rounded-lg px-3 py-2 mb-2 border border-[#292C33] ">
          <Text className="text-sm text-center">
            Available Stock ( Bail Quantity ) :{' '}
            <Text className="font-semibold">375.26</Text>
          </Text>
        </View>

        {/* Quantity Input */}
        <View className=" rounded-lg mb-4 text-base flex-row items-center border border-[#292C33]">
          <Text className="bg-[#292C33] h-full text-white text-sm pt-2 px-4">
            Bail Quantity
          </Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Bail Quantity"
            className=" px-4 py-2"
          />
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity className="bg-[#D1853A] py-3 rounded-xl items-center">
          <Text className="text-white font-semibold text-base">
            Add To Cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailCard;
