/* eslint-disable react-native/no-inline-styles */
// ProductDetailCard.tsx

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setCurrentClient} from '../redux/commonSlice';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderProductDetailCard'
>;

const OrderProductDetailCard = ({navigation, route}: AddNewUserProps) => {
  const [quantity, setQuantity] = useState('0');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dispatch = useDispatch();
  const [productDetails, setProductDetails] = useState(
    route.params.productDetails,
  );
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);

  console.log(route.params.productDetails);

  const handleAddToCart = async () => {
    console.log('Hello');
    if (quantity.trim() === '') {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }
    if (Number(quantity) === 0) {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }
    if (Number(quantity) > productDetails.stock_amount) {
      Alert.alert('Error', 'Quantity exceeds available stock');
      return;
    }

    setLoading(true);
    console.log('hello bhai');
    const addToCartResponse = await fetch(
      `${NODE_API_ENDPOINT}/cart/${currentClient?._id}/add`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          inventoryProductId: productDetails._id,
          quantity,
        }),
      },
    );

    console.log(addToCartResponse);
    if (!addToCartResponse.ok) {
      setLoading(false);
      const errorText = await addToCartResponse.text();
      console.log(errorText.message);
      ToastAndroid.show(errorText.message, ToastAndroid.SHORT);
      throw new Error(
        `Failed to add to cart: ${addToCartResponse.status} ${errorText}`,
      );
    }
    const data = await addToCartResponse.json();
    console.log(data.cart.items);

    // Create a new object instead of mutating the existing one
    const updatedClient = {
      ...currentClient,
      cart: {
        ...currentClient?.cart,
        items: data.cart.items,
      },
    };

    // Dispatch the new object to Redux
    dispatch(setCurrentClient(updatedClient));
    setLoading(false);
    // Alert.alert('Success', 'Product added to cart successfully', [
    //   {
    //     text: 'OK',
    //     onPress: () => navigation.goBack(),
    //   },
    // ]);
    ToastAndroid.show('Product added to cart successfully', ToastAndroid.SHORT);

    navigation.goBack();

    navigation.replace('OrderProductSelectionScreen', {
      clientName: currentClient?.name,
    });
  };

  // Add keyboard listeners
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

  console.log(loading);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#F4D5B2]">
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{
          paddingBottom: keyboardVisible ? 200 : 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4 mt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
            <Icon1 name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
          <View className="flex-1 items-end -ml-4">
            <Text className="text-sm text-black">Order Creation For</Text>
            <Text className="text-base font-bold text-black">
              {currentClient?.name}
            </Text>
          </View>
        </View>

        {/* Image */}
        <View className="items-center mb-4">
          {productDetails.image ? (
            <Image
              source={{uri: productDetails.image}}
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

        {/* Product Info */}
        <View className=" mb-2 text-black flex-row flex">
          <Text className="text-base font-bold">Item Name:{'  '}</Text>
          <Text className="text-base mb-2 text-black">
            {productDetails.category_code}
          </Text>
        </View>

        <View className="space-y-1 mb-6">
          <View className="text-sm text-black flex flex-row">
            <Text className="">Full Bale No : </Text>
            {'     '}
            <Text className="font-bold">{productDetails.bail_number}</Text>
          </View>
          <View className="text-sm text-black flex flex-row">
            <Text className="">Entry Date : </Text>
            {'     '}
            <Text className="font-bold">
              {'   '}
              {new Date(productDetails.bail_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </Text>
          </View>
          <View className="text-sm text-black flex flex-row">
            <Text className="">Design No : {'  '}</Text>

            <Text className="font-bold"> {productDetails.design_code}</Text>
          </View>
          <View className="text-sm text-black flex flex-row">
            <Text className="">Lote No : </Text>
            {'     '}
            <Text className="font-bold">{productDetails.lot_number}</Text>
          </View>
        </View>

        <View className="flex-1 justify-end">
          {/* Download */}
          <Pressable className="flex-row items-center justify-end mb-4">
            <Icon name="download" size={16} color="#000" />
            <Text className="ml-2 text-sm">Download Product Details</Text>
          </Pressable>

          <View className="">
            {/* Stock Display */}
            <View className="rounded-lg px-3 py-2 mb-2 border border-[#292C33]">
              <Text className="text-sm text-center">
                Available Stock ( Bail Quantity ) :{' '}
                <Text className="font-semibold">
                  {productDetails.stock_amount}
                </Text>
              </Text>
            </View>

            {/* Quantity Input */}
            <View className="rounded-lg mb-4 text-base flex-row items-center border border-[#292C33]">
              <Text className="bg-[#292C33] rounded-md h-full text-white text-sm pt-2 px-4">
                Bail Quantity
              </Text>

              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="Bail Quantity"
                className="flex-1 px-4 py-2 text-black"
              />
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              className="bg-[#D1853A] py-3 rounded-xl items-center mb-4"
              onPress={handleAddToCart}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Add To Cart
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OrderProductDetailCard;
