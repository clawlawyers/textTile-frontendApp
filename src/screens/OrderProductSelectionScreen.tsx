/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {setInventoryName} from '../redux/commonSlice';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useFocusEffect} from '@react-navigation/native';
import {RootState} from '../redux/store';
import {useDispatch, useSelector} from 'react-redux';
import { scale } from '../utils/scaling';

const bailNumbers = [
  {label: 'Bail No', value: 'Bail No'},
  {label: 'Item Name', value: 'Item Name'},
  {label: 'Design No', value: 'Design No'},
  {label: 'Lot No', value: 'Lot No'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderProductSelectionScreen'
>;

const OrderProductSelectionScreen = ({navigation, route}: AddNewUserProps) => {
  const [selectedBail, setSelectedBail] = useState('Bail No');
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [itemNames, setItemNames] = useState<{ label: string; value: string }[]>([]);

  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentClienName = useSelector(
    (state: RootState) => state.common.currentClient,
  );
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  console.log(loading);

  useFocusEffect(
    useCallback(() => {
      const getProdList = async () => {
        console.log('helo');
        setLoading(true);
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/companies/${activeFirm?._id}/inventory`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch products: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          dispatch(setInventoryName(data.inventoryName));

          if (data.products.length === 0) {
            navigation.replace('InventoryEmptyScreen');
          } else {
            setProducts(data.products);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
        }
      };

      if (currentUser && route.params?.clientName) {
        getProdList();
      }

      return () => {
        setProducts([]);
      };
    }, [
      currentUser,
      route.params?.clientName,
      activeFirm?._id,
      dispatch,
      navigation,
    ]),
  );

  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueItemNames = Array.from(
        new Set(products.map(item => item.category_code).filter(code => code)),
      ).map(code => ({ label: code, value: code }));
      setItemNames(uniqueItemNames);
    } else {
      setItemNames([]);
    }
  }, [products]);

  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = products;
    console.log(filtered);

    if (selectedBail === 'Item Name' && selectedItemName) {
      filtered = products.filter(
        item => item.category_code === selectedItemName,
      );
    } else if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = products.filter(item => {
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
            return (
              item.bail_number?.toLowerCase().includes(searchLower) ||
              item.category_code?.toLowerCase().includes(searchLower) ||
              item.design_code?.toLowerCase().includes(searchLower) ||
              item.lot_number?.toLowerCase().includes(searchLower)
            );
        }
      });
    }

    setFilteredProducts(filtered);
  }, [searchText, selectedBail, products, selectedItemName]);

  useEffect(() => {
    if (selectedBail !== 'Item Name') {
      setSelectedItemName(null);
    }
  }, [selectedBail]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading inventory...</Text>
      </View>
    );
  }

  console.log(currentClienName);
  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD9B3] pt-14 px-4 pb-2">
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
            {currentClienName.name}
          </Text>
        </View>
      </View>

      {/* Dropdown + Search */}
      <View className="flex-row items-center mb-4 border border-[#D6872A] rounded-xl">
        <View className="w-[30%] bg-[#D6872A] rounded-l-xl px-2">
          <Dropdown
            style={{
              height: 40,
              backgroundColor: 'transparent',
              margin: 0,
              padding: 0,
            }}
            containerStyle={{
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
                className="py-3 px-2"
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

      {/* Item Name Dropdown */}
      {selectedBail === 'Item Name' && (
        <View className="mb-4">
          <Dropdown
            style={{
              height: 40,
              backgroundColor: '#D6872A',
              borderRadius: 10,
              paddingHorizontal: 8,
            }}
            containerStyle={{
              borderRadius: 5,
              backgroundColor: '#D6872A',
            }}
            itemContainerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.2)',
            }}
            placeholderStyle={{
              color: '#fff',
              fontSize: 14,
            }}
            selectedTextStyle={{
              color: '#fff',
              fontSize: 14,
            }}
            iconStyle={{
              width: 20,
              height: 20,
              tintColor: '#fff',
            }}
            itemTextStyle={{
              color: '#fff',
              fontSize: 14,
            }}
            activeColor="rgba(255,255,255,0.2)"
            data={itemNames}
            labelField="label"
            valueField="value"
            placeholder="Select Item Name"
            value={selectedItemName}
            onChange={item => setSelectedItemName(item.value)}
            renderRightIcon={() => (
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#fff"
              />
            )}
            renderItem={(item, selected) => (
              <View
                className="py-3 px-2"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selected ? 'rgba(255,255,255,0.2)' : 'transparent',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: selected ? 'bold' : 'normal',
                    fontSize: 12,
                  }}>
                  {item.label}
                </Text>
                {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            )}
          />
        </View>
      )}

      {/* Download List */}
      <TouchableOpacity className="self-end mb-3 flex-row items-center">
        <Ionicons name="cloud-download-outline" size={18} color="black" />
        <Text className="ml-1 text-sm text-black">Download List</Text>
      </TouchableOpacity>

      {/* Product Grid */}
      <FlatList
        className="mb-20 rounded-lg bg-#DB9245]"
        data={filteredProducts.length > 0 ? filteredProducts : products}
        keyExtractor={(_, i) => i.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 4 }}
        columnWrapperStyle={{ justifyContent: 'space-between',  }}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item._id}
            className="w-[48%]  rounded-lg mb-4 overflow-hidden bg-[#DB9245] "
            onPress={() =>
              navigation.navigate('OrderProductDetailCard', {
                productDetails: item,
              })
            }>
            {/* Image Container */}
            <View className="w-full h-32 bg-[#DB9245] px-4 pt-4 pb-2 justify-center items-center">
              <Image
                source={
                  item?.image
                    ? { uri: item.image }
                    : require('../assets/t-shirt.png')
                }
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>

            {/* Details */}
            <View className="bg-[#DB9245] p-2">
              <Text className="text-sm font-semibold text-black">Bail No:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.bail_number}</Text>
              <Text className="text-sm font-semibold text-black">Item Name:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.category_code}</Text>
              <Text className="text-sm font-semibold text-black">Design Code:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.design_code}</Text>
              <View
                className="bg-[#FAD9B3] rounded-md flex-1 self-center px-2 py-1 mt-2">
                <Text className="text-sm text-black font-semibold text-center">
                  {item.stock_amount ? 'In Stock' : 'Out Of Stock'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Actions */}
      <View className="absolute bottom-4 left-4 right-4 flex-row gap-4 mb-1 flex-1">
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl items-center border text-[#292C33] border-[#292C33]"
          onPress={() => navigation.navigate('OrderSummaryScreen')}>
          <Text className="font-semibold text-base text-[#292C33]">
            Cart {'('}
            {currentClienName.cart.items.length}
            {')'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OrderProductSelectionScreen;