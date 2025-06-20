import React, { useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, SafeAreaView, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import { verticalScale } from '../utils/scaling';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Dropdown } from 'react-native-element-dropdown';
const bailNumbers = [
    {label: 'Bail No', value: 'Bail No'},
    {label: 'Item Name', value: 'Item Name'},
    {label: 'Design No', value: 'Design No'},
    {label: 'Lot No', value: 'Lot No'},
  ];

type NewInventoryScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'NewInventoryscreen'
>;

const NewInventoryScreen = ({navigation}: NewInventoryScreenProps) => {
    const [downloading, setDownloading] = React.useState(false);
    const [selectedBail, setSelectedBail] = useState('Bail No.');
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
  
    const dispatch = useDispatch();
  
    const [products, setProducts] = useState([]);
  
    console.log(products);
  
    const currentUser = useSelector((state: RootState) => state.auth.user);
  
    const inventoryName = useSelector(
      (state: RootState) => state.common.inventoryName,
    );
    const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
      console.log(inventoryName)
      useEffect(() => {
        if (!products || products.length === 0) {
          setFilteredProducts([]);
          return;
        }
    
        // Filter products based on search text and selected filter
        const filtered = products.filter(item => {
          if (!searchText.trim()) {
            return true; // Show all when no search text
          }
    
          const searchLower = searchText.toLowerCase().trim();
    
          // Filter based on selected dropdown option
          switch (selectedBail) {
            case 'Bail No':
              return item.bail_number?.toLowerCase().includes(searchLower);
            case 'Item Name':
              return item.category_code?.toLowerCase().includes(searchLower);
            case 'Design No':
              return item.design_code?.toLowerCase().includes(searchLower);
            case 'Lot No':
              return item.lot_number?.toLowerCase().includes(searchLower);
            default:
              // Search in all fields if no specific filter is selected
              return (
                item.bail_number?.toLowerCase().includes(searchLower) ||
                item.category_code?.toLowerCase().includes(searchLower) ||
                item.design_code?.toLowerCase().includes(searchLower) ||
                item.lot_number?.toLowerCase().includes(searchLower)
              );
          }
        });
    
        setFilteredProducts(filtered);
      }, [searchText, selectedBail, products]);
    
  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12 pb-8 justify-between">
      {/* Top Header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            {inventoryName}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center mb-4 border border-[#D6872A] rounded-xl">
        <View className="w-[30%] bg-[#D6872A] rounded-l-xl px-2">
          <Dropdown
            style={{
              height: 42,
              backgroundColor: 'transparent',
              margin: 0,
              padding: 0,
            }}
            containerStyle={{
              // width: '100%',
              borderRadius: 5,
              backgroundColor: '#D6872A',
              margin: 0,
              padding: 0,
            }}
            itemContainerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.2)',
              padding: 0,
            }}
            placeholderStyle={{
              color: '#fff',
              fontSize: 14,
              marginLeft: 8,
            }}
            selectedTextStyle={{
              color: '#fff',
              fontSize: 12,
              marginLeft: 8,
            }}
            iconStyle={{
              width: 20,
              height: 20,
              tintColor: '#fff',
              marginRight: 8,
            }}
            itemTextStyle={{
              color: '#fff',
              fontSize: 14,
              padding: 0,
            }}
            activeColor="rgba(255,255,255,0.2)"
            data={bailNumbers}
            labelField="label"
            valueField="value"
            placeholder={selectedBail}
            value={selectedBail}
            onChange={item => setSelectedBail(item.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setIsDropdownOpen(false)}
            renderRightIcon={() => (
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#fff"
                style={{marginRight: 8}}
              />
            )}
            renderItem={(item, selected) => (
              <View
                className="py-2 px-2"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: selected ? 'bold' : 'normal',
                    fontSize: 12,
                  }}>
                  {item.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            )}
          />
        </View>

        <View className="flex-1 rounded-r-lg px-3 flex-row items-center">
          <TextInput
            placeholder="Search..."
            className="flex-1 text-black"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={18} color="black" />
        </View>
      </View>
        {/* <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity> */}
      {/* Centered Content */}
      <View className="flex-1 items-center justify-center -mt-20">
        {/* <View className="bg-[#CA6800] w-10 h-10 rounded-full items-center justify-center mb-6">
          <Text className="text-white text-xl font-bold">!</Text>
        </View> */}
        <View className="mb-5">
          <Ionicons name="alert-circle" size={40} color="#CA6800" />
        </View>

        <Text className="text-black text-xl font-bold mb-2">
          Inventory Empty
        </Text>
        <Text className="text-center text-[#292C33] text-sm">
          Your Inventory is Currently Empty{'\n'}Add Items to Your Inventory to Proceed
        </Text>
      </View>
      <TouchableOpacity className='bg-[#292C33] rounded-lg' 
      onPress={()=>navigation.navigate('AddInventoryScreen')}>
        <Text className='px-4 py-4 text-center font-bold text-white'>
            Add Items to Inventory
        </Text>

      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewInventoryScreen;
