/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, SafeAreaView, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.
import {RootState} from '../redux/store';
import {useSelector} from 'react-redux';

const bailNumbers = [
  {label: 'Bail No.', value: 'Bail No.'},
  {label: 'Category No.', value: 'Category No.'},
  {label: 'Design Code', value: 'Design Code'},
  {label: 'Design Code', value: 'Design Code'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryEmptyScreen'
>;

const InventoryEmptyScreen = ({navigation}: AddNewUserProps) => {
  const [selectedBail, setSelectedBail] = useState('Bail No.');

  const handleAddItems = () => {
    // Alert.alert('Navigation', 'Navigating to add items screen...');
    navigation.navigate('AddInventoryScreen');
  };

  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#fdd8ac] pt-12 px-4">
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
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Dropdown + Search */}
      <View className="flex-row items-center  mb-4">
        <View className="w-[30%] bg-[#D6872A] rounded-lg px-2">
          <Dropdown
            style={{height: 40}}
            containerStyle={{borderRadius: 10, backgroundColor: '#D6872A'}}
            placeholderStyle={{color: '#fff'}}
            selectedTextStyle={{color: '#fff', fontSize: 12}}
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
            renderItem={option => (
              <View
                style={{
                  width: '100%',
                  borderRadius: 5,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: '#fff',
                  backgroundColor: '#D6872A',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 14,
                  }}>
                  {option.label}
                </Text>
              </View>
            )}
          />
        </View>

        <View className="flex-1 bg-white rounded-md px-3 flex-row items-center">
          <TextInput className="flex-1 text-black" />
          <Ionicons name="search" size={18} color="black" />
        </View>
      </View>

      {/* Download List */}
      <TouchableOpacity className="mt-2 self-end mr-1">
        <Text className="text-xs text-gray-600 underline">Download List</Text>
      </TouchableOpacity>

      {/* Inventory Empty Notice */}
      <View className="flex-1 justify-center items-center">
        <Ionicons name="alert-circle" size={40} color="#c05f00" />
        <Text className="text-xl font-bold text-black mt-4">
          Inventory Empty
        </Text>
        <Text className="text-center mt-2 text-black px-8">
          Your Inventory is Currently Empty{'\n'}
          Add Items to Your Inventory to Proceed
        </Text>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        onPress={handleAddItems}
        className="bg-black py-4 rounded-2xl items-center mb-6">
        <Text className="text-white font-bold text-base">
          Add Items to Inventory
        </Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InventoryEmptyScreen;
