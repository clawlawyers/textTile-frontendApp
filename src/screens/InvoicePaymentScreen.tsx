/* eslint-disable react-native/no-inline-styles */
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AccountStackParamList } from '../stacks/Account';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type PaymentItem = {
  id: string;
  amount: string;
  mode: string;
};

type Item = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoicePaymentScreen'
>;

const modeOptions = [
  { label: 'Advance', value: 'Advance' },
  { label: 'Cash', value: 'Cash' },
  { label: 'RTGS/NEFT', value: 'RTGS/NEFT' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Cheque', value: 'Cheque' },
];

const MAX_AMOUNT = 1_000_000_000; // 1 billion

const isValidObjectId = (id: string) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const InvoicePaymentScreen = ({ navigation, route }: AddNewUserProps) => {
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const { height } = Dimensions.get('window');
  const headerHeight = height * 0.15;

  // Get invoice details from navigation params
  const invoiceStatus = route.params?.invoiceStatus || 'new';
  const orderId = route.params?.orderId; // Custom orderId (e.g., A00009)
  const testOrderId = route.params?.testOrderId; // MongoDB _id
  const invoiceNumber = route.params?.invoiceNumber || 'INV-2025-001';
  const billingDetails = route.params?.billingDetails || {};
  const paymentDetails = route.params?.paymentDetails || {
    totalAmount: '0',
    dueAmount: '0',
    payments: [],
  };
  const paymentHistory = route.params?.paymentHistory || [];
  const cartProducts = route.params?.cartProducts || [];
  const discountValue = route.params?.discountValue || '0';
  const discountMode = route.params?.discountMode || 'percent';
  const gstValue = route.params?.gstValue || '0';

  const [paymentData, setPaymentData] = useState<PaymentItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currentDueAmount, setCurrentDueAmount] = useState<number>(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Parse totalAmount and dueAmount from paymentDetails
  const totalAmount = parseFloat(paymentDetails.totalAmount?.replace(/[₹,\s]/g, '') || '0');

  // Initialize due amount
  useEffect(() => {
    const due = parseFloat(paymentDetails.dueAmount?.replace(/[₹,\s]/g, '') || totalAmount.toString());
    setCurrentDueAmount(due);
  }, [totalAmount, paymentDetails]);

  // Recalculate due amount when payment data changes
  useEffect(() => {
    const advancePaid = paymentData.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0;
      return sum + amount;
    }, 0);

    const paymentHistoryPaid = paymentHistory.reduce((sum: number, item: any) => {
      return sum + (item.amount || 0);
    }, 0) || 0;

    const newDueAmount = Math.max(0, totalAmount - advancePaid - paymentHistoryPaid);
    setCurrentDueAmount(newDueAmount);
  }, [paymentData, paymentHistory, totalAmount]);

  // Calculate payment totals by mode
  const paymentByMode = paymentHistory.reduce((acc: { [key: string]: number }, item: any) => {
    const mode = item.paymentMethod || item.modeOfPayment || 'Unknown';
    acc[mode] = (acc[mode] || 0) + (item.amount || 0);
    return acc;
  }, {});

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
    const newId = Date.now().toString();
    let defaultAmount = paymentAmount;
    if (!defaultAmount) {
      defaultAmount = '';
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
    if (paymentData.length === 0) {
      Alert.alert('Error', 'Please add at least one payment.');
      return;
    }

    const formattedPayments = paymentData.map(item => ({
      amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0,
      modeOfPayment: item.mode,
    }));

    const finalPaymentDetails = {
      totalAmount: totalAmount.toLocaleString('en-IN'),
      dueAmount: currentDueAmount.toLocaleString('en-IN'),
      payments: formattedPayments,
    };

    // Reset paymentData and paymentAmount
    setPaymentData([]);
    setPaymentAmount('');

    navigation.navigate('InvoiceItemsScreen', {
      invoiceStatus,
      orderId,
      invoiceNumber,
      billingDetails,
      paymentDetails: finalPaymentDetails,
      paymentHistory: [...paymentHistory, ...formattedPayments.map(p => ({
        amount: p.amount,
        paymentMethod: p.modeOfPayment,
      }))],
      cartProducts,
      discountValue,
      discountMode,
      gstValue,
    });

    Alert.alert('Success', 'Payment details updated. Save invoice to confirm.');
  };

  return (
    <View className="flex-1 bg-[#F4D5B2]">
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
            <Text className="text-base font-bold text-[#FBDBB5]">{invoiceNumber}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-[#FBDBB5] p-4"
        style={{ paddingTop: headerHeight + 10 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 items-end -ml-4">
            <Text className="text-sm text-black">Order Creation For</Text>
            <Text className="text-base font-bold text-black">
              {currentClient?.name}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-semibold text-center mb-4">
          Payment Details
        </Text>

        <View className="flex-row justify-between items-center border border-black rounded-lg mb-2 overflow-hidden">
          <View className="bg-black px-4 py-4">
            <Text className="text-white font-semibold">Total Amount</Text>
          </View>
          <View className="px-4 py-3 flex-1">
            <Text className="text-right text-base font-semibold">
              ₹ {totalAmount.toLocaleString('en-IN')}
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
                  name={
                    openDropdownId === item.id ? 'chevron-up' : 'chevron-down'
                  }
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
          className="flex-row items-center justify-center bg-[#DB9245] rounded-lg py-3 mb-6"
        >
          <Icon name="plus" size={18} color="#292C33" />
          <Text className="ml-2 text-[#292C33] font-medium">
            Add Payment Option
          </Text>
        </TouchableOpacity>

        {Object.keys(paymentByMode).length > 0 && (
          <>
            <Text className="text-base font-semibold mb-2">Payment Summary by Mode</Text>
            {Object.entries(paymentByMode).map(([mode, amount], index) => (
              <View key={index} className="flex-row items-center mb-3">
                <Text className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                  ₹ {amount.toLocaleString('en-IN')}
                </Text>
                <Text className="flex-1 border border-[#DB9245] bg-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base text-white">
                  {mode}
                </Text>
              </View>
            ))}
          </>
        )}

        {paymentHistory.length > 0 && (
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
        className="bg-[#DB9245] py-3 rounded-lg items-center mt-auto mb-10 mx-4"
        disabled={paymentData.length === 0}
        onPress={handleUpdatePayment}
      >
        <Text className="text-white font-semibold text-base">
          Update Payment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InvoicePaymentScreen;