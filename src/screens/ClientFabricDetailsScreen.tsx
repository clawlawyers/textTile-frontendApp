import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {HomeStackParamList} from '../stacks/Home';

const fabricDetails = [
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
  {
    bail: 'TX-BL-001',
    design: 'DS24COT101',
    lot: '24-500',
    category: 'Cotton Shirting',
    quantity: '5,000',
  },
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ClientFabricDetailsScreen'
>;

const ClientFabricDetailsScreen = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FBD7A2] pt-14 px-4 pb-6">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Client Name Section */}
      <View className="rounded-xl bg-[#D6872A] px-4 py-3 mb-4">
        <Text className="text-white text-sm">Rameswaram Das</Text>
        <Text className="text-white text-lg font-bold">Ram Enterprise</Text>
      </View>

      {/* Table Header */}
      <View className="bg-[#1F1F1F] flex-row px-3 py-2 rounded-t-lg">
        <Text className="text-white text-sm flex-1 font-semibold">Bail No</Text>
        <Text className="text-white text-sm flex-1 font-semibold">
          Design No
        </Text>
        <Text className="text-white text-sm flex-1 font-semibold">Lot No</Text>
        <Text className="text-white text-sm flex-1 font-semibold">
          Category
        </Text>
        <Text className="text-white text-sm flex-1 font-semibold text-right">
          Quantity
        </Text>
      </View>

      {/* Table Rows */}
      <ScrollView className="bg-[#DB9245] rounded-b-xl max-h-[340px]">
        {fabricDetails.map((item, index) => (
          <View
            key={index}
            className="flex-row px-3 py-2 border-b border-[#eca65f] last:border-b-0">
            <Text className="text-xs text-black flex-1">{item.bail}</Text>
            <Text className="text-xs text-black flex-1">{item.design}</Text>
            <Text className="text-xs text-black flex-1">{item.lot}</Text>
            <Text className="text-xs text-black flex-1">{item.category}</Text>
            <Text className="text-xs text-black flex-1 text-right">
              {item.quantity}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Button */}
      <TouchableOpacity className="bg-[#D6872A] mt-8 py-4 rounded-xl items-center">
        <Text className="text-white font-semibold text-base">
          Update Client Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClientFabricDetailsScreen;
