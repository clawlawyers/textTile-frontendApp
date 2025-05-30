import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'StockManagement'
>;

const StockManagement = ({navigation, route}: AddNewUserProps) => {
  const [prodDetails, setProdDetails] = useState(route.params.productDetails);
  const [stockValue, setStockValue] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setStockValue(prodDetails.stock_amount);
  // }, [prodDetails.stock_amount]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSaveChanges = async () => {
    // TODO: Implement stock update logic

    setLoading(true);

    const response = await fetch(
      `${NODE_API_ENDPOINT}/inventory/product/${prodDetails._id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          ...prodDetails,
          stock_amount: prodDetails.stock_amount + stockValue,
        }),
      },
    );
    if (!response.ok) {
      setLoading(false);
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(
        `Failed to update stock: ${response.status} ${errorText}`,
      );
    }

    const data = await response.json();
    console.log(data.product);
    setLoading(false);

    navigation.goBack();

    navigation.replace('InventoryProductDetails', {
      productDetails: data.product,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD9B3]">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      <ScrollView
        className="flex-1 pt-12 px-6"
        contentContainerStyle={{paddingBottom: keyboardVisible ? 200 : 20}}
        keyboardShouldPersistTaps="handled">
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
          {prodDetails.image ? (
            <Image
              source={{uri: prodDetails.image}}
              className="w-full h-52 bg-white"
              resizeMode="stretch"
            />
          ) : (
            <Image
              source={require('../assets/t-shirt.png')}
              className="w-full h-52 bg-white"
              resizeMode="stretch"
            />
          )}
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
          {prodDetails.lot_number}
        </Text>

        <View className="space-y-1 mb-6">
          <Text className="text-sm text-black">
            <Text className="">Category Name : </Text>
            {'  '}
            <Text className="font-bold">{prodDetails.category_code}</Text>
          </Text>
          <Text className="text-sm text-black">
            <Text className="">Design Number : </Text>
            {'  '}
            <Text className="font-bold">{prodDetails.design_code}</Text>
          </Text>
          <Text className="text-sm text-black">
            <Text className="">Textile Type : </Text>
            {'        '}
            <Text className="font-bold">{prodDetails.bail_number}</Text>
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
                    value={stockValue.toString()}
                    onChangeText={text => {
                      setStockValue(Number(text));
                      // setProdDetails({
                      //   ...prodDetails,
                      //   stock_amount: prodDetails.stock_amount + stockValue,
                      // });
                    }}
                  />
                </View>

                <TouchableOpacity
                  className="p-3"
                  onPress={() => {
                    setStockValue(stockValue + 1);
                  }}>
                  <Icon name="plus-circle" size={24} color="#DB9245" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-[#DB9245] border border-[#292C33] rounded-lg p-3 mb-4">
              <Text className="text-black text-center">
                Available Stock ( Bail Quantity ) :{' '}
                <Text className="font-bold">{prodDetails.stock_amount}</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#DB9245] py-4 rounded-xl items-center mt-4"
            onPress={handleSaveChanges}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StockManagement;
