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
import RNFetchBlob from 'rn-fetch-blob';

type Item = {
  id: string;
  itemName: string;
  quantity: number;
  rate: number;
};

type ActiveInvoiceItemsProps = NativeStackScreenProps<
  AccountStackParamList,
  'ActiveInvoiceItems'
>;

const ActiveInvoiceItemScreen = ({ navigation, route }: ActiveInvoiceItemsProps) => {
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

  const { invoice } = route.params; // Invoice data passed from PreviousInvoiceScreen
  const [newItemName, setNewItemName] = useState<string>('');
  const [downloading,setDownloading] =useState(false);
  const [newItemRate, setNewItemRate] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [testOrderId, setTestOrderId] = useState<string | null>(invoice._id);

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

  // Calculate if invoice is completed
  const totalPaidAmount = invoice.payments.reduce(
    (sum: number, payment: { amount: number }) => sum + (payment.amount || 0),
    0,
  );
  const isCompleted = totalPaidAmount >= invoice.totalAmount;

  // Initialize items from Redux or invoice data
  useEffect(() => {
    // Set orderId from invoice data
    dispatch(setOrderId(invoice._id));

    // Initialize items if not already set in Redux
    if (!items.length) {
      const invoiceItems = invoice.items.map((item: any) => ({
        id: item._id,
        itemName: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
      }));
      dispatch(setItems(invoiceItems));
    }

    // Initialize payment details
    const initialPaymentDetails = {
      totalAmount: invoice.totalAmount.toLocaleString('en-IN'),
      dueAmount: invoice.dueAmount.toLocaleString('en-IN'),
      payments: invoice.payments.map((payment: any) => ({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      })),
    };
    dispatch(setPaymentDetails(initialPaymentDetails));

    // Initialize discount and GST only if not already set
    if (discountPercentage === 0 && discountAmount === 0) {
      dispatch(setDiscountPercentage(invoice.discountPercentage || 0));
      dispatch(setDiscountAmount(invoice.discountAmount || 0));
      dispatch(setDiscountMode(invoice.discountPercentage ? 'percent' : 'rupees'));
    }
    if (gstPercentage === 0) {
      dispatch(setGstPercentage(invoice.gstPercentage || 0));
    }
  }, [dispatch, invoice, items.length, discountPercentage, discountAmount, gstPercentage]);

  // Calculate paymentDetails whenever items, discount, or GST changes
  useEffect(() => {
    const baseTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0,
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

  const handleAddItem = () => {
    if (isCompleted) return; // Prevent adding items if invoice is complete

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
    if (isCompleted) return; // Prevent removing items if invoice is complete

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

  const fetchUpdatedInvoice = async () => {
    try {
      const res = await fetch(`${NODE_API_ENDPOINT}/custom-orders/${invoice._id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch updated invoice: ${res.status}`);
      }
      const updatedInvoice = await res.json();

      // Update relevant Redux states with new values
      dispatch(setDiscountPercentage(updatedInvoice.discountPercentage || 0));
      dispatch(setDiscountAmount(updatedInvoice.discountAmount || 0));
      dispatch(setDiscountMode(updatedInvoice.discountPercentage ? 'percent' : 'rupees'));
      dispatch(setGstPercentage(updatedInvoice.gstPercentage || 0));

      const invoiceItems = updatedInvoice.items.map((item: any) => ({
        id: item._id,
        itemName: item.itemName,
        quantity: item.quantity,
        rate: item.rate,
      }));
      dispatch(setItems(invoiceItems));

      const newPaymentDetails = {
        totalAmount: updatedInvoice.totalAmount.toLocaleString('en-IN'),
        dueAmount: updatedInvoice.dueAmount.toLocaleString('en-IN'),
        payments: updatedInvoice.payments.map((payment: any) => ({
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
        })),
      };
      dispatch(setPaymentDetails(newPaymentDetails));
    } catch (err) {
      // console.error('Failed to refetch updated invoice', err);
      // Alert.alert('Error', 'Failed to fetch updated invoice data');
    }
  };

  const handlePriceChange = (index: number, newRate: string) => {
    if (isCompleted) return; // Prevent editing prices if invoice is complete

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      rate: parseFloat(newRate) || 0,
    };
    dispatch(setItems(updatedItems));
  };

  const handleDiscountModeChange = (mode: 'percent' | 'rupees') => {
    if (isCompleted) return;
    dispatch(setDiscountMode(mode));
    // Reset the other discount value when switching modes
    if (mode === 'percent') {
      dispatch(setDiscountAmount(0));
    } else {
      dispatch(setDiscountPercentage(0));
    }
  };

  const handleSaveInvoice = async () => {
    if (isCompleted || loading) return;

    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item.');
      return;
    }

    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return;
    }

    dispatch(setLoading(true));
    try {
      const payload = {
        billingFrom,
        billingTo,
        billingDetails,
        items: items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.rate,
        })),
        discountPercentage: discountMode === 'percent' ? discountPercentage : 0,
        discountAmount: discountMode === 'rupees' ? discountAmount : 0,
        gstPercentage: gstPercentage || 0,
      };

      const endpoint = `${NODE_API_ENDPOINT}/custom-orders/${invoice._id}`;
      const saveResponse = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (saveResponse.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to update invoice: ${saveResponse.status} ${errorText}`);
      }

      Alert.alert('Success', 'Invoice updated successfully');
      await fetchUpdatedInvoice(); // Fetch updated invoice to refresh Redux state
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      dispatch(setError(error.message || 'Failed to update invoice'));
      Alert.alert('Error', `Failed to update invoice: ${error.message}`);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDownloadInvoice = async () => {
    if (downloading) return;
  
    // Check for storage permission on Android
    if (Platform.OS === 'android') {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download invoices',
        );
        return;
      }
    }
  
    setDownloading(true);
  
    try {
      // Get the invoice ID
      const invoiceId = invoice?._id;
  
      // Set download path based on platform
      const { dirs } = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
  
      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `invoice_${invoiceId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;
  
      const apiUrl = `${NODE_API_ENDPOINT}/custom-orders/${invoiceId}`;
      console.log(`Downloading invoice from: ${apiUrl}`);
  
      // For Android, check if the directory exists
      if (Platform.OS === 'android') {
        const exists = await RNFetchBlob.fs.exists(dirPath);
        if (!exists) {
          await RNFetchBlob.fs.mkdir(dirPath);
        }
      }
  
      // Configure download with notification for Android
      const downloadConfig =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: filePath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: 'Invoice Downloaded',
                description: 'Your invoice has been downloaded successfully',
                mime: 'application/pdf',
                mediaScannable: true,
                path: filePath,
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };
  
      // Download the file
      const res = await RNFetchBlob.config(downloadConfig).fetch(
        'GET',
        apiUrl,
        {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      );
  
      // Check response info
      console.log('Response info:', res.info());
  
      // Check if the file exists and has content
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File does not exist after download');
      }
  
      const fileSize = await RNFetchBlob.fs
        .stat(filePath)
        .then(stats => stats.size);
      console.log(`File exists: ${fileExists}, size: ${fileSize}B`);
  
      if (fileSize <= 0) {
        throw new Error('Downloaded file is empty (0B)');
      }
  
      // Show success message
      Alert.alert('Success', 'Invoice downloaded successfully');
  
      // Open the PDF
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        // For Android, use action view intent
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
  
      // Handle specific error cases
      if (error.message.includes('401')) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', `Failed to download invoice: ${error.message}`);
      }
    } finally {
      setDownloading(false);
    }
  };
  const handlePaymentDetails = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item before adding payment details.');
      return;
    }

    navigation.navigate('ActiveInvoicePaymentScreen', {
      invoice,
      orderId: invoice._id,
      testOrderId: invoice._id,
      invoiceNumber: invoice._id,
      invoiceStatus: isCompleted ? 'complete' : 'active',
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
              {invoice._id}
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
              editable={!isCompleted}
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
                editable={!isCompleted}
              />
              <TextInput
                style={styles.input2}
                value={newItemRate}
                onChangeText={setNewItemRate}
                placeholder="Rate"
                placeholderTextColor="#FFF"
                keyboardType="numeric"
                editable={!isCompleted}
              />
            </View>
            <TouchableOpacity
              className="bg-[#292C33] rounded-lg items-center mt-2"
              style={{ width: scale(320), paddingVertical: 12 }}
              onPress={handleAddItem}
              disabled={isCompleted}
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
                        editable={!isCompleted}
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
                      disabled={isCompleted}
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
                  disabled={isCompleted}
                >
                  <Text className="text-sm font-medium text-black">%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => dispatch(setDiscountMode('rupees'))}
                  className={`flex-1 items-center justify-center px-4 rounded-md ${
                    discountMode === 'rupees' ? 'bg-[#DB9245]' : ''
                  }`}
                  disabled={isCompleted}
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
                  editable={!isCompleted}
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
                  editable={!isCompleted}
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
                disabled={ !items.length}
              >
                <Text className="font-bold text-center text-white py-2">
                  Payment Details
                </Text>
              </TouchableOpacity>

              {isCompleted ? (
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center justify-center border border-[#DB9245] bg-[#DB9245]"
                  onPress={handleDownloadInvoice}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-center">
                      Download Invoice
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center justify-center border border-[#DB9245] bg-[#DB9245]"
                  onPress={handleSaveInvoice}
                  disabled={loading || !items.length}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-center">
                      Update Invoice
                    </Text>
                  )}
                </TouchableOpacity>
              )}
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

export default ActiveInvoiceItemScreen;