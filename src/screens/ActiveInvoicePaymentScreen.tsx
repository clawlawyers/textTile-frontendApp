/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { scale, verticalScale } from '../utils/scaling';
import { setPaymentDetails } from '../redux/customInvoiceSlice';
import RNFetchBlob from 'rn-fetch-blob';
import { NODE_API_ENDPOINT } from '../utils/util';

type ActiveInvoicePaymentProps = NativeStackScreenProps<
  AccountStackParamList,
  'ActiveInvoicePaymentScreen'
>;

type PaymentItem = {
  id: string;
  amount: string;
  mode: string;
};

const modeOptions = [
  { label: 'Advance', value: 'Advance' },
  { label: 'Cash', value: 'Cash' },
  { label: 'RTGS/NEFT', value: 'RTGS/NEFT' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Cheque', value: 'Cheque' },
];

const ActiveInvoicePaymentScreen = ({ navigation, route }: ActiveInvoicePaymentProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { invoice, totalAmount, dueAmount, paymentHistory } = route.params;
  const paymentDetails = useSelector((state: RootState) => state.customInvoice.paymentDetails);

  const [paymentData, setPaymentData] = useState<PaymentItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [pendingAmounts, setPendingAmounts] = useState<{ [key: string]: string }>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentDueAmount, setCurrentDueAmount] = useState<number>(() => {
    const dueAmountStr = dueAmount?.toString() || '0';
    return parseFloat(dueAmountStr.replace(/[₹,\s]/g, '')) || 0;
  });

  const { height } = Dimensions.get('window');
  const headerHeight = height * 0.15;
  const historyMaxHeight = height * 0.3;

  // Memoize paymentHistory IDs
  const historyPaymentIds = useMemo(() => (paymentHistory || []).map((p: any) => p._id), [paymentHistory]);

  // Track initialization to prevent redundant updates
  const isInitialized = useRef(false);

  // Initialize paymentData and paymentDetails only once
  useEffect(() => {
    if (isInitialized.current) return;

    const totalAmountNum = parseFloat((totalAmount?.toString() || '0').replace(/[₹,\s]/g, '')) || 0;
    const dueAmountNum = parseFloat((dueAmount?.toString() || '0').replace(/[₹,\s]/g, '')) || 0;

    // Initialize paymentData from paymentDetails, excluding paymentHistory
    if (paymentDetails?.payments?.length > 0) {
      const newPaymentData = paymentDetails.payments
        .filter((p: any) => !historyPaymentIds.includes(p._id))
        .map((p: any, index: number) => ({
          id: `payment-${Date.now()}-${index}`,
          amount: `₹ ${typeof p.amount === 'number' ? p.amount.toLocaleString('en-IN') : '0'}`,
          mode: p.paymentMethod,
        }));
      setPaymentData(newPaymentData);
    }

    // Initialize Redux paymentDetails
    const historyPayments = (paymentHistory || []).map((p: any) => ({
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      _id: p._id,
    }));

    dispatch(setPaymentDetails({
      totalAmount: totalAmountNum,
      dueAmount: dueAmountNum,
      payments: historyPayments,
    }));

    isInitialized.current = true;
  }, [paymentDetails?.payments, historyPaymentIds, totalAmount, dueAmount, paymentHistory, dispatch]);

  // Update currentDueAmount based on paymentData
  useEffect(() => {
    const totalAmountNum = parseFloat((totalAmount?.toString() || '0').replace(/[₹,\s]/g, '')) || 0;
    const totalPaid = paymentData.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const historyPaid = (paymentHistory || []).reduce(
      (sum: number, payment: { amount: number }) => sum + (payment.amount || 0),
      0
    );

    let newDueAmount;
    if (dueAmount !== totalAmount) {
      newDueAmount = Math.max(0, dueAmount - totalPaid);
    } else {
      newDueAmount = Math.max(0, totalAmountNum - (totalPaid + historyPaid));
    }

    setCurrentDueAmount(newDueAmount);
  }, [paymentData, totalAmount, dueAmount, paymentHistory]);

  const handleModeChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].mode = value;
    setPaymentData(updatedData);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleAmountChange = (id: string, value: string) => {
    const cleanValue = value.replace(/[₹,\s]/g, '');
    setPendingAmounts((prev) => ({ ...prev, [id]: cleanValue }));
  };

  const handleAmountConfirm = (index: number, id: string) => {
    const cleanValue = pendingAmounts[id] || '0';
    const parsedValue = parseFloat(cleanValue) || 0;

    if (parsedValue > currentDueAmount) {
      Alert.alert('Error', `Amount exceeds due amount (₹${currentDueAmount.toLocaleString('en-IN')}).`);
      setPendingAmounts((prev) => ({ ...prev, [id]: '' }));
      return;
    }

    const updatedData = [...paymentData];
    updatedData[index].amount = cleanValue ? `₹ ${parseFloat(cleanValue).toLocaleString('en-IN')}` : `₹ 0`;
    setPaymentData(updatedData);
    setPendingAmounts((prev) => ({ ...prev, [id]: '' }));
  };

  const addPaymentOption = () => {
    const newId = Date.now().toString();
    let defaultAmount = paymentAmount;
    if (!defaultAmount) {
      defaultAmount = `₹ 0`;
    } else if (!defaultAmount.startsWith('₹')) {
      defaultAmount = `₹ ${defaultAmount}`;
    }

    const parsedAmount = parseFloat(defaultAmount.replace(/[₹,\s]/g, '')) || 0;
    if (parsedAmount > currentDueAmount) {
      Alert.alert('Error', `Payment amount exceeds due amount (₹${currentDueAmount.toLocaleString('en-IN')}).`);
      return;
    }

    setPaymentData([...paymentData, { id: newId, amount: defaultAmount, mode: 'Advance' }]);
    setPaymentAmount('');
  };

  const handleDeletePayment = (id: string) => {
    setPaymentData(paymentData.filter((item) => item.id !== id));
    setPendingAmounts((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleUpdatePayment = () => {
    const formattedPayments = paymentData.map((item) => ({
      amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0,
      paymentMethod: item.mode,
    }));

    const updatedInvoice = {
      ...invoice,
      payments: [
        ...(paymentHistory || []),
        ...formattedPayments.map((p) => ({
          ...p,
          _id: `temp-${Date.now()}`,
          paymentReference: `TXN-${Date.now()}`,
          paymentDate: new Date().toISOString(),
          notes: currentDueAmount - p.amount === 0 ? 'complete' : 'active',
          receivedBy: currentUser?.id || 'unknown',
          receivedByType: 'Manager',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ],
      dueAmount: currentDueAmount,
    };

    dispatch(setPaymentDetails({
      totalAmount: parseFloat((totalAmount?.toString() || '0').replace(/[₹,\s]/g, '')) || 0,
      dueAmount: currentDueAmount,
      payments: [...(paymentHistory || []), ...formattedPayments],
    }));

    navigation.navigate('ActiveInvoiceItems', { invoice: updatedInvoice });
  };

  const totalPaidAmount = invoice.payments.reduce(
    (sum: number, payment: { amount: number }) => sum + (payment.amount || 0),
    0,
  );
  const isCompleted = totalPaidAmount >= invoice.totalAmount;
  const [downloading, setDownloading] = useState(false);

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

  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] pb-2">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F4D5B2]"
      >
        <View className="flex-1 bg-[#F4D5B2] p-4">
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
                onPress={() => navigation.navigate('ActiveInvoiceItems', { invoice })}
                className="w-10 h-10 rounded-full border border-[#FBDBB5] justify-center items-center"
              >
                <Icon name="arrow-left" size={20} color="#FBDBB5" />
              </TouchableOpacity>
              <View className="flex-1 items-end">
                <Text className="text-sm text-[#FBDBB5]">Invoice ID:</Text>
                <Text className="text-base font-bold text-[#FBDBB5]">
                  {invoice?._id || 'INV-2025-001'}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1 bg-[#F4D5B2] p-4"
            style={{ paddingTop: headerHeight + verticalScale(10) }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-lg font-semibold text-center mb-4">
              {isCompleted ? 'View Payment Details' : 'Edit Payment Details'}
            </Text>

            <View className="flex-row justify-between items-center border border-black rounded-lg mb-2 overflow-hidden">
              <View className="bg-black px-4 py-4">
                <Text className="text-white font-semibold">Total Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right text-base font-semibold">
                  ₹ {(totalAmount || paymentDetails?.totalAmount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center border border-black rounded-lg mb-6 overflow-hidden">
              <View className="bg-black px-5 py-4">
                <Text className="text-white font-semibold">Due Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right text-base font-semibold">
                  ₹ {currentDueAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <Text className="text-base font-semibold mb-2">Add Payments</Text>

            {paymentData.length === 0 ? (
              <Text className="text-center text-base text-[#292C33] mb-3">No new payments added</Text>
            ) : (
              paymentData.map((item, index) => (
                <View key={item.id} className="flex-row items-center mb-4">
                  <View className="flex-1 flex-row items-center border border-[#DB9245] rounded-lg px-4 mr-2">
                    <TextInput
                      value={pendingAmounts[item.id] || item.amount}
                      onChangeText={(value) => handleAmountChange(item.id, value)}
                      className="flex-1 text-base"
                      keyboardType="numeric"
                      editable={!isCompleted}
                    />
                    <TouchableOpacity
                      onPress={() => handleAmountConfirm(index, item.id)}
                      disabled={!pendingAmounts[item.id] || isCompleted}
                    >
                      <Icon
                        name="check"
                        size={16}
                        color={pendingAmounts[item.id] && !isCompleted ? '#DB9245' : '#999'}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: '35%', marginRight: 8 }}>
                    <TouchableOpacity
                      onPress={() => toggleDropdown(item.id)}
                      style={{
                        backgroundColor: '#D6872A',
                        borderRadius: 10,
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                      disabled={isCompleted}
                    >
                      <Text style={{ color: '#fff', fontSize: 14 }}>{item.mode}</Text>
                      <Icon
                        name={openDropdownId === item.id ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    {openDropdownId === item.id && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 48,
                          left: 0,
                          right: 0,
                          backgroundColor: '#D6872A',
                          borderRadius: 10,
                          zIndex: 1000,
                          elevation: 5,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.84,
                        }}
                      >
                        {modeOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={{
                              paddingVertical: 12,
                              paddingHorizontal: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: 'rgba(255,255,255,0.3)',
                            }}
                            onPress={() => handleModeChange(index, option.value)}
                          >
                            <Text style={{ color: '#fff', fontSize: 14 }}>{option.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(item.id)}
                    className="w-8 h-8 rounded-full border border-[#DB9245] justify-center items-center"
                    disabled={isCompleted}
                  >
                    <Icon name="trash-2" size={16} color={isCompleted ? '#999' : '#DB9245'} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            <TouchableOpacity
              onPress={addPaymentOption}
              className="flex-row items-center justify-center bg-[#D1853A] rounded-lg py-3 mb-6"
              disabled={isCompleted}
            >
              <Icon name="plus" size={18} color='#fff' />
              <Text className="ml-2 text-white font-medium">
                Add Payment Option
              </Text>
            </TouchableOpacity>

            {paymentHistory && paymentHistory.length > 0 && (
              <>
                <Text className="text-base font-semibold mb-2">Payment History</Text>
                <ScrollView
                  style={{ maxHeight: historyMaxHeight, marginBottom: 20 }}
                  showsVerticalScrollIndicator={true}
                >
                  {paymentHistory.map((item: any, index: number) => (
                    <View key={item._id || index} className="flex-row items-center mb-3">
                      <Text className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                        ₹ {typeof item.amount === 'number' ? item.amount.toLocaleString('en-IN') : '0'}
                      </Text>
                      <Text className="flex-1 border border-[#DB9245] bg-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base text-white">
                        {item.paymentMethod || item.modeOfPayment}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>
          
          <TouchableOpacity
            className="bg-[#D1853A] py-3 rounded-lg items-center mt-auto mb-2 mx-4"
            onPress={handleUpdatePayment}
          >
            <Text className="text-white font-semibold text-base">
              {isCompleted ? 'Back to Items' : 'Update Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ActiveInvoicePaymentScreen;