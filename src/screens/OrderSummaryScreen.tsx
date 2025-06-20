/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ToastAndroid,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import {setCurrentClient, setPaymentDetails} from '../redux/commonSlice';
import Icon1 from 'react-native-vector-icons/Feather';
import Feather from 'react-native-vector-icons/Feather';
import {scale, moderateScale, verticalScale} from '../utils/scaling';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderSummaryScreen'
>;

const OrderSummaryScreen = ({navigation}: AddNewUserProps) => {
  const [gstValue, setGstValue] = useState('');
  const [mode, setMode] = useState<'percent' | 'rupees'>('percent');
  const [value, setValue] = useState('');
  // Get screen dimensions
  const {width, height} = Dimensions.get('window');
  const isSmallDevice = width < 375;

  // Calculate dynamic heights based on screen size
  const listMaxHeight = height * 0.35; // 35% of screen height
  const fontSize = isSmallDevice ? 10 : 12;

  const dispatch = useDispatch();

  const [cartProducts, setCartProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [getLoading, setGetLoading] = useState(true);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const paymentDetails = useSelector(
    (state: RootState) => state.common.paymentDetails,
  );

  console.log(paymentDetails);

  // Handle back navigation cleanup
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      dispatch(setPaymentDetails(null)); // Clear payment details when leaving screen
    });

    return unsubscribe;
  }, [navigation, dispatch]);

  //base total price
  const baseTotalPrice = useMemo(() => {
    return cartProducts.reduce((sum: number, item: any) => {
      const price = parseFloat(item?.inventoryProduct?.price ?? '0') || 0;
      const quantity = parseInt(item?.quantity ?? '0') || 0;
      return sum + price * quantity;
    }, 0);
  }, [cartProducts]);

  //discounted value
  const discountAmount = useMemo(() => {
    const discountValue = parseFloat(value) || 0;
    if (mode === 'percent') {
      return (baseTotalPrice * discountValue) / 100;
    }
    return discountValue; // If mode is 'rupees', subtract the value directly
  }, [baseTotalPrice, value, mode]);

  //calculating gst amount
  const gstAmount = useMemo(() => {
    const gstPercentage = parseFloat(gstValue) || 0;
    return ((baseTotalPrice - discountAmount) * gstPercentage) / 100;
  }, [baseTotalPrice, discountAmount, gstValue]);

  const adjustedTotalPrice = useMemo(() => {
    const price = baseTotalPrice - discountAmount + gstAmount;

    if (!loading) {
      console.log('dispching');
      dispatch(
        setPaymentDetails({
          totalAmount: price.toLocaleString('en-IN'),
          dueAmount: price.toLocaleString('en-IN'),
          payments: [],
        }),
      );
    }
    return price;
  }, [baseTotalPrice, discountAmount, gstAmount, loading, dispatch]);

  console.log(baseTotalPrice);
  console.log(discountAmount);
  console.log(gstAmount);
  console.log(adjustedTotalPrice);

  // Update paymentDetails whenever adjustedTotalPrice changes
  // useEffect(() => {
  //   if (!loading) {
  //     console.log('dispching');
  //     dispatch(
  //       setPaymentDetails({
  //         totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
  //         dueAmount: adjustedTotalPrice.toLocaleString('en-IN'),
  //         payments: paymentDetails?.payments || [],
  //       }),
  //     );
  //   }
  // }, [adjustedTotalPrice, loading, dispatch, paymentDetails?.payments]);

  // Handle item removal
  const handleRemoveItem = async prodId => {
    try {
      // Show confirmation dialog
      Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            // setLoading(true);

            // Log the request details for debugging
            console.log(
              `Removing item: ${prodId} from cart: ${currentClient?._id}`,
            );

            // The API endpoint might be incorrect - let's fix it
            const removeFromCartResponse = await fetch(
              `${NODE_API_ENDPOINT}/cart/${currentClient?._id}/item/${prodId}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${currentUser?.token}`,
                },
                body: JSON.stringify({
                  inventoryProductId: prodId,
                }),
              },
            );

            console.log(removeFromCartResponse);

            if (!removeFromCartResponse.ok) {
              const errorText = await removeFromCartResponse.text();
              console.error(
                `Failed to remove from cart: ${removeFromCartResponse.status} ${errorText}`,
              );
              Alert.alert('Error', 'Failed to remove item from cart');
              // setLoading(false);
              return;
            }

            const data = await removeFromCartResponse.json();

            // Create a new client object with updated cart items
            const updatedClient = {
              ...currentClient,
              cart: {
                ...currentClient?.cart,
                items: data.cart.items,
              },
            };

            // Dispatch the updated client to Redux
            dispatch(setCurrentClient(updatedClient));

            // Update local state
            setCartProducts(data.cart.items);
            // setLoading(false);
          },
        },
      ]);
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
      setLoading(false);
    }
  };

  // Add this function to handle price updates
  const handlePriceChange = (index, newPrice) => {
    const updatedProducts = [...cartProducts];
    // Create a new inventoryProduct object instead of modifying the existing one
    updatedProducts[index] = {
      ...updatedProducts[index],
      inventoryProduct: {
        ...updatedProducts[index].inventoryProduct,
        price: newPrice,
      },
      unitPrice: parseFloat(newPrice) || 0,
      totalPrice: (parseFloat(newPrice) || 0) * updatedProducts[index].quantity,
    };
    setCartProducts(updatedProducts);
  };

  // Add this function to handle order confirmation
  const handleConfirmOrder = () => {
    // Make sure all products have their prices set correctly before confirming
    const productsWithPrices = cartProducts.map(item => ({
      ...item,
      unitPrice: parseFloat(item?.inventoryProduct?.price ?? '0') || 0,
      totalPrice:
        (parseFloat(item?.inventoryProduct?.price ?? '0') || 0) *
        (item?.quantity ?? 0),
    }));

    console.log('Order confirmed with products:', productsWithPrices);

    // Update the cart products with the correct prices
    setCartProducts(productsWithPrices);
    const createOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${NODE_API_ENDPOINT}/cart/${currentClient?._id}/checkout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
            body: JSON.stringify({
              cartItems: productsWithPrices,
              companyId: activeFirm?._id,
              gst: gstValue,
              ...(mode === 'percent'
                ? {discountPercentage: value}
                : {discountValue: value}),
            }),
          },
        );

        if (!response.ok) {
          setLoading(false);
          const errorText = await response.json();
          console.log(errorText?.message);
          ToastAndroid.show(errorText?.message, ToastAndroid.SHORT);
          throw new Error(
            `Failed to create order: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        console.log('Order created:', data);

        // Update the client's cart to empty in Redux
        const updatedClient = {
          ...currentClient,
          cart: {
            ...currentClient?.cart,
            items: [], // Empty the cart items
          },
        };

        // Dispatch the updated client to Redux
        dispatch(setCurrentClient(updatedClient));

        // If payment details exist, create payment records
        if (
          paymentDetails &&
          paymentDetails.payments &&
          paymentDetails.payments.length > 0
        ) {
          try {
            // Calculate total order amount
            const orderTotal = parseFloat(
              paymentDetails.totalAmount.replace(/[₹,\s]/g, ''),
            );
            let remainingDueAmount = orderTotal;
            const paymentResults = [];

            // Sort payments by amount (largest first) to process larger payments first
            const sortedPayments = [...paymentDetails.payments].sort(
              (a, b) => b.amount - a.amount,
            );

            // Process each payment individually and sequentially
            for (const payment of sortedPayments) {
              // Skip payment if it exceeds remaining due amount
              if (payment.amount > remainingDueAmount) {
                console.warn(
                  `Payment of ${payment.amount} exceeds remaining due amount ${remainingDueAmount}. Skipping.`,
                );
                paymentResults.push({
                  success: false,
                  error: `Payment amount (${payment.amount}) cannot exceed due amount (${remainingDueAmount})`,
                  skipped: true,
                });
                continue;
              }

              // Create payment payload for individual payment
              const paymentPayload = {
                orderId: data.order._id,
                amount: payment.amount,
                paymentMethod: payment.modeOfPayment,
                paymentReference: '', // Add default or empty values for required fields
                paymentDate: new Date().toISOString(),
                notes: `Payment via ${payment.modeOfPayment}`,
              };

              try {
                // Make individual API call for each payment
                const addPaymentResponse = await fetch(
                  `${NODE_API_ENDPOINT}/payments/create`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${currentUser?.token}`,
                    },
                    body: JSON.stringify(paymentPayload),
                  },
                );

                if (!addPaymentResponse.ok) {
                  const errorText = await addPaymentResponse.text();
                  let errorObj;
                  try {
                    errorObj = JSON.parse(errorText);
                  } catch (e) {
                    errorObj = {message: errorText};
                  }

                  console.error(`Payment error: ${errorObj.message}`);
                  paymentResults.push({
                    success: false,
                    error: errorObj.message,
                  });

                  // If error is due to exceeding due amount, skip remaining payments
                  if (
                    errorObj.message &&
                    errorObj.message.includes('cannot exceed due amount')
                  ) {
                    console.warn(
                      'Due amount exceeded. Skipping remaining payments.',
                    );
                    break;
                  }
                } else {
                  const paymentData = await addPaymentResponse.json();
                  console.log('Payment created successfully:', paymentData);
                  paymentResults.push({success: true, data: paymentData});

                  // Update remaining due amount
                  remainingDueAmount -= payment.amount;
                }
                ToastAndroid.show(
                  'Payment processed successfully',
                  ToastAndroid.SHORT,
                );
                dispatch(setPaymentDetails(null));
              } catch (singlePaymentError) {
                console.error(
                  'Error processing single payment:',
                  singlePaymentError,
                );
                paymentResults.push({
                  success: false,
                  error: singlePaymentError.message,
                });
              }
            }

            // Log results
            const successfulPayments = paymentResults.filter(
              result => result.success,
            ).length;
            const skippedPayments = paymentResults.filter(
              result => result.skipped,
            ).length;
            console.log(
              `${successfulPayments} of ${paymentResults.length} payments processed successfully`,
            );
            if (skippedPayments > 0) {
              console.log(
                `${skippedPayments} payments were skipped due to exceeding due amount`,
              );
            }

            // Show alert if some payments failed
            if (successfulPayments < paymentResults.length) {
              Alert.alert(
                'Payment Processing',
                `${successfulPayments} of ${paymentResults.length} payments were processed successfully. Some payments may have been skipped because they exceeded the remaining due amount.`,
                [{text: 'OK'}],
              );
            }
          } catch (paymentError) {
            console.error('Error creating payments:', paymentError);
            Alert.alert(
              'Payment Error',
              'There was an error processing some payments, but your order was created successfully.',
            );
            // Continue to order confirmation even if payment creation fails
          }
        }

        setLoading(false);
        dispatch(setPaymentDetails(null));
        navigation.replace('OrderConfirmationScreen', {
          orderId: data.order._id,
        });
      } catch (error) {
        setLoading(false);
        console.error('Error creating order:', error);
        ToastAndroid.show('Failed to create order', ToastAndroid.SHORT);
        // Alert.alert('Error', 'Failed to create order');
      }
    };

    createOrder();
  };

  useEffect(() => {
    const getCartProducts = async () => {
      try {
        setGetLoading(true);
        const response = await fetch(
          `${NODE_API_ENDPOINT}/cart/${currentClient?._id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          },
        );

        if (!response.ok) {
          setGetLoading(false);
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch cart products: ${response.status} ${errorText}`,
          );
        }
        setGetLoading(false);

        const data = await response.json();
        setCartProducts(data.cart.items);
        console.log(data.cart.items);
      } catch (error) {
        setGetLoading(false);
        console.error('Error fetching cart products:', error);
      }
    };
    getCartProducts();
  }, [currentClient?._id, currentUser?.token, currentUser?.type]);

  if (getLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Cart...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F4D5B2',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}>
        <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
  ><TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 px-3 py-2">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4 mt-4">
          <TouchableOpacity
            onPress={() => {
              dispatch(setPaymentDetails(null));
              navigation.goBack();
            }}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
            <Icon name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
          <View className="flex-1 items-end -ml-4">
            <Text className="text-sm text-black">Order Creation For</Text>
            <Text className="text-base font-bold text-black">
              {currentClient?.name}
            </Text>
          </View>
        </View>

        {cartProducts.length === 0 ? (
          <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
            <Text className="mt-2 text-black">Cart is Empty</Text>
          </View>
        ) : (
          <>
            {/* Table Header */}
            <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between">
              <Text
                style={{fontSize, width: '30%'}}
                className="text-white font-semibold">
                Product Name
              </Text>
              <Text
                style={{fontSize, width: '12%'}}
                className="text-white font-semibold">
                Bale No
              </Text>
              <Text
                style={{fontSize, width: '15%'}}
                className="text-white font-semibold text-center">
                Qty
              </Text>
              <Text
                style={{fontSize, width: '23%'}}
                className="text-white font-semibold text-center">
                Rate
              </Text>
              <Text
                style={{fontSize, width: '10%'}}
                className="text-white font-semibold text-center">
                Action
              </Text>
            </View>

            {/* Cart Items Container */}
            <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mb-4">
              <ScrollView
                style={{maxHeight: listMaxHeight}}
                showsVerticalScrollIndicator={false}
                className="mb-2">
                {cartProducts.map((item, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between mb-3 py-1">
                    <Text
                      style={{fontSize, width: '30%'}}
                      className="text-white text-wrap">
                      {item.inventoryProduct?.category_code ?? ''}
                    </Text>
                    <Text
                      style={{fontSize, width: '12%'}}
                      className="text-white text-wrap">
                      {item.inventoryProduct?.bail_number ?? ''}
                    </Text>
                    <Text
                      style={{fontSize, width: '15%'}}
                      className="text-white text-wrap text-center">
                      {item.quantity}
                    </Text>
                    <View style={{width: '23%'}} className="px-1">
                      <TextInput
                        style={{fontSize}}
                        className="border border-white rounded-md px-2 py-1 text-white text-wrap text-center"
                        value={item.inventoryProduct?.price ? item.inventoryProduct.price.toString() : ''}
                        onChangeText={text => handlePriceChange(index, text)}
                        keyboardType="numeric"
                        editable={true}
                      />
                    </View>
                    <TouchableOpacity
                      style={{width: '10%'}}
                      className="items-center"
                      onPress={() =>
                        handleRemoveItem(item?.inventoryProduct?._id)
                      }>
                      <Icon name="trash-2" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                className="bg-[#FBDBB5] rounded-lg py-2 items-center flex-row justify-center"
                onPress={() => {
                  dispatch(setPaymentDetails(null));
                  navigation.navigate('OrderProductSelectionScreen', {
                    clientName: currentClient?.name,
                  });
                }}>
                <View className="border border-black rounded-lg p-1">
                  <Icon name="plus" size={14} color="#000" />
                </View>
                <Text className="ml-2 text-sm font-medium">Add More Items</Text>
              </TouchableOpacity>
            </View>

            <View className=" mt-auto gap-2">
              {/* Discount Section */}
              <View
                className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 "
                style={{height: verticalScale(40)}}>
                {/* Label */}
                <View className="flex-1">
                  <Text className="text-sm text-[#E7CBA1] font-medium">
                    Discount:
                  </Text>
                </View>

                {/* Toggle Buttons */}
                <View className=" flex-1 flex-row bg-[#FBDBB5] rounded-md  mr-2 w-[10%] h-[100%] ">
                  <TouchableOpacity
                    onPress={() => setMode('percent')}
                    className={`flex-1 items-center justify-center rounded-md px-4 ${
                      mode === 'percent' ? 'bg-[#DB9245]' : ''
                    }`}>
                    <Text className="text-sm font-medium text-black">%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMode('rupees')}
                    className={`flex-1 items-center justify-center px-4 rounded-md ${
                      mode === 'rupees' ? 'bg-[#DB9245]' : ''
                    }`}>
                    <Text className="text-sm font-medium text-black">₹</Text>
                  </TouchableOpacity>
                </View>

                {/* Input Box */}
                <View className="flex-row items-center justify-center bg-[#FAD9B3] rounded-md w-[45%] px-4 h-[100%]">
                  {mode === 'rupees' && (
                    <Text className="text-xs text-[#292C33] font-medium">
                      ₹
                    </Text>
                  )}

                  <TextInput
                    value={value}
                    onChangeText={setValue}
                    // placeholder="0"
                    placeholderTextColor="black"
                    keyboardType="numeric"
                    placeholderClassName="text-[#000000] text-lg font-medium text-right min-w-[40px] flex-1 leading-[0.55rem]"
                    className="text-[#000000] text-sm font-medium flex-1 text-right leading-[0.55rem]"
                    style={{minWidth: 40}}
                  />

                  {mode === 'percent' && (
                    <Text className="text-sm text-[#292C33] font-medium ml-1">
                      %
                    </Text>
                  )}
                  <Icon
                    name="edit-2"
                    size={14}
                    color="#C7742D"
                    style={{marginLeft: 8}}
                  />
                </View>
              </View>

              {/* GST Percentage Section */}
              <View
                className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1"
                style={{height: verticalScale(40)}}>
                {/* Left side - Label */}
                <View className="flex-1">
                  <Text className="text-sm text-[#E7CBA1] font-medium">
                    GST Percentage:
                  </Text>
                </View>

                {/* Right side - Input with icon */}
                <View className="flex-row items-center bg-[#FAD9B3] rounded-md px-3 w-[45%] h-[100%]">
                  <TextInput
                    value={gstValue}
                    onChangeText={setGstValue}
                    // placeholder="0"
                    placeholderTextColor="#000000"
                    placeholderClassName="text-[#000000] text-sm font-medium text-right min-w-[40px] flex-1 leading-[0.55rem]"
                    keyboardType="numeric"
                    className="text-[#000000] text-sm font-medium text-right min-w-[40px] flex-1 leading-[0.55rem]"
                  />
                  <Text className="text-sm text-[#292C33] font-medium ml-1">
                    %
                  </Text>
                  <Icon
                    name="edit-2"
                    size={14}
                    color="#C7742D"
                    style={{marginLeft: 8}}
                  />
                </View>
              </View>
              {/* Due Amount Section */}
              <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden">
                <View className="bg-black px-5 py-4 bg-[#292C33]">
                  <Text className="text-white font-semibold">Due Amount</Text>
                </View>
                <View className="px-4 py-3 flex-1">
                  <Text className="text-right font-semibold text-base">
                    ₹{' '}
                    {paymentDetails === null
                      ? adjustedTotalPrice.toLocaleString('en-IN')
                      : paymentDetails.dueAmount}
                  </Text>
                </View>
              </View>
              {/* Total Amount Section */}
              <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden">
                <View className="bg-black px-4 py-4">
                  <Text className="text-white font-semibold">Total Amount</Text>
                </View>
                <View className="px-4 py-3 flex-1">
                  <Text className="text-right font-semibold text-base">
                    ₹ {adjustedTotalPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
              {/* Action Buttons */}
              <View className="flex-row gap-4 mb-4 ">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center border border-[#292C33]"
                  onPress={() => {
                    navigation.navigate('PaymentScreen', {
                      paymentDetails: {
                        totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
                        dueAmount:
                          paymentDetails === null
                            ? adjustedTotalPrice.toLocaleString('en-IN')
                            : paymentDetails.dueAmount,
                      },
                      paymentHistory: paymentDetails?.payments,
                    });
                  }}>
                  <Text className="font-semibold text-base text-[#292C33]">
                    Payment Options
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row gap-4 mb-4">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center border border-[#DB9245] bg-[#DB9245]"
                  onPress={handleConfirmOrder}>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-semibold text-base">
                      Confirm Order Placement
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OrderSummaryScreen;
