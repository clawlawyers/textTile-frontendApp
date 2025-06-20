/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootState } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { setPaymentDetails } from '../redux/customInvoiceSlice';
import { scale, verticalScale } from '../utils/scaling';

type InvoicePaymentProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoicePaymentScreen'
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

const InvoicePaymentScreen = ({ navigation, route }: InvoicePaymentProps) => {
  const dispatch = useDispatch();
  const { invoiceNumber, paymentDetails, items } = useSelector(
    (state: RootState) => state.customInvoice
  );

  const {
    invoiceStatus,
    orderId,
    testOrderId,
    billingDetails,
    paymentHistory,
    cartProducts,
    discountValue,
    discountMode,
    gstValue,
  } = route.params;

  const [paymentData, setPaymentData] = useState<PaymentItem[]>(
    paymentDetails?.payments?.map((p, index) => ({
      id: `payment-${Date.now()}-${index}`,
      amount: `₹ ${p.amount.toLocaleString('en-IN')}`,
      mode: p.paymentMethod,
    })) || []
  );
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currentDueAmount, setCurrentDueAmount] = useState(() => {
    const dueAmountStr = paymentDetails?.dueAmount?.toString() || '0';
    return parseFloat(dueAmountStr.replace(/[₹,\s]/g, '')) || 0;
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { height } = Dimensions.get('window');
  const headerHeight = height * 0.15;

  // Calculate due amount
  useEffect(() => {
    const totalAmountStr = paymentDetails?.totalAmount?.toString() || '0';
    const totalAmount = parseFloat(totalAmountStr.replace(/[₹,\s]/g, '')) || 0;

    const totalPaid = paymentData.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const newDueAmount = Math.max(0, totalAmount - totalPaid);
    const formattedDueAmount = newDueAmount.toLocaleString('en-IN');

    setCurrentDueAmount(newDueAmount);
    const updatedPaymentDetails = {
      totalAmount: paymentDetails?.totalAmount || '0',
      dueAmount: formattedDueAmount,
      payments:
        paymentData?.length > 0
          ? paymentData
              .filter(item => parseFloat(item.amount.replace(/[₹,\s]/g, '')) > 0)
              .map(item => ({
                amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')),
                paymentMethod: item.mode,
              }))
          : [],
    };

    setPaymentDetails(updatedPaymentDetails);
  }, [paymentData, paymentDetails?.totalAmount]);

  const handleModeChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].mode = value;
    setPaymentData(updatedData);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const addPaymentOption = () => {
    const newId = `payment-${Date.now()}`;
    let defaultAmount = paymentAmount;
    if (!defaultAmount) {
      defaultAmount = `₹ ${currentDueAmount.toLocaleString('en-IN')}`;
    } else if (!defaultAmount.startsWith('₹')) {
      defaultAmount = `₹ ${defaultAmount}`;
    }

    setPaymentData([
      ...paymentData,
      { id: newId, amount: defaultAmount, mode: 'Advance' },
    ]);
    setPaymentAmount('');
  };

  const handleAmountChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].amount = value.startsWith('₹') ? value : `₹ ${value}`;
    setPaymentData(updatedData);
  };

  const handleDeletePayment = (id: string) => {
    setPaymentData(paymentData.filter(item => item.id !== id));
  };

  const handleUpdatePayment = () => {
    const formattedPayments =
      paymentData?.length > 0
        ? paymentData
            .filter(item => parseFloat(item.amount.replace(/[₹,\s]/g, '')) > 0)
            .map(item => ({
              amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')),
              paymentMethod: item.mode,
            }))
        : [];

    const finalPaymentDetails = {
      totalAmount: paymentDetails?.totalAmount || '0',
      dueAmount: currentDueAmount.toLocaleString('en-IN'),
      payments: formattedPayments,
    };

    console.log('Updating payment details in Redux:', finalPaymentDetails);
    dispatch(setPaymentDetails(finalPaymentDetails));

    navigation.navigate('InvoiceItemsScreen', {
      invoiceStatus,
      orderId,
      testOrderId,
      invoiceNumber: invoiceNumber || 'INV-2025-001',
      billingDetails,
      paymentDetails: finalPaymentDetails,
      paymentHistory: [...(paymentHistory || []), ...formattedPayments],
      cartProducts: cartProducts || [],
      discountValue,
      discountMode,
      gstValue,
    });
  };

  const handleDownload = () => {
    console.log('Download invoice:', invoiceNumber);
    // Placeholder for download functionality
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#F4D5B2] pb-2">
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
          <View className="flex-1 items-end">
            <Text className="text-sm text-[#FBDBB5]">Invoice ID:</Text>
            <Text className="text-base font-bold text-[#FBDBB5]">
              {invoiceNumber || 'INV-2025-001'}
            </Text>
          </View>
          
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#F4D5B2] p-4"
        style={{ paddingTop: headerHeight + verticalScale(10) }}
      >
        <Text className="text-lg font-semibold text-center mb-4">
          Payment Details
        </Text>

        <View className="flex-row justify-between items-center border border-black rounded-lg mb-2 overflow-hidden">
          <View className="bg-black px-4 py-4">
            <Text className="text-white font-semibold">Total Amount</Text>
          </View>
          <View className="px-4 py-3 flex-1">
            <Text className="text-right text-base font-semibold">
              ₹ {paymentDetails?.totalAmount || '0'}
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

        <Text className="text-base font-semibold mb-2">Add Payment Mode</Text>

        {paymentData.map((item, index) => (
          <View key={item.id} className="flex-row items-center mb-3">
            <TextInput
              value={item.amount}
              onChangeText={value => handleAmountChange(index, value)}
              className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base"
              keyboardType="numeric"
            />
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
                }}
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
                  {modeOptions.map(option => (
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
                      <Text style={{ color: '#fff', fontSize: 14 }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleDeletePayment(item.id)}
              className="w-8 h-8 rounded-full border border-[#DB9245] justify-center items-center"
            >
              <Icon name="trash-2" size={16} color="#DB9245" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={addPaymentOption}
          className="flex-row items-center justify-center bg-[#FBDBB5] rounded-lg py-3 mb-6"
        >
          <Icon name="plus" size={18} color="#292C33" />
          <Text className="ml-2 text-[#292C33] font-medium">
            Add Payment Option
          </Text>
        </TouchableOpacity>

        {paymentHistory?.length > 0 && (
          <>
            <Text className="text-base font-semibold mb-2">Payment History</Text>
            {paymentHistory.map((item: any, index: number) => (
              <View key={index} className="flex-row items-center mb-3">
                <Text className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                  ₹ {item.amount.toLocaleString('en-IN')}
                </Text>
                <Text className="flex-1 border border-[#DB9245] bg-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base text-white">
                  {item.paymentMethod || item.modeOfPayment}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        className="bg-[#D1853A] py-3 rounded-lg items-center mt-auto mb-10 mx-4"
        disabled={paymentData?.length === 0}
        onPress={handleUpdatePayment}
      >
        <Text className="text-white font-semibold text-base">Update Payment</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InvoicePaymentScreen;