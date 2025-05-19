/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  // ScrollView,
  Image,
  FlatList,
  // Modal,
  // Pressable,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

const bailNumbers = [
  {label: 'Bail No.', value: 'Bail No.'},
  {label: 'Category No.', value: 'Category No.'},
  {label: 'Design Code', value: 'Design Code'},
  {label: 'Design Code', value: 'Design Code'},
];
const products = new Array(8).fill({
  category: 'Category Name',
  title: 'Product Name Line Goes Here ...',
  designCode: '3356896945',
  stock: 'In Stock',
  image: require('../assets/t-shirt.png'), // replace with your image
});

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderProductSelectionScreen'
>;

const OrderProductSelectionScreen = ({navigation}: AddNewUserProps) => {
  // const [selectedBail, setSelectedBail] = React.useState(bailNumbers[0]);
  // const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedBail, setSelectedBail] = useState('Bail No.');

  return (
    <View className="flex-1 bg-[#FBD7A2] pt-14 px-4 pb-2">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
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

      {/* Dropdown + Search */}
      <View className="flex-row items-center gap-2 mb-4">
        {/* <TouchableOpacity className="bg-[#D6872A] rounded-md px-4 py-2 flex-row items-center">
          <Text className="text-white mr-2">Bail No.</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity> */}

        <View className="w-[30%] bg-[#D6872A] rounded-lg px-2">
          <Dropdown
            style={{height: 48}}
            containerStyle={{borderRadius: 10}}
            placeholderStyle={{color: '#fff'}}
            selectedTextStyle={{color: '#fff'}}
            iconStyle={{width: 20, height: 20, tintColor: '#fff'}}
            data={bailNumbers}
            labelField="label"
            valueField="value"
            placeholder={selectedBail}
            value={selectedBail}
            onChange={item => setSelectedBail(item.value)}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={18} color="#fff" />
            )}
          />
        </View>

        <View className="flex-1 bg-white rounded-md px-3 flex-row items-center">
          <TextInput placeholder="Search..." className="flex-1 text-black" />
          <Ionicons name="search" size={18} color="black" />
        </View>
      </View>

      {/* Download List */}
      <TouchableOpacity className="self-end mb-3 flex-row items-center">
        <Ionicons name="cloud-download-outline" size={18} color="black" />
        <Text className="ml-1 text-sm text-black">Download List</Text>
      </TouchableOpacity>

      {/* Product Grid */}
      <FlatList
        className="mb-20 rounded-lg"
        data={products}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}
        columnWrapperStyle={{justifyContent: 'space-between'}}
        renderItem={({item}) => (
          <TouchableOpacity
            className="w-[48%] bg-white rounded-lg mb-4 overflow-hidden border border-[#DB9245]"
            onPress={() => navigation.navigate('ProductDetailCard')}>
            <Image
              source={item.image}
              className="w-full h-32"
              resizeMode="contain"
            />
            <View className="bg-[#DB9245] p-2">
              <Text className="text-[10px] text-white">{item.category}</Text>
              <Text
                numberOfLines={1}
                className="text-[12px] font-semibold text-black mb-1">
                {item.title}
              </Text>
              <Text className="text-[10px] text-white mt-4">
                Design Code : {item.designCode}
              </Text>
              <Text className="text-[10px] text-white border border-white text-center rounded-md">
                {item.stock}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Actions */}
      <View className="absolute bottom-4 left-4 right-4 flex-row gap-4 mb-1">
        <TouchableOpacity className=" flex-1 py-4 rounded-xl items-center border border-[#292C33]">
          <Text className="text-[#292C33] font-semibold text-base">
            Cart (3)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-[#D6872A] flex-1 py-4 rounded-xl items-center">
          <Text className="text-white font-semibold text-base">
            Create Order
          </Text>
        </TouchableOpacity>
      </View>

      {/* <Modal
        transparent
        visible={showDropdown}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <Pressable
          className="flex-1 bg-black/30 justify-center items-center"
          onPress={() => setShowDropdown(false)}>
          <View className="w-3/4 bg-white rounded-lg p-4">
            {bailNumbers.map((bail, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedBail(bail);
                  setShowDropdown(false);
                }}
                className="py-2 px-3 border-b border-gray-200">
                <Text className="text-black">{bail}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal> */}
    </View>
  );
};

export default OrderProductSelectionScreen;
