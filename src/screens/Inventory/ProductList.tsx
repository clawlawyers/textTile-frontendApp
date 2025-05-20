/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../../stacks/Home';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

const data = Array(8).fill({
  category: 'Category Name',
  name: 'Product Name Line Goes Here ...',
  designCode: '3355669',
  stock: '250 Bails',
  image: require('../../assets/t-shirt.png'),
});

const bailNumbers = [
  {label: 'Bail No.', value: 'Bail No.'},
  {label: 'Category No.', value: 'Category No.'},
  {label: 'Design Code', value: 'Design Code'},
  {label: 'Design Code', value: 'Design Code'},
];

type ProductListScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProductListScreen'
>;

const ProductListScreen = ({navigation}: ProductListScreenProps) => {
  const [selectedBail, setSelectedBail] = useState('Bail No.');

  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-between">
        {/* Header + Search */}
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
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

          {/* Dropdown + Search */}
          <View className="flex-row items-center mb-4 mt-2">
            <View className="w-[30%] bg-[#D6872A] rounded-l-lg px-2">
              <Dropdown
                style={{height: 40}}
                containerStyle={{
                  borderRadius: 0,
                  borderTopLeftRadius: 8,
                  borderBottomLeftRadius: 8,
                }}
                placeholderStyle={{
                  color: '#fff',
                  fontSize: 14,
                  textAlign: 'center',
                }}
                selectedTextStyle={{
                  color: '#fff',
                  fontSize: 14,
                  textAlign: 'center',
                }}
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
            <View className="flex-1 bg-white rounded-r-md px-3 flex-row items-center">
              <TextInput
                placeholder="Search..."
                className="flex-1 text-black"
              />
              <Ionicons name="search" size={18} color="black" />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => console.log('Download List')}
            className="flex-row justify-end items-center px-4 w-full mb-2">
            <Image
              source={require('../../assets/icons/upload.png')}
              className="w-[15px] h-[15px] mr-2"
              resizeMode="contain"
            />
            <Text className="text-[12px] text-black font-medium">
              Download List
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between">
            {data.map((item, index) => (
              <View
                key={index}
                className="w-[48%] bg-white rounded-lg mb-3 border border-[#ccc] overflow-hidden">
                <Image
                  source={item.image}
                  className="w-full h-[120px] bg-white"
                  resizeMode="contain"
                />
                <View className="bg-[#DE925C] p-3">
                  <Text className="text-[12px] text-white">
                    {item.category}
                  </Text>
                  <Text className="text-[14px] font-bold text-black my-1">
                    {item.name}
                  </Text>
                  <Text className="text-[12px] text-white p-1">
                    Design Code: {item.designCode}
                  </Text>
                  <View className="border border-white px-2 py-1 rounded-lg mt-1 self-center items-center justify-center">
                    <Text className="text-[12px] text-white">
                      Stock: {item.stock}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Fixed Button */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl items-center justify-center mt-4"
          onPress={() => navigation.navigate('ProductDetailsInventoryScreen')}>
          <Text className="text-white font-semibold text-base">
            Update Inventory
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductListScreen;
