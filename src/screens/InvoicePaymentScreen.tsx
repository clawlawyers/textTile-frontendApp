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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AccountStackParamList } from '../stacks/Account';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { setPaymentDetails } from '../redux/commonSlice';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { NODE_API_ENDPOINT } from '../utils/util';

type AddNewUserProps = NativeStackScreenProps<
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

const InvoicePaymentScreen = ({ navigation, route }: AddNewUserProps) => {
  const dispatch = useDispatch();
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const { height } = Dimensions.get('window');
  const headerHeight = height * 0.15;

  // Get invoice details from navigation params
  const invoiceStatus = route.params?.invoiceStatus || 'new';
  const invoiceId = route.params?.invoiceId || '60d5ec49f8c7b00015e4a1b1';
  const invoiceNumber = route.params?.invoiceNumber || '501';
  const billingDetails = route.params?.billingDetails || {};
  const paymentDetails = route.params?.paymentDetails || {
    totalAmount: '0',
    dueAmount: '0',
    payments: [],
  };
  const paymentHistory = route.params?.paymentHistory || [];

  const [paymentData, setPaymentData] = useState<PaymentItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [currentDueAmount, setCurrentDueAmount] = useState<number>(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);


  // Parse totalAmount from paymentDetails
  const totalAmount = parseFloat(paymentDetails.totalAmount?.replace(/[₹,\s]/g, '') || '0');

  // Initialize due amount
  useEffect(() => {
    const loadPaymentData = async () => {
      if (invoiceStatus !== 'new') {
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/orders/custom-invoice/${invoiceId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch invoice payment details');
          }

          const data = await response.json();
          const fetchedPayments = data.payments?.map((payment: any) => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            amount: `₹ ${payment.amount.toLocaleString('en-IN')}`,
            mode: payment.modeOfPayment || 'Advance',
          })) || [];
          setPaymentData(fetchedPayments);
          setCurrentDueAmount(data.dueAmount || totalAmount);
        } catch (error) {
          console.error('Error fetching payment details:', error);
          Alert.alert('Error', 'Failed to fetch payment details');
        }
      } else {
        setCurrentDueAmount(totalAmount);
      }
    };

    loadPaymentData();
  }, [invoiceStatus, invoiceId, totalAmount]);

  // Recalculate due amount when payment data changes
  useEffect(() => {
    const advancePaid = paymentData.reduce((sum, item) => {
      if (item.mode === 'Advance') {
        const amount = parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0;
        return sum + amount;
      }
      return sum;
    }, 0);

    const paymentHistoryPaid = paymentHistory.reduce((sum: number, item: any) => {
      return sum + (item.amount || 0);
    }, 0) || 0;

    const newDueAmount = Math.max(0, totalAmount - advancePaid - paymentHistoryPaid);
    setCurrentDueAmount(newDueAmount);
  }, [paymentData, paymentHistory, totalAmount]);

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

  const handleUpdatePayment = async () => {
    if (invoiceStatus === 'completed') {
      Alert.alert('Info', 'This invoice is completed and cannot be edited.');
      return;
    }

    const formattedPayments = paymentData.map(item => ({
      amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0,
      modeOfPayment: item.mode,
    }));

    if (paymentHistory.length > 0) {
      formattedPayments.push(...paymentHistory);
    }

    const totalPaid = formattedPayments.reduce((sum, item) => sum + item.amount, 0);
    const finalDueAmount = Math.max(0, totalAmount - totalPaid);
    const invoiceStatusToUpdate = finalDueAmount === 0 ? 'completed' : 'active';

    const payload = {
      clientDetails: {
        name: billingDetails.billTo || '',
        firmName: billingDetails.billingFrom || '',
        address: billingDetails.billToAddress || '',
        firmGSTNumber: billingDetails.billToGSTIN || '',
        billingFromAddress: billingDetails.billingFromAddress || '',
        billingFromGSTIN: billingDetails.billingFromGSTIN || '',
      },
      customProducts: [], // Fetch from backend or pass from previous screen if needed
      totalAmount: totalAmount,
      paidAmount: totalPaid,
      dueAmount: finalDueAmount,
      paymentStatus: invoiceStatusToUpdate,
      payments: formattedPayments,
      notes: "This invoice reflects a special agreement.",
      forceGenerate: true,
      invoiceNumber: invoiceNumber,
      invoiceDate: billingDetails.date || '',
      dueDate: billingDetails.duedate || '',
    };

    try {
      const endpoint = `${NODE_API_ENDPOINT}/orders/custom-invoice/${invoiceId}`;
      const method = invoiceStatus === 'new' ? 'POST' : 'PATCH';

      const saveResponse = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(
          `Failed to ${invoiceStatus === 'new' ? 'create' : 'update'} invoice: ${saveResponse.status} ${errorText}`
        );
      }

      const generateResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
        },
        body: JSON.stringify(payload),
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`Failed to generate invoice PDF: ${generateResponse.status} ${errorText}`);
      }

      const blob = await generateResponse.blob();
      const filename = `invoice_${invoiceNumber}.pdf`;
      const dir = Platform.OS === 'android'
        ? ReactNativeBlobUtil.fs.dirs.DownloadDir
        : ReactNativeBlobUtil.fs.dirs.DocumentDir;
      const path = `${dir}/${filename}`;

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      const base64data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
      });

      await ReactNativeBlobUtil.fs.writeFile(path, base64data, 'base64');

      const finalPaymentDetails = {
        totalAmount: totalAmount.toLocaleString('en-IN'),
        dueAmount: finalDueAmount.toLocaleString('en-IN'),
        payments: formattedPayments,
      };

      dispatch(setPaymentDetails(finalPaymentDetails));

      Alert.alert(
        'Success',
        `Invoice ${invoiceNumber} updated and PDF downloaded to ${path}`
      );

      navigation.navigate('InvoiceItemsScreen', {
        invoiceStatus: invoiceStatusToUpdate,
        invoiceId,
        invoiceNumber,
        billingDetails,
      });
    } catch (error: any) {
      console.error('Error updating payment:', error);
      Alert.alert('Error', error.message || 'Failed to update payment');
    }
  };

  const isEditable = invoiceStatus !== 'completed';

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
            disabled={!isEditable}
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
              editable={isEditable}
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
                disabled={!isEditable}
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
              disabled={!isEditable}
            >
              <Icon name="trash-2" size={16} color="#DB9245" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={addPaymentOption}
          className="flex-row items-center justify-center bg-[#DB9245] rounded-lg py-3 mb-6"
          disabled={!isEditable}
        >
          <Icon name="plus" size={18} color="#292C33" />
          <Text className="ml-2 text-[#292C33] font-medium">
            Add Payment Option
          </Text>
        </TouchableOpacity>

        {paymentHistory.length > 0 && (
          <>
            <Text className="text-base font-semibold mb-2">Payment History</Text>
            {paymentHistory.map((item: any, index: number) => (
              <View key={index} className="flex-row items-center mb-3">
                <Text className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                  {item.amount}
                </Text>
                <Text className="flex-1 border border-[#DB9245] bg-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                  {item.paymentMethod || item.modeOfPayment}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center mt-auto mb-10 mx-4"
        disabled={paymentData.length === 0 || !isEditable}
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