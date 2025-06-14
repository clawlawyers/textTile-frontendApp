/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NODE_API_ENDPOINT } from '../utils/util';
import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { setPaymentDetails } from '../redux/commonSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Item = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type InvoiceItemsProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoiceItemsScreen'
>;

const MAX_AMOUNT = 1_000_000_000; // 1 billion

const InvoiceItemsScreen = ({ navigation, route }: InvoiceItemsProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [gstValue, setGstValue] = useState<string>(route.params?.gstValue || '0');
  const [mode, setMode] = useState<'percent' | 'rupees'>(route.params?.discountMode || 'percent');
  const [value, setValue] = useState<string>(route.params?.discountValue || '0');
  const [cartProducts, setCartProducts] = useState<Item[]>(route.params?.cartProducts || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(
    route.params?.orderId || null,
  );
  const [testOrderId, setTestOrderId] = useState<string | null>(
    route.params?.testOrderId || null,
  ); // Store MongoDB _id
  const invoiceStatus = route.params?.invoiceStatus || 'new';
  const invoiceNumber = route.params?.invoiceNumber || 'INV-2025-001';
  const billingDetails = route.params?.billingDetails || {};
  const paymentDetails = route.params?.paymentDetails || {
    totalAmount: '0',
    dueAmount: '0',
    payments: [],
  };
  const paymentHistory = route.params?.paymentHistory || [];

  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const headerHeight = height * 0.15;
  const fontSize = isSmallDevice ? 10 : 12;

  const bottomButtonHeight = verticalScale(70);
  const formHeight = verticalScale(150);
  const tableHeaderHeight = verticalScale(40);
  const discountSectionHeight = verticalScale(40);
  const gstSectionHeight = verticalScale(40);
  const dueAmountHeight = verticalScale(50);
  const totalAmountHeight = verticalScale(50);
  const indicatorSectionHeight =
    discountSectionHeight +
    gstSectionHeight +
    dueAmountHeight +
    totalAmountHeight +
    verticalScale(8);
  const marginSpacing = verticalScale(24);

  const tableMaxHeight =
    height -
    (headerHeight +
      formHeight +
      tableHeaderHeight +
      indicatorSectionHeight +
      2 * bottomButtonHeight +
      marginSpacing);

  // Initialize paymentDetails and dueAmount
  useEffect(() => {
    const due = parseFloat(
      paymentDetails.dueAmount?.replace(/[₹,\s]/g, '') ||
        adjustedTotalPrice.toString(),
    );
    setDueAmount(due);

    // Set default paymentDetails if none exist
    if (!paymentDetails.payments?.length && adjustedTotalPrice > 0) {
      const defaultPaymentDetails = {
        totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
        dueAmount: adjustedTotalPrice.toLocaleString('en-IN'),
        payments: [],
      };
      dispatch(setPaymentDetails(defaultPaymentDetails));
    }
  }, [adjustedTotalPrice, paymentDetails, dispatch]);

  // Generate six-digit order ID (A00000-Z99999)
  const generateOrderId = async (increment: boolean = false): Promise<string> => {
    try {
      const key = 'invoice_counter';
      let counter = parseInt((await AsyncStorage.getItem(key)) || '0', 10);
      if (isNaN(counter) || counter < 0) {
        counter = 0;
        await AsyncStorage.setItem(key, '0');
      }
      if (increment) {
        counter += 1;
        if (counter > 2599999) {
          throw new Error('Maximum invoice limit reached (Z99999)');
        }
        await AsyncStorage.setItem(key, counter.toString());
      }
      const letter = String.fromCharCode(65 + Math.floor(counter / 100000)); // A-Z
      const number = (counter % 100000).toString().padStart(5, '0'); // 00000-99999
      const orderId = `${letter}${number}`;
      if (!/^[A-Z]\d{5}$/.test(orderId)) {
        throw new Error(`Invalid order ID format: ${orderId}`);
      }
      console.log(`Generated orderId: ${orderId} (counter: ${counter})`);
      return orderId;
    } catch (error) {
      console.error('Error generating order ID:', error);
      throw new Error(`Failed to generate order ID: ${error.message}`);
    }
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice || !newItemQuantity) {
      Alert.alert('Error', 'Please fill in all item details');
      return;
    }

    const newItem: Item = {
      id: `temp-${Date.now()}`,
      name: newItemName,
      quantity: parseInt(newItemQuantity, 10) || 1,
      price: parseFloat(newItemPrice) || 0,
    };

    setCartProducts([...cartProducts, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity('1');
  };

  const calculateItemTotal = (item: Item) => {
    const baseTotal = item.price * item.quantity;
    const discountValue = parseFloat(value) || 0;
    let discountAmount = 0;
    if (mode === 'percent') {
      discountAmount = (baseTotal * discountValue) / 100;
    } else {
      discountAmount = discountValue / (cartProducts.length || 1);
    }

    const discountedTotal = baseTotal - discountAmount;
    const gstPercentage = parseFloat(gstValue) || 0;
    const gstAmount = (discountedTotal * gstPercentage) / 100;

    return discountedTotal + gstAmount;
  };

  const baseTotalPrice = useMemo(() => {
    return cartProducts.reduce((sum: number, item: Item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [cartProducts]);

  const discountAmount = useMemo(() => {
    const discountValue = parseFloat(value) || 0;
    if (mode === 'percent') {
      return (baseTotalPrice * discountValue) / 100;
    }
    return discountValue;
  }, [baseTotalPrice, value, mode]);

  const gstAmount = useMemo(() => {
    const gstPercentage = parseFloat(gstValue) || 0;
    return ((baseTotalPrice - discountAmount) * gstPercentage) / 100;
  }, [baseTotalPrice, discountAmount, gstValue]);

  const adjustedTotalPrice = useMemo(() => {
    return baseTotalPrice - discountAmount + gstAmount;
  }, [baseTotalPrice, discountAmount, gstAmount]);

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setCartProducts(cartProducts.filter(item => item.id !== itemId));
        },
      },
    ]);
  };

  const handlePriceChange = (index: number, newPrice: string) => {
    const updatedProducts = [...cartProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      price: parseFloat(newPrice) || 0,
    };
    setCartProducts(updatedProducts);
  };

  const saveInvoice = async () => {
    if (cartProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the invoice.');
      return null;
    }

    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return null;
    }

    setLoading(true);
    try {
      let finalOrderId = savedOrderId;
      let isNewOrder = !finalOrderId;

      if (isNewOrder) {
        finalOrderId = await generateOrderId(true);
      }

      const payload = {
        orderId: finalOrderId,
        billingFrom: {
          firmName: billingDetails.billingFrom || '',
          firmAddress: billingDetails.billingFromAddress || '',
          firmGstNumber: billingDetails.billingFromGSTIN || '',
        },
        billingTo: {
          firmName: billingDetails.billTo || '',
          firmAddress: billingDetails.billToAddress || '',
          firmGstNumber: billingDetails.billToGSTIN || '',
        },
        billingDetails: {
          billingDate: billingDetails.date || new Date().toISOString(),
          billingDueDate: billingDetails.duedate || new Date().toISOString(),
        },
        items: cartProducts.map(item => ({
          itemName: item.name,
          quantity: item.quantity,
          rate: item.price,
        })),
        discountPercentage: mode === 'percent' ? parseFloat(value) || 0 : 0,
        discountAmount: mode === 'rupees' ? parseFloat(value) || 0 : 0,
        totalAmount: adjustedTotalPrice,
        dueAmount: dueAmount,
      };

      let endpoint = `${NODE_API_ENDPOINT}/custom-orders`;
      let method = 'POST';
      if (!isNewOrder) {
        endpoint = `${NODE_API_ENDPOINT}/custom-orders/${finalOrderId}`;
        method = 'PATCH';
      }

      console.log(`${method} invoice at:`, endpoint);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const saveResponse = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (saveResponse.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('LoginScreen');
        return null;
      }

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        if (isNewOrder) {
          try {
            const key = 'invoice_counter';
            let counter = parseInt(
              (await AsyncStorage.getItem(key)) || '0',
              10,
            );
            if (counter > 0) {
              await AsyncStorage.setItem(key, (counter - 1).toString());
              console.log(`Reverted counter to: ${counter - 1}`);
            }
          } catch (revertError) {
            console.error('Error reverting counter:', revertError);
          }
        }
        throw new Error(
          `Failed to save invoice: ${saveResponse.status} ${errorText}`,
        );
      }

      const saveData = await saveResponse.json();
      const mongoOrderId = saveData.order._id; // MongoDB _id
      setTestOrderId(mongoOrderId);
      console.log('MongoDB _id:', mongoOrderId);
      console.log('Save response:', JSON.stringify(saveData, null, 2));
      const newOrderId = finalOrderId;
      setSavedOrderId(newOrderId);

      return { orderId: newOrderId, testOrderId: mongoOrderId };
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', `Failed to save invoice: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    const result = await saveInvoice();
    if (!result) return;

    const { orderId, testOrderId } = result;

    try {
      let lastDueAmount = dueAmount;
      let lastStatus = 'active';
      const newPayments = [];

      // Create payments if any
      for (const payment of paymentDetails.payments || []) {
        const amount = payment.amount;
        const paymentPayload = {
          orderId: testOrderId,
          amount,
          paymentMethod: payment.modeOfPayment,
          paymentReference: `TXN-${Date.now()}`,
          paymentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          notes: lastDueAmount === 0 ? 'complete' : 'active',
          receivedBy: currentUser?._id || 'unknown',
          receivedByType: currentUser?.role || 'unknown',
        };

        const paymentEndpoint = `${NODE_API_ENDPOINT}/custom-orders/payment`;
        console.log('Creating payment at:', paymentEndpoint);
        console.log('Payment payload:', JSON.stringify(paymentPayload, null, 2));

        const paymentResponse = await fetch(paymentEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentPayload),
        });

        const paymentResponseText = await paymentResponse.text();
        let paymentResponseData;

        if (paymentResponse.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('LoginScreen');
          return;
        }

        if (!paymentResponse.ok) {
          try {
            paymentResponseData = JSON.parse(paymentResponseText);
            throw new Error(
              paymentResponseData.error ||
                paymentResponseData.message ||
                'Unknown error',
            );
          } catch {
            throw new Error(
              `Failed to create payment: ${paymentResponse.status} ${paymentResponseText}`,
            );
          }
        }

        try {
          paymentResponseData = JSON.parse(paymentResponseText);
          console.log(
            'Payment response:',
            JSON.stringify(paymentResponseData, null, 2),
          );
        } catch {
          throw new Error(`Invalid payment response: ${paymentResponseText}`);
        }

        if (!paymentResponseData.customOrderPaymentStatus) {
          throw new Error('Missing payment status in response');
        }

        lastDueAmount = paymentResponseData.customOrderPaymentStatus.dueAmount;
        lastStatus = lastDueAmount === 0 ? 'complete' : 'active';

        newPayments.push({
          amount,
          paymentMethod: payment.modeOfPayment,
          paymentReference: paymentPayload.paymentReference,
          paymentDate: paymentPayload.paymentDate,
          notes: paymentPayload.notes,
          receivedBy: paymentPayload.receivedBy,
          receivedByType: paymentPayload.receivedByType,
        });
      }

      const finalPaymentDetails = {
        totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
        dueAmount: lastDueAmount.toLocaleString('en-IN'),
        payments: paymentDetails.payments || [],
      };

      // Clear state and Redux
      setCartProducts([]);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemQuantity('1');
      setValue('0');
      setMode('percent');
      setGstValue('0');
      setDueAmount(0);
      setSavedOrderId(null);
      setTestOrderId(null);
      dispatch(setPaymentDetails({ totalAmount: '0', dueAmount: '0', payments: [] }));

      Alert.alert('Success', `Invoice ${invoiceNumber} saved successfully`);

      navigation.navigate('InvoiceUpdated', {
        invoiceStatus: lastStatus,
        orderId,
        testOrderId,
        invoiceNumber,
        billingDetails,
        paymentDetails: finalPaymentDetails,
        paymentHistory: [...paymentHistory, ...newPayments],
        cartProducts: [],
        discountValue: '0',
        discountMode: 'percent',
        gstValue: '0',}
      );
    } catch (error) {
      console.error('Error processing payments:', error);
      Alert.alert('Error', `Failed to process payments: ${error.message}`);
    }
  };

  const handlePaymentDetails = () => {
    if (cartProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one item before adding payment details.');
      return;
    }

    console.log('Navigating to InvoicePaymentScreen with orderId:', savedOrderId, 'testOrderId:', testOrderId);
    navigation.navigate('InvoicePaymentScreen', {
      invoiceStatus,
      orderId: savedOrderId,
      testOrderId,
      invoiceNumber,
      billingDetails,
      paymentDetails: {
        totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
        dueAmount: dueAmount.toLocaleString('en-IN'),
        payments: paymentDetails.payments || [],
      },
      paymentHistory,
      cartProducts,
      discountValue: value,
      discountMode: mode,
      gstValue,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBDBB5] pb-2">
      <View
        className="bg-[#292C33] px-4 pt-10"
        style={{
          flex: 1,
          justifyContent: 'center',
          height: headerHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#FBDBB5] justify-center items-center"
          >
            <Icon name="arrow-left" size={20} color="#FBDBB5" />
          </TouchableOpacity>
          <View className="flex-1 items-end -ml-4">
            <Text className="text-sm text-[#FBDBB5]">Invoice ID:</Text>
            <Text className="text-base font-bold text-[#FBDBB5]">
              {invoiceNumber}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 mb-2">
        <View style={{ paddingTop: headerHeight + verticalScale(10) }}>
          <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-4 mx-4">
            <Text style={styles.label}>Add Item:</Text>
            <TextInput
              style={styles.input}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Item Name"
              placeholderTextColor="#FFF"
            />
            <View
              className="flex-row justify-between gap-2"
              style={{ paddingRight: scale(6) }}
            >
              <TextInput
                style={styles.input2}
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                placeholder="Quantity"
                placeholderTextColor="#FFF"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input2}
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                placeholder="Price"
                placeholderTextColor="#FFF"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              className="bg-[#292C33] rounded-lg items-center mt-2"
              style={{ width: scale(320), paddingVertical: 12 }}
              onPress={handleAddItem}
            >
              <Text className="text-white font-medium">Add Item</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between mx-4">
            <Text
              style={{ fontSize, width: '25%' }}
              className="text-white font-semibold"
            >
              Item Name
            </Text>
            <Text
              style={{ fontSize, width: '15%' }}
              className="text-white font-semibold text-center"
            >
              Quantity
            </Text>
            <Text
              style={{ fontSize, width: '25%' }}
              className="text-white font-semibold text-center"
            >
              Rate
            </Text>
            <Text
              style={{ fontSize, width: '25%' }}
              className="text-white font-semibold text-center"
            >
              Amount
            </Text>
            <Text
              style={{ fontSize, width: '10%' }}
              className="text-white font-semibold text-center"
            >
              Action
            </Text>
          </View>

          <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mx-4 mb-6">
            <ScrollView
              style={{ maxHeight: tableMaxHeight }}
              showsVerticalScrollIndicator={true}
            >
              {cartProducts.length === 0 ? (
                <Text className="text-white text-center py-4">
                  No items added
                </Text>
              ) : (
                cartProducts.map((item, index) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between mb-3 py-1"
                  >
                    <Text
                      style={{ fontSize, width: '25%' }}
                      className="text-white text-wrap"
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{ fontSize, width: '15%' }}
                      className="text-white text-center"
                    >
                      {item.quantity}
                    </Text>
                    <View style={{ width: '25%' }} className="px-1">
                      <TextInput
                        style={{ fontSize }}
                        className="border border-white rounded-md px-2 py-1 text-white text-center"
                        value={item.price.toString()}
                        onChangeText={text => handlePriceChange(index, text)}
                        keyboardType="numeric"
                      />
                    </View>
                    <Text
                      style={{ fontSize, width: '25%' }}
                      className="text-white text-center"
                    >
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={{ width: '10%' }}
                      className="items-center"
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Icon name="trash-2" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View className="bg-[#FBDBB5] px-4">
            <View
              className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 mb-2"
              style={{ height: verticalScale(40) }}
            >
              <View className="flex-1">
                <Text className="text-sm text-[#E7CBA1] font-medium">
                  Discount:
                </Text>
              </View>
              <View className="flex-1 flex-row bg-[#FBDBB5] rounded-md mr-2">
                <TouchableOpacity
                  onPress={() => setMode('percent')}
                  className={`flex-1 items-center justify-center rounded-md px-4 py-3 ${
                    mode === 'percent' ? 'bg-[#DB9245]' : ''
                  }`}
                >
                  <Text className="text-sm font-medium text-black">%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode('rupees')}
                  className={`flex-1 items-center justify-center px-4 rounded-md ${
                    mode === 'rupees' ? 'bg-[#DB9245]' : ''
                  }`}
                >
                  <Text className="text-sm font-medium text-black">₹</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center bg-[#FAD9B3] rounded-md w-[45%] px-4 h-[100%]">
                {mode === 'rupees' && (
                  <Text className="text-xs text-[#292C33] font-medium">₹</Text>
                )}
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="0"
                  placeholderTextColor="black"
                  keyboardType="numeric"
                  className="text-[#000000] text-sm font-medium flex-1 text-right leading-[0.55rem]"
                  style={{ minWidth: 40 }}
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
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>

            <View
              className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 mb-2"
              style={{ height: verticalScale(40) }}
            >
              <View className="flex-1">
                <Text className="text-sm text-[#E7CBA1] font-medium">
                  GST Percentage:
                </Text>
              </View>
              <View className="flex-row items-center bg-[#FAD9B3] rounded-md px-3 w-[45%] h-[100%]">
                <TextInput
                  value={gstValue}
                  onChangeText={setGstValue}
                  placeholder="0"
                  placeholderTextColor="#000000"
                  keyboardType="numeric"
                  className="text-[#000000] text-sm font-medium text-right min-w-[40px] flex-1 leading-[0.55rem]"
                />
                <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>
                <Icon
                  name="edit-2"
                  size={14}
                  color="#C7742D"
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
              <View className="bg-[#292C33] px-5 py-4">
                <Text className="text-white font-semibold">Due Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹ {dueAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
              <View className="bg-[#292C33] px-4 py-4">
                <Text className="text-white font-semibold">Total Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹ {adjustedTotalPrice.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-[#FBDBB5] px-4 py-2">
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center border bg-[#292C33]"
                onPress={handlePaymentDetails}
                disabled={!cartProducts.length}
              >
                <Text className="font-bold text-center text-white py-2">
                  Payment Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center border border-[#DB9245] bg-[#DB9245]"
                onPress={handleConfirmOrder}
                disabled={loading || !cartProducts.length}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-center">
                    {invoiceStatus === 'new' ? 'Save Invoice' : 'Update Invoice'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    width: scale(320),
    backgroundColor: '#292C33',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  input2: {
    width: scale(155),
    backgroundColor: '#292C33',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default InvoiceItemsScreen;