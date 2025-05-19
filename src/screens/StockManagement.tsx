import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const StockManagement = () => {
  const navigation = useNavigation();
  const [stockValue, setStockValue] = useState('100');

  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View>
          <Text className="text-xs text-[#292C33] text-right">
            Inventory For
          </Text>
          <Text className="text-sm font-semibold text-black text-right">
            CLAW Textile Manufacturing
          </Text>
        </View>
      </View>

      {/* Product Image */}
      <View className="items-center mb-4">
        <Image
          source={require('../assets/Sari.png')}
          className="w-full h-52 rounded-xl"
          resizeMode="cover"
        />
      </View>

      {/* Action Icons */}
      <View className="flex-row justify-end gap-4 mb-4">
        <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="alert-triangle" size={20} color="#292C33" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="trash-2" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <Text className="text-base font-bold mb-2 text-black">
        Product Name Line Goes Here ...
      </Text>

      <View className="space-y-1 mb-6">
        <Text className="text-sm text-black">
          <Text className="font-medium">Category Name : </Text>
          {'  '}
          <Text className="font-bold">Saffron Mixed Rayon</Text>
        </Text>
        <Text className="text-sm text-black">
          <Text className="font-medium">Design Number : </Text>
          {'  '}
          <Text className="font-bold">SFFRN–RAY–22GH</Text>
        </Text>
        <Text className="text-sm text-black">
          <Text className="font-medium">Textile Type : </Text>
          {'        '}
          <Text className="font-bold"> Cotton Blend</Text>
        </Text>
      </View>

      {/* Stock Management Section */}
      <View className="mt-6">
        <View className="bg-[#DB9245] rounded-xl p-4">
          <Text className="text-black font-semibold text-base mb-3">
            Stock to Add :
          </Text>

          <View className="bg-[#FAD9B3] rounded-lg mb-3 overflow-hidden">
            <View className="flex-row items-center">
              <View className="py-3 px-4">
                <Text className="text-black font-semibold">Add Stock</Text>
              </View>

              <View className="flex-1 bg-white py-3 px-4">
                <TextInput
                  className="text-center text-black"
                  keyboardType="numeric"
                  value={stockValue}
                  onChangeText={setStockValue}
                />
              </View>

              <TouchableOpacity className="p-3">
                <Icon name="plus-circle" size={24} color="#DB9245" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-[#DB9245] border border-[#292C33] rounded-lg p-3 mb-4">
            <Text className="text-black text-center">
              Available Stock ( Bail Quantity ) :{' '}
              <Text className="font-bold">375.26</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity className="bg-[#DB9245] py-4 rounded-xl items-center mt-4">
          <Text className="text-white font-semibold text-base">
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StockManagement;
