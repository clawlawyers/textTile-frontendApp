/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Dropdown} from 'react-native-element-dropdown';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../stacks/Home';

const cellOptions = [
  {label: 'CELL NAME', value: 'cell_1'},
  {label: 'CELL NAME 2', value: 'cell_2'},
  {label: 'CELL NAME 3', value: 'cell_3'},
];

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryMappingScreen'
>;

const InventoryMappingScreen = ({navigation}: Props) => {
  const [formData, setFormData] = useState({
    category: '',
    designCode: '',
    productId: '',
    lotNumber: '',
  });

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
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

        <ScrollView className="space-y-4">
          <Text className="text-center text-black text-xl font-bold mb-2">
            Uploaded Inventory Mapping
          </Text>
          <Text className="text-center text-black text-sm py-4 w-[70%] mb-2">
            Please Map The Inventory Document to the Below Listed Items
          </Text>

          {/* Mapping Dropdowns */}
          {[
            {key: 'category', label: 'Category Name'},
            {key: 'designCode', label: 'Design Code'},
            {key: 'productId', label: 'Product ID'},
            {key: 'lotNumber', label: 'Lot Number'},
          ].map(field => (
            <View
              key={field.key}
              className="flex-row rounded-lg overflow-hidden mb-3">
              <View className="w-[50%] bg-[#D6872A] justify-center px-4 py-4">
                <Text className="text-white  text-m font-semibold">
                  {field.label}
                </Text>
              </View>

              <View className="flex-1 px-3 justify-center border border-[#DB9245] rounded-r-lg">
                <Dropdown
                  data={cellOptions}
                  value={formData[field.key as keyof typeof formData]}
                  labelField="label"
                  valueField="value"
                  placeholder="CELL NAME"
                  placeholderStyle={{
                    color: '#333',
                    textAlign: 'center',
                    fontSize: 14,
                  }}
                  selectedTextStyle={{color: '#000'}}
                  onChange={item => handleChange(field.key as any, item.value)}
                  renderRightIcon={() => (
                    <Ionicons name="chevron-down" size={18} color="#000" />
                  )}
                />
              </View>
            </View>
          ))}
        </ScrollView>
        {/* Note */}
        <Text className="text-xs text-black text-center mt-4">
          <Text className="font-semibold">Please Note:</Text> Images of each
          product need to be manually updated in the Inventory section after
          mapping
        </Text>
        {/* Bottom Button */}
        <TouchableOpacity
          onPress={() => console.log('Start Mapping')}
          className="mt-6 bg-[#D6872A] py-4 rounded-xl items-center">
          <Text className="text-white font-semibold text-base">
            Start Mapping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InventoryMappingScreen;
