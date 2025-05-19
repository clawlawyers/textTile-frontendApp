import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryMappingScreen'
>;

const InventoryMappingScreen = ({navigation}: AddNewUserProps) => {
  const [mapping, setMapping] = useState({
    categoryName: '',
    designCode: '',
    productId: '',
    lotNumber: '',
  });

  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            CLAW Textile Manufacturing
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Title */}
        <Text className="text-center text-lg font-semibold text-black mb-1">
          Uploaded Inventory Mapping
        </Text>
        <Text className="text-center text-xs text-[#292C33] mb-6">
          Please Map The Inventory Document to The Below Listed Items
        </Text>

        {/* Mapping Fields */}
        {[
          {label: 'Category Name', key: 'categoryName'},
          {label: 'Design Code', key: 'designCode'},
          {label: 'Product ID', key: 'productId'},
          {label: 'Lot Number', key: 'lotNumber'},
        ].map(field => (
          <View
            key={field.key}
            className="flex-row items-center border border-[#D6872A] rounded-md mb-4 overflow-hidden">
            <View className="bg-[#D6872A] px-4 py-3 rounded-l-md w-[45%]">
              <Text className="text-white font-medium text-sm">
                {field.label}
              </Text>
            </View>
            <TouchableOpacity className="flex-1 flex-row justify-between items-center px-4">
              <Text className="text-black text-sm">CELL NAME</Text>
              <Icon name="chevron-down" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Note */}
      </ScrollView>
      <Text className="text-[10px] text-[#292C33] mt-2 mb-6 text-center">
        <Text className="font-semibold">Please Note: </Text>
        Images of Each Product Needs to be manually uploaded in Inventory
        Section after Mapping
      </Text>

      {/* Start Mapping Button */}
      <TouchableOpacity className="bg-[#DB9245] py-3 rounded-lg items-center mb-10">
        <Text className="text-white font-semibold">Start Mapping</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InventoryMappingScreen;
