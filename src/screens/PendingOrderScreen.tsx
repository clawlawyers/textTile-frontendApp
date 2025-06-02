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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import {setCurrentClient, setPaymentDetails} from '../redux/commonSlice';
import Icon1 from 'react-native-vector-icons/Feather';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'PendingOrderScreen'
>;

const PendingOrderScreen = ({navigation, route}: AddNewUserProps) => {
  // Get screen dimensions
  const {width, height} = Dimensions.get('window');
  const isSmallDevice = width < 375;

  console.log(route.params.orderDetails.payments);

  // Calculate dynamic heights based on screen size
  const listMaxHeight = height * 0.35; // 35% of screen height
  const fontSize = isSmallDevice ? 10 : 12;

  const dispatch = useDispatch();

  const [cartProducts, setCartProducts] = useState(
    route.params.orderDetails.products,
  );

  const [loading, setLoading] = useState(false);

  const [getLoading, setGetLoading] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const paymentDetails = useSelector(
    (state: RootState) => state.common.paymentDetails,
  );

  // Add state to track updated due amount
  const [updatedDueAmount, setUpdatedDueAmount] = useState(
    route.params.orderDetails.dueAmount,
  );

  console.log(route.params.orderDetails.dueAmount);

  // Add useEffect to update the due amount when payment details change
  useEffect(() => {
    if (paymentDetails) {
      // Update the displayed due amount when payment details change
      setUpdatedDueAmount(paymentDetails.dueAmount);
    }
  }, [paymentDetails]);

  useEffect(() => {
    dispatch(
      setPaymentDetails({
        totalAmount: route.params.orderDetails.totalAmount,
        dueAmount: route.params.orderDetails.dueAmount,
        payments: route.params.orderDetails.payments,
      }),
    );
  }, []);

  // Add this function to handle order confirmation
  const handleConfirmOrder = () => {
    // Make sure all products have their prices set correctly before confirming
    const productsWithPrices = cartProducts.map(item => ({
      ...item,
      unitPrice: parseFloat(item.inventoryProduct.price) || 0,
      totalPrice:
        (parseFloat(item.inventoryProduct.price) || 0) * item.quantity,
    }));

    console.log('Order confirmed with products:', productsWithPrices);

    // Update the cart products with the correct prices
    setCartProducts(productsWithPrices);

    const processPayments = async () => {
      try {
        setLoading(true);

        // Get the order ID from route params
        const orderId = route.params.orderDetails._id;

        // If payment details exist, create payment records
        // if (
        //   paymentDetails &&
        //   paymentDetails.payments &&
        //   paymentDetails.payments.length > 0
        // ) {
        //   try {
        //     // Process payments as before...

        //     // After successful payment processing, update the displayed due amount
        //     if (paymentDetails.dueAmount) {
        //       setUpdatedDueAmount(paymentDetails.dueAmount);
        //     }

        //     // Show toast notification
        //     ToastAndroid.show(
        //       'Payment processed successfully',
        //       ToastAndroid.SHORT,
        //     );

        //     // Clear payment details from Redux after successful processing
        //     dispatch(setPaymentDetails(null));
        //   } catch (paymentError) {
        //     // Error handling as before...
        //   }
        // }

        // If payment details exist, create payment records
        if (
          paymentDetails &&
          paymentDetails.payments &&
          paymentDetails.payments.length > 0
        ) {
          try {
            // Calculate total order amount
            const orderTotal =
              typeof paymentDetails.totalAmount === 'string'
                ? parseFloat(paymentDetails.totalAmount.replace(/[₹,\s]/g, ''))
                : paymentDetails.totalAmount;
            let remainingDueAmount = orderTotal;
            const paymentResults = [];

            console.log(paymentDetails.payments[0]?._id);

            // Sort payments by amount (largest first) to process larger payments first
            const sortedPayments = [...paymentDetails.payments].sort(
              (a, b) => b.amount - a.amount,
            );

            // Process each payment individually and sequentially
            for (const payment of sortedPayments) {
              if (payment?._id !== undefined) {
                console.log('Payment already processed');
                continue;
              }
              console.log('Processing payment:', payment);

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
                orderId: route.params.orderDetails._id,
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
        navigation.replace('OrderUpdateConfirmationScreen', {
          orderId: orderId,
        });
      } catch (error) {
        setLoading(false);
        console.error('Error processing payments:', error);
        Alert.alert('Error', 'Failed to process payments');
      }
    };

    processPayments();
  };

  if (getLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Order...</Text>
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
      <View className="flex-1 px-3 py-2">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4 mt-4">
          <TouchableOpacity
            onPress={() => {
              dispatch(setPaymentDetails(null));
              navigation.goBack();
            }}
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

        {/* Table Header */}
        <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between">
          <Text
            style={{fontSize, width: '25%'}}
            className="text-white font-semibold">
            Product Name
          </Text>
          <Text
            style={{fontSize, width: '20%'}}
            className="text-white font-semibold">
            Bale No
          </Text>
          <Text
            style={{fontSize, width: '15%'}}
            className="text-white font-semibold text-center">
            Qty
          </Text>
          <Text
            style={{fontSize, width: '25%'}}
            className="text-white font-semibold text-center">
            Rate
          </Text>
        </View>

        {/* Cart Items Container */}
        <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mb-4">
          {/* Scrollable Items List */}
          <ScrollView
            style={{maxHeight: listMaxHeight}}
            showsVerticalScrollIndicator={false}
            className="mb-2">
            {cartProducts?.map((item, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between mb-3 py-1">
                <Text style={{fontSize, width: '25%'}} className="text-white">
                  {item?.inventoryProduct?.design_code}
                </Text>
                <Text style={{fontSize, width: '20%'}} className="text-white">
                  {item?.inventoryProduct?.bail_number}
                </Text>
                <Text
                  style={{fontSize, width: '15%'}}
                  className="text-white text-center">
                  {item?.quantity}
                </Text>
                <View style={{width: '25%'}} className="px-1">
                  <TextInput
                    style={{fontSize}}
                    className="border border-white rounded-md px-2 py-1 text-white text-center"
                    value={item.unitPrice.toString()}
                    editable={false}
                  />
                </View>
                {/* <TouchableOpacity
                  style={{width: '15%'}}
                  className="items-center"
                  onPress={() => handleRemoveItem(item.inventoryProduct._id)}>
                  <Icon name="trash-2" size={16} color="#fff" />
                </TouchableOpacity> */}
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="mt-auto">
          {/* Total Amount Section */}
          <View className="mt-2 mb-4 flex gap-5">
            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden">
              <View className="bg-black px-4 py-4 w-[40%]">
                <Text className="text-white font-semibold">Total Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹{' '}
                  {route.params.orderDetails.totalAmount.toLocaleString(
                    'en-IN',
                  )}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden">
              <View className="bg-black px-4 py-4 w-[40%]">
                <Text className="text-white font-semibold">Due Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹ {updatedDueAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mt-auto mb-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center border border-[#292C33]"
              onPress={() =>
                navigation.navigate('PaymentScreen', {
                  paymentDetails: {
                    totalAmount:
                      // route.params.orderDetails.totalAmount.toLocaleString(
                      //   'en-IN',
                      // )
                      paymentDetails.totalAmount,
                    dueAmount: paymentDetails.dueAmount,
                    // route.params.orderDetails.dueAmount.toLocaleString(
                    //   'en-IN',
                    // ),
                  },
                  paymentHistory: paymentDetails.payments,
                })
              }>
              <Text className="font-semibold text-base text-[#292C33]">
                Payment Options
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row gap-4 mt-auto mb-4">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl items-center border border-[#DB9245] bg-[#DB9245]"
              onPress={handleConfirmOrder}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Update Order Placement
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PendingOrderScreen;
