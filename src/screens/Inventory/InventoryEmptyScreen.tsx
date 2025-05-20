/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../../stacks/Home';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';

const bailNumbers = [
  {label: 'Bail No.', value: 'Bail No.'},
  {label: 'Category No.', value: 'Category No.'},
  {label: 'Design Code', value: 'Design Code'},
  {label: 'Design Code', value: 'Design Code'},
];

type InventoryEmptyProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryEmptyScreen'
>;

const InventoryEmptyScreen = ({navigation}: InventoryEmptyProps) => {
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

          {/* Dropdown + Search Bar */}
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
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end', // push content to the right
              alignItems: 'center',
              paddingHorizontal: 16,
              width: '100%',
              marginBottom: 8,
            }}>
            <Image
              source={require('../../assets/icons/upload.png')}
              style={{width: 15, height: 15, marginRight: 8}}
              resizeMode="contain"
            />
            <Text style={{fontSize: 12, color: 'black', fontWeight: '500'}}>
              Download List
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty State Message in Center */}
        <View className="items-center justify-center">
          <View className="w-10 h-10 rounded-full bg-[#D6872A] items-center justify-center">
            <Text className="text-white text-2xl font-bold">!</Text>
          </View>
          <Text className="text-lg font-bold text-black mt-4">
            Inventory Empty
          </Text>
          <Text className="text-sm text-black text-center mt-1 px-8">
            Your Inventory is Currently Empty{'\n'}
            Add Items to Your Inventory to Proceed
          </Text>
        </View>

        {/* Fixed Bottom Button */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl items-center justify-center mt-4"
          onPress={() => navigation.navigate('AddItemsToInventory')}>
          <Text className="text-white font-semibold text-base">
            Add Items to Inventory
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InventoryEmptyScreen;
