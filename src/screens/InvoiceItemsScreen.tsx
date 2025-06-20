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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NODE_API_ENDPOINT } from '../utils/util';
import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import {
  setItems,
  setOrderId,
  setLoading,
  setError,
  setDiscountPercentage,
  setDiscountAmount,
  setDiscountMode,
  setGstPercentage,
  setPaymentDetails,
  resetInvoice,
} from '../redux/customInvoiceSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isEqual from 'lodash/isEqual';

type Item = {
  id: string;
  itemName: string;
  quantity: number;
  rate: number;
};

type InvoiceItemsProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoiceItemsScreen'
>;

const InvoiceItemsScreen = ({ navigation, route }: InvoiceItemsProps) => {
  const dispatch = useDispatch();
  const {
    invoiceNumber,
    billingFrom,
    billingTo,
    billingDetails,
    items,
    discountPercentage,
    discountAmount,
    discountMode,
    gstPercentage,
    paymentDetails,
    loading,
    error,
    orderId: savedOrderId,
  } = useSelector((state: RootState) => state.customInvoice);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemRate, setNewItemRate] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [testOrderId, setTestOrderId] = useState<string | null>(
    route.params?.testOrderId || null
  );
  const invoiceStatus = route.params?.invoiceStatus || 'new';

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

  // Initialize items from Redux
  useEffect(() => {
    if (route.params?.orderId && route.params?.orderId !== savedOrderId) {
      // Load existing invoice if orderId is provided
      dispatch(setOrderId(route.params.orderId));
      // Assume API call or Redux hydration sets items, billing, etc.
    }
  }, [dispatch, route.params?.orderId, savedOrderId]);

  // Calculate paymentDetails
  useEffect(() => {
    const baseTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const discount =
      discountMode === 'percent'
        ? (baseTotal * discountPercentage) / 100
        : discountAmount;
    const discountedTotal = baseTotal - discount;
    const gstAmount = (discountedTotal * gstPercentage) / 100;
    const totalAmount = discountedTotal + gstAmount;
    const paidAmount =
      paymentDetails?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const dueAmount = totalAmount - paidAmount;

    const newPaymentDetails = {
      totalAmount: totalAmount.toLocaleString('en-IN'),
      dueAmount: dueAmount.toLocaleString('en-IN'),
      payments: paymentDetails?.payments || [],
    };

    if (!isEqual(newPaymentDetails, paymentDetails)) {
      dispatch(setPaymentDetails(newPaymentDetails));
    }
  }, [
    dispatch,
    items,
    discountPercentage,
    discountAmount,
    discountMode,
    gstPercentage,
    paymentDetails,
  ]);

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
      const letter = String.fromCharCode(65 + Math.floor(counter / 100000));
      const number = (counter % 100000).toString().padStart(5, '0');
      const orderId = `${letter}${number}`;
      if (!/^[A-Z]\d{5}$/.test(orderId)) {
        throw new Error(`Invalid order ID format: ${orderId}`);
      }
      console.log(`Generated orderId: ${orderId} (counter: ${counter})`);
      return orderId;
    } catch (error: any) {
      console.error('Error generating order ID:', error);
      throw new Error(`Failed to generate order ID: ${error.message}`);
    }
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemRate || !newItemQuantity) {
      Alert.alert('Error', 'Please fill in all item details');
      return;
    }

    const quantity = parseInt(newItemQuantity, 10) || 1;
    const rate = parseFloat(newItemRate) || 0;
    if (quantity <= 0 || rate <= 0) {
      Alert.alert('Error', 'Quantity and rate must be positive.');
      return;
    }

    const newItem: Item = {
      id: `temp-${Date.now()}`,
      itemName: newItemName,
      quantity,
      rate,
    };

    dispatch(setItems([...items, newItem]));
    setNewItemName('');
    setNewItemRate('');
    setNewItemQuantity('1');
  };

  const calculateItemTotal = (item: Item) => {
    const baseTotal = item.rate * item.quantity;
    const discount =
      discountMode === 'percent'
        ? (baseTotal * discountPercentage) / 100
        : discountAmount / (items.length || 1);
    const discountedTotal = baseTotal - discount;
    const gstAmount = (discountedTotal * gstPercentage) / 100;
    return discountedTotal + gstAmount;
  };

  const baseTotalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  }, [items]);

  const discount = useMemo(() => {
    if (discountMode === 'percent') {
      return (baseTotalPrice * discountPercentage) / 100;
    }
    return discountAmount;
  }, [baseTotalPrice, discountPercentage, discountAmount, discountMode]);

  const gstAmount = useMemo(() => {
    return ((baseTotalPrice - discount) * gstPercentage) / 100;
  }, [baseTotalPrice, discount, gstPercentage]);

  const adjustedTotalPrice = useMemo(() => {
    return baseTotalPrice - discount + gstAmount;
  }, [baseTotalPrice, discount, gstAmount]);

  const handleRemoveItem = (index: number) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          dispatch(setItems(items.filter((_, i) => i !== index)));
        },
      },
    ]);
  };

  const handlePriceChange = (index: number, newRate: string) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      rate: parseFloat(newRate) || 0,
    };
    dispatch(setItems(updatedItems));
  };

  const saveInvoice = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item.');
      return null;
    }

    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return null;
    }

    dispatch(setLoading(true));
    try {
      let finalOrderId = savedOrderId;
      let isNewOrder = !finalOrderId;

      if (isNewOrder) {
        finalOrderId = await generateOrderId(true);
      }

      const payload = {
        billingFrom,
        billingTo,
        billingDetails,
        items: items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.rate,
        })),
        gstPercentage:gstPercentage,
        ...(discountMode === 'percent' ? { discountPercentage } : { discountAmount }),
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
            let counter = parseInt((await AsyncStorage.getItem(key)) || '0', 10);
            if (counter > 0) {
              await AsyncStorage.setItem(key, (counter - 1).toString());
              console.log(`Reverted counter to: ${counter - 1}`);
            }
          } catch (revertError) {
            console.error('Error reverting counter:', revertError);
          }
        }
        throw new Error(`Failed to save invoice: ${saveResponse.status} ${errorText}`);
      }

      const saveData = await saveResponse.json();
      const mongoOrderId = saveData.order._id;
      setTestOrderId(mongoOrderId);
      console.log('MongoDB _id:', mongoOrderId);
      console.log('Save response:', JSON.stringify(saveData, null, 2));

      dispatch(setOrderId(finalOrderId));
      dispatch(setItems(payload.items));

      return { orderId: finalOrderId, testOrderId: mongoOrderId };
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      dispatch(setError(error.message || 'Failed to save invoice'));
      Alert.alert('Error', `Failed to save invoice: ${error.message}`);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleConfirmOrder = async () => {
    const result = await saveInvoice();
    if (!result) return;

    const { orderId, testOrderId } = result;

    try {
      let lastDueAmount =
        adjustedTotalPrice -
        (paymentDetails?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);
      let lastStatus = lastDueAmount === 0 ? 'complete' : 'active';
      const newPayments = [];

      for (const payment of paymentDetails?.payments || []) {
        const amount = payment.amount;
        const paymentPayload = {
          orderId: testOrderId,
          amount,
          paymentMethod: payment.paymentMethod, // Updated from modeOfPayment
          paymentReference: `TXN-${Date.now()}`,
          paymentDate: new Date().toISOString().split('T')[0],
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
        let  paymentResponseData1 = JSON.parse(paymentResponseText);
        console.log(
          '✅ Payment response:',
          JSON.stringify(paymentResponseData1, null, 2)
        );
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
              paymentResponseData.error || paymentResponseData.message || 'Unknown error'
            );
          } catch {
            throw new Error(
              `Failed to create payment: ${paymentResponse.status} ${paymentResponseText}`
            );
          }
        }

        try {
          paymentResponseData = JSON.parse(paymentResponseText);
          console.log(
            'Payment response:',
            JSON.stringify(paymentResponseData, null, 2)
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
          paymentMethod: payment.paymentMethod, // Updated from modeOfPayment
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
        payments: paymentDetails?.payments || [],
      };

      dispatch(resetInvoice());

      Alert.alert(
        'Success',
        `Invoice ${invoiceNumber || 'INV-2025-001'} saved successfully`
      );

      navigation.navigate('InvoiceUpdated', {
        invoiceStatus: lastStatus,
        orderId,
        testOrderId,
        invoiceNumber: invoiceNumber || `INV-${orderId}`,
        billingDetails: billingDetails || {},
        paymentDetails: finalPaymentDetails,
        paymentHistory: [...(paymentDetails?.payments || []), ...newPayments],
        cartProducts: [],
        discountValue: '0',
        discountMode: 'percent',
        gstValue: '0',
      });
    } catch (error: any) {
      console.error('Error processing payments:', error);
      dispatch(setError(error.message || 'Failed to process payments'));
      Alert.alert('Error', `Failed to process payments: ${error.message}`);
    }
  };

  const handlePaymentDetails = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item before adding payment details.');
      return;
    }

    console.log(
      'Navigating to InvoicePaymentScreen with orderId:',
      savedOrderId,
      'testOrderId:',
      testOrderId
    );
    navigation.navigate('InvoicePaymentScreen', {
      invoiceStatus,
      orderId: savedOrderId,
      testOrderId,
      invoiceNumber: invoiceNumber || 'INV-2025-001',
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
              {invoiceNumber || 'INV-2025-001'}
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
                value={newItemRate}
                onChangeText={setNewItemRate}
                placeholder="Rate"
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
              {items.length === 0 ? (
                <Text className="text-white text-center py-4">No items added</Text>
              ) : (
                items.map((item, index) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between mb-3 py-1"
                  >
                    <Text
                      style={{ fontSize, width: '25%' }}
                      className="text-white text-wrap"
                    >
                      {item.itemName}
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
                        value={item.rate.toString()}
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
                      onPress={() => handleRemoveItem(index)}
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
                <Text className="text-sm text-[#E7CBA1] font-medium">Discount:</Text>
              </View>
              <View className="flex-1 flex-row bg-[#FBDBB5] rounded-md mr-2">
                <TouchableOpacity
                  onPress={() => dispatch(setDiscountMode('percent'))}
                  className={`flex-1 items-center justify-center rounded-md px-4 py-3 ${
                    discountMode === 'percent' ? 'bg-[#DB9245]' : ''
                  }`}
                >
                  <Text className="text-sm font-medium text-black">%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dispatch(setDiscountMode('rupees'))}
                  className={`flex-1 items-center justify-center px-4 rounded-md ${
                    discountMode === 'rupees' ? 'bg-[#DB9245]' : ''
                  }`}
                >
                  <Text className="text-sm font-medium text-black">₹</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center bg-[#FAD9B3] rounded-md w-[45%] px-4 h-[100%]">
                {discountMode === 'rupees' && (
                  <Text className="text-xs text-[#292C33] font-medium">₹</Text>
                )}
                <TextInput
                  value={
                    discountMode === 'percent'
                      ? discountPercentage.toString()
                      : discountAmount.toString()
                  }
                  onChangeText={text =>
                    dispatch(
                      discountMode === 'percent'
                        ? setDiscountPercentage(parseFloat(text) || 0)
                        : setDiscountAmount(parseFloat(text) || 0)
                    )
                  }
                  placeholder="0"
                  placeholderTextColor="black"
                  keyboardType="numeric"
                  className="text-[#000000] text-sm font-medium flex-1 text-right leading-[0.55rem]"
                  style={{ minWidth: 40 }}
                />
                {discountMode === 'percent' && (
                  <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>
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
                  value={gstPercentage.toString()}
                  onChangeText={text =>
                    dispatch(setGstPercentage(parseFloat(text) || 0))
                  }
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
              <View className="bg-[#292C33] px-5 py-5">
                <Text className="text-white font-semibold">Due Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹{' '}
                  {(
                    adjustedTotalPrice -
                    (paymentDetails?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0)
                  ).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
              <View className="bg-[#292C33] px-4 py-5">
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
                disabled={!items.length}
              >
                <Text className="font-bold text-center text-white py-2">
                  Payment Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center border border-[#DB9245] bg-[#DB9245]"
                onPress={handleConfirmOrder}
                disabled={loading || !items.length}
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