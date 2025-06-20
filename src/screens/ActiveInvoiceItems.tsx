/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NODE_API_ENDPOINT } from '../utils/util';
import {
  setPaymentDetails,
  setItems,
  setOrderId,
  setDiscountPercentage,
  setDiscountAmount,
  setDiscountMode,
  setGstPercentage,
} from '../redux/customInvoiceSlice';
import { scale, verticalScale } from '../utils/scaling';
import RNFetchBlob from 'rn-fetch-blob';

type ActiveInvoiceItemsProps = NativeStackScreenProps<
  AccountStackParamList,
  'ActiveInvoiceItems'
>;

type Item = {
  id: string;
  itemName: string;
  quantity: number;
  rate: number;
};

const ActiveInvoiceItemScreen = ({ navigation, route }: ActiveInvoiceItemsProps) => {
  const dispatch = useDispatch();
  const { invoice } = route.params;
  const {
    paymentDetails,
    items,
    discountPercentage,
    discountAmount,
    discountMode,
    gstPercentage,
  } = useSelector((state: RootState) => state.customInvoice);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [updatedDueAmount, setUpdatedDueAmount] = useState(invoice.dueAmount || 0);
  const [paymentsProcessed, setPaymentsProcessed] = useState(false);

  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const headerHeight = height * 0.15;
  const fontSize = isSmallDevice ? 10 : 12;
  const tableMaxHeight = height * 0.35;
  const [downloading, setDownloading] = useState(false);

  // Initialize invoice details from route params
  useEffect(() => {
    console.log('Initializing invoice:', invoice);
    dispatch(setPaymentDetails({
      totalAmount: invoice.totalAmount,
      dueAmount: invoice.dueAmount,
      payments: invoice.payments || [],
    }));
    dispatch(setItems(invoice.items.map((item: any) => ({
      id: item._id,
      itemName: item.itemName,
      quantity: item.quantity,
      rate: item.rate,
    }))));
    dispatch(setOrderId(invoice._id));
    dispatch(setDiscountPercentage(invoice.discountPercentage || 0));
    dispatch(setDiscountAmount(invoice.discountAmount || 0));
    dispatch(setDiscountMode(invoice.discountPercentage > 0 ? 'percent' : 'rupees'));
    dispatch(setGstPercentage(invoice.gstPercentage || 0));
    setUpdatedDueAmount(invoice.dueAmount);
  }, [dispatch, invoice]);

  
  // Update due amount when paymentDetails change
  useEffect(() => {
    if (paymentDetails) {
      setUpdatedDueAmount(paymentDetails.dueAmount);
    }
  }, [paymentDetails]);

  const calculateItemTotal = (item: Item) => {
    return item.rate * item.quantity;
  };

  const baseTotalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  }, [items]);

  const adjustedTotalPrice = useMemo(() => {
    let total = baseTotalPrice;
    const discount = discountMode === 'percent' ? (total * discountPercentage) / 100 : discountAmount;
    total -= discount;
    total += (total * gstPercentage) / 100;
    return total;
  }, [baseTotalPrice, discountPercentage, discountAmount, discountMode, gstPercentage]);

  const handleUpdatePayment = async () => {
    console.log('Download Invoice clicked', { items, loading, paymentDetails });
    if (!items.length) {
      ToastAndroid.show('No items in invoice.', ToastAndroid.SHORT);
      return;
    }
    if (!paymentDetails?.payments?.length) {
      ToastAndroid.show('No payments to process.', ToastAndroid.SHORT);
      return;
    }
    if (!currentUser?.token) {
      ToastAndroid.show('User not authenticated. Please log in.', ToastAndroid.SHORT);
      navigation.navigate('LoginScreen');
      return;
    }

    setLoading(true);
    try {
      const invoiceId = invoice._id;
      const totalAmount = paymentDetails.totalAmount;
      let remainingDueAmount = paymentDetails.dueAmount;
      const newPayments = [];

      const currentTime = new Date();
      const twoMinutesAgo = new Date(currentTime.getTime() - 2 * 60 * 1000); // 2 minutes ago

      const sortedPayments = [...paymentDetails.payments].sort((a, b) => b.amount - a.amount);
      console.log('Sorted Payments:', sortedPayments);

      for (const payment of sortedPayments) {
        const paymentCreatedAt = new Date(payment.createdAt);
        console.log('Checking payment:', payment, 'Created At:', paymentCreatedAt);

        // Skip payments older than 2 minutes or without a valid createdAt
        if (!payment.createdAt || paymentCreatedAt < twoMinutesAgo) {
          console.log('Skipping payment: older than 2 minutes or invalid createdAt', payment);
          continue;
        }

        // Skip already processed payments
        if (payment._id && !payment._id.startsWith('temp-')) {
          console.log('Skipping payment with non-temp _id:', payment._id);
          continue;
        }

        // Validate payment amount
        if (payment.amount <= 0) {
          console.log('Skipping invalid payment amount:', payment.amount);
          ToastAndroid.show('Invalid payment amount detected.', ToastAndroid.SHORT);
          continue;
        }

       

        const paymentPayload = {
          orderId: invoiceId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod || 'unknown',
          paymentReference: `TXN-${Date.now()}`,
          paymentDate: new Date().toISOString(),
          notes: `Payment via ${payment.paymentMethod || 'unknown'}`,
          receivedBy: currentUser?._id || 'unknown',
          receivedByType: currentUser?.role || 'unknown',
        };

        console.log('Sending payment request:', paymentPayload);
        const response = await fetch(`${NODE_API_ENDPOINT}/custom-orders/payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
          body: JSON.stringify(paymentPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorObj;
          try {
            errorObj = JSON.parse(errorText);
          } catch {
            errorObj = { message: errorText };
          }
          console.error('Payment API error:', response.status, errorObj.message);
          ToastAndroid.show(`Failed to process payment: ${errorObj.message}`, ToastAndroid.SHORT);
          continue;
        }

        const paymentData = await response.json();
        console.log('Payment created:', paymentData);
        newPayments.push(paymentData);
        remainingDueAmount -= payment.amount;
      }

      if (newPayments.length > 0) {
        dispatch(setPaymentDetails({
          totalAmount,
          dueAmount: remainingDueAmount,
          payments: [
            ...paymentDetails.payments.filter((p: any) => p._id && !p._id.startsWith('temp-')),
            ...newPayments,
          ],
        }));
        ToastAndroid.show('Recent payments processed successfully', ToastAndroid.SHORT);
        setPaymentsProcessed(true); // Disable touchable elements except Payment Details
      } else {
        ToastAndroid.show('No recent payments to process.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error processing payments:', error.message);
      ToastAndroid.show(`Failed to process payments: ${error.message}`, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (downloading) return;
  
    try {
      setDownloading(true);
  
      if (!invoice._id || !currentUser?.token) {
        throw new Error('Missing invoice ID or user token');
      }
  
      // Check permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download invoices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Cannot download without storage permission.');
          return;
        }
      }
  
      const { dirs } = RNFetchBlob.fs;
      const dirPath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
  
      const timestamp = new Date().getTime();
      const filePath = `${dirPath}/invoice_${invoice._id}_${timestamp}.pdf`;
  
      const apiUrl = `${NODE_API_ENDPOINT}/custom-orders/invoice/${invoice._id}`;
  
      const config = {
        fileCache: true,
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: 'Invoice Downloaded',
          description: 'Your invoice has been downloaded',
          mime: 'application/pdf',
          mediaScannable: true,
          path: filePath,
        },
      };
  
      const res = await RNFetchBlob.config(config).fetch('GET', apiUrl, {
        Authorization: `Bearer ${currentUser.token}`,
      });
  
      const status = res.info().status;
  
      if (status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
  
      if (status !== 200) {
        throw new Error(`Download failed with status ${status}`);
      }
  
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      const fileStats = await RNFetchBlob.fs.stat(filePath);
  
      if (!fileExists || fileStats.size <= 0) {
        throw new Error('File not saved or is empty');
      }
  
      Alert.alert('Success', 'Invoice downloaded successfully.');
  
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      Alert.alert('Error', err.message || 'Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };
  

  const handlePaymentDetails = () => {
    if (!items.length) {
      ToastAndroid.show('No items in invoice.', ToastAndroid.SHORT);
      return;
    }

    navigation.navigate('ActiveInvoicePaymentScreen', {
      invoice,
      totalAmount: paymentDetails?.totalAmount || invoice.totalAmount,
      dueAmount: paymentDetails?.dueAmount || invoice.dueAmount,
      paymentHistory: paymentDetails?.payments.filter((p: any) => p._id && !p._id.startsWith('temp-')) || invoice.payments,
    });
  };

  const totalPaidAmount = invoice.payments.reduce(
    (sum: number, payment: { amount: number }) => sum + (payment.amount || 0),
    0,
  );
  const isCompleted = totalPaidAmount >= invoice.totalAmount;

  return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={paymentsProcessed}>
          <View className="flex-1 px-3 py-2 bg-[#FBDBB5]">
            <View
              className="bg-[#292C33] px-4 pt-10 justify-center"
              style={{
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
                  disabled={paymentsProcessed}
                >
                  <Icon name="arrow-left" size={20} color="#FBDBB5" />
                </TouchableOpacity>
                <View className="flex-1 items-end">
                  <Text className="text-sm text-[#FBDBB5]">Invoice ID:</Text>
                  <Text className="text-base font-bold text-[#FBDBB5]">
                    {invoice._id}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-1 mb-2">
              <View style={{ paddingTop: headerHeight + verticalScale(10) }}>
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
                </View>

                <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mx-4 mb-6">
                  <ScrollView
                    style={{ maxHeight: tableMaxHeight }}
                    showsVerticalScrollIndicator={true}
                    scrollEnabled={!paymentsProcessed}
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
                          <Text
                            style={{ fontSize, width: '25%' }}
                            className="text-white text-center"
                          >
                            ₹{item.rate.toLocaleString('en-IN')}
                          </Text>
                          <Text
                            style={{ fontSize, width: '25%' }}
                            className="text-white text-center"
                          >
                            ₹{calculateItemTotal(item).toLocaleString('en-IN')}
                          </Text>
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
                    <View className="flex-row  flex-1 bg-[#FBDBB5] rounded-md mr-2 w-[6%] h-[100%]">
                      <TouchableOpacity
                        className={`flex-1 items-center justify-center rounded-md px-3 ${
                          discountMode === 'percent' ? 'bg-[#DB9245]' : ''
                        }`}
                        disabled={true}
                      >
                        <Text className="text-sm font-medium text-black">%</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`flex-1 items-center justify-center px-3 rounded-md ${
                          discountMode === 'rupees' ? 'bg-[#DB9245]' : ''
                        }`}
                        disabled={true}
                      >
                        <Text className="text-sm font-medium text-black">₹</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center justify-center bg-[#FAD9B3] rounded-md px-3 w-[45%]">
                      {discountMode === 'rupees' && (
                        <Text className="text-sm text-[#292C33] font-medium">₹</Text>
                      )}
                      <TextInput
                        editable={false}
                        value={
                          discountMode === 'percent'
                            ? discountPercentage.toString()
                            : discountAmount.toString()
                        }
                        placeholder="0"
                        placeholderTextColor="black"
                        keyboardType="numeric"
                        className="text-[#000000] text-sm font-medium flex-1 text-right"
                        style={{ minWidth: 40 }}
                      />
                      {discountMode === 'percent' && (
                        <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>
                      )}
                    </View>
                  </View>

                  <View
                    className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 mb-2"
                    style={{ height: verticalScale(40) }}
                  >
                    <View className="flex-1">
                      <Text className="text-sm text-[#E7CBA1] font-medium">GST Percentage:</Text>
                    </View>
                    <View className="flex-row items-center bg-[#FAD9B3] rounded-md px-3 w-[45%]">
                      <TextInput
                        value={gstPercentage.toString()}
                        editable={false}
                        placeholder="0"
                        placeholderTextColor="#000000"
                        keyboardType="numeric"
                        className="text-[#000000] text-sm font-medium text-right min-w-[40px] flex-1"
                      />
                      <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
                    <View className="bg-[#292C33] px-5 py-5">
                      <Text className="text-white font-semibold">Due Amount</Text>
                    </View>
                    <View className="px-4 py-3 flex-1">
                      <Text className="text-right font-semibold text-base">
                        ₹{updatedDueAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
                    <View className="bg-[#292C33] px-4 py-5">
                      <Text className="text-white font-semibold">Total Amount</Text>
                    </View>
                    <View className="px-4 py-3 flex-1">
                      <Text className="text-right font-semibold text-base">
                        ₹{(paymentDetails?.totalAmount || invoice.totalAmount).toLocaleString('en-IN')}
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
                    {isCompleted ? (
                          <TouchableOpacity
                            className="bg-[#DB9245] rounded-lg py-3  flex-1 justify-center"
                            style={{ height: verticalScale(45) }}
                            onPress={handleDownloadInvoice}
                            disabled={downloading}
                          >
                            <Text className="text-center text-white font-bold text-lg">
                              {downloading ? 'Downloading...' : 'Download Invoice'}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            className="bg-[#DB9245] rounded-lg py-3 flex-1 justify-center"
                            style={{ height: verticalScale(45) }}
                            onPress={handleUpdatePayment}
                            disabled={loading}
                          >
                            <Text className="text-center text-white font-bold text-lg">
                              {loading ? 'Saving...' : 'Save Invoice'}
                            </Text>
                          </TouchableOpacity>
                        )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
  );
};

export default ActiveInvoiceItemScreen;