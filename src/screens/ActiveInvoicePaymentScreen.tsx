/* eslint-disable react-native/no-inline-styles */
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { scale, verticalScale } from '../utils/scaling';
import { NODE_API_ENDPOINT } from '../utils/util';
import { setPaymentDetails, setLoading, setError } from '../redux/customInvoiceSlice';

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
  const { invoice } = route.params;
  const paymentDetails = useSelector((state: RootState) => state.customInvoice.paymentDetails);
  
  const [paymentData, setPaymentData] = useState<PaymentItem[]>([]);
  const [downloading,setDownloading] =useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [loading, setLocalLoading] = useState(false);

  const { height } = Dimensions.get('window');
  const headerHeight = height * 0.15;
  console.log(invoice._id)

  // Initialize payment data and fetch real-time invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!currentUser?.token) {
        Alert.alert('Error', 'User not authenticated. Please log in.');
        navigation.navigate('LoginScreen');
        return;
      }
      console.log(invoice)

      setLocalLoading(true);
      try {
        const response = await fetch(`${NODE_API_ENDPOINT}/custom-orders/${invoice._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.token}`,
          },
        });

        if (response.status === 401) {
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('LoginScreen');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch invoice data');
        }

        const updatedInvoice = await response.json();
        
        // Update Redux store with latest payment details
        dispatch(setPaymentDetails({
          totalAmount: updatedInvoice.totalAmount,
          dueAmount: updatedInvoice.dueAmount,
          payments: updatedInvoice.payments,
        }));

        // Update local payment data
        setPaymentData(
          updatedInvoice.payments?.map((p: any, index: number) => ({
            id: `payment-${p._id || Date.now()}-${index}`,
            amount: `₹ ${p.amount.toLocaleString('en-IN')}`,
            mode: p.paymentMethod,
          })) || []
        );
      } catch (error) {
        console.error('Error fetching invoice:', error);
        dispatch(setError(error.message));
        Alert.alert('Error', `Failed to fetch invoice: ${error.message}`);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchInvoiceData();
  }, [currentUser?.token, invoice._id, dispatch, navigation]);

  // Calculate completion status from Redux store
  const isCompleted = paymentDetails?.dueAmount === 0 || 
    (paymentDetails?.totalAmount || 0) <= 
    (paymentDetails?.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0);

  const handleModeChange = (index: number, value: string) => {
    if (isCompleted) return;
    const updatedData = [...paymentData];
    updatedData[index].mode = value;
    setPaymentData(updatedData);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (id: string) => {
    if (isCompleted) return;
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const addPaymentOption = () => {
    if (isCompleted) return;
    const newId = `payment-${Date.now()}`;
    let defaultAmount = paymentAmount;
    if (!defaultAmount) {
      defaultAmount = `₹ ${(paymentDetails?.dueAmount || 0).toLocaleString('en-IN')}`;
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
    if (isCompleted) return;
    const updatedData = [...paymentData];
    updatedData[index].amount = value.startsWith('₹') ? value : `₹ ${value}`;
    setPaymentData(updatedData);
  };

  const handleDeletePayment = (id: string) => {
    if (isCompleted) return;
    setPaymentData(paymentData.filter(item => item.id !== id));
  };

  const handleUpdatePayment = async () => {
    if (isCompleted) {
      navigation.navigate('ActiveInvoiceItems', { invoice });
      return;
    }
  
    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return;
    }
  
    setLocalLoading(true);
    dispatch(setLoading(true));
  
    // Step 1: Prepare new payment objects
    const formattedPayments = paymentData
      .filter(item => parseFloat(item.amount.replace(/[₹,\s]/g, '')) > 0)
      .map(item => ({
        amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')),
        paymentMethod: item.mode,
        paymentReference: `TXN-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        notes: paymentDetails?.dueAmount === 0 ? 'complete' : 'active',
        receivedBy: currentUser?.id || 'unknown',
        receivedByType: 'Manager',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
  
    const totalPaid = formattedPayments.reduce((sum, item) => sum + item.amount, 0);
    const updatedDueAmount = Math.max(0, (paymentDetails?.totalAmount || 0) - totalPaid);
  
    // Step 2: Refetch the latest invoice from server (for optimistic concurrency control)
    let latestInvoice;
    try {
      const latestResponse = await fetch(`${NODE_API_ENDPOINT}/custom-orders/${invoice._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
  
      if (!latestResponse.ok) {
        throw new Error(`HTTP ${latestResponse.status}`);
      }
  
      latestInvoice = await latestResponse.json();
    } catch (err) {
      console.error('❌ Failed to refetch latest invoice:', err);
      Alert.alert('Network Error', 'Unable to fetch latest invoice. Check your internet or session.');
      dispatch(setLoading(false));
      setLocalLoading(false);
      return;
    }
  
    // Step 3: Construct updated invoice with latest data and new payments
    const updatedInvoice = {
      ...latestInvoice, // spread the latest version to avoid version mismatch
      payments: formattedPayments,
      dueAmount: updatedDueAmount,
      updatedAt: new Date().toISOString(),
    };
  
    // Step 4: PUT updated invoice to backend
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/custom-orders/payment/${invoice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(updatedInvoice),
      });
  
      if (response.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update invoice: ${response.status} ${errorText}`);
      }
  
      // Step 5: Update Redux and navigate
      dispatch(setPaymentDetails({
        totalAmount: updatedInvoice.totalAmount,
        dueAmount: updatedDueAmount,
        payments: formattedPayments,
      }));
  
      Alert.alert('Success', 'Payments updated successfully');
      navigation.navigate('ActiveInvoiceItems', { invoice: updatedInvoice });
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      dispatch(setError(error.message));
      Alert.alert('Error', `Failed to update invoice: ${error.message}`);
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };
  

  return (
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
              ₹ {(paymentDetails?.totalAmount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center border border-black rounded-lg mb-6 overflow-hidden">
          <View className="bg-black px-5 py-4">
            <Text className="text-white font-semibold">Due Amount</Text>
          </View>
          <View className="px-4 py-3 flex-1">
            <Text className="text-right text-base font-semibold">
              ₹ {(paymentDetails?.dueAmount || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <Text className="text-base font-semibold mb-2">Payment Modes</Text>

        {paymentData.map((item, index) => (
          <View key={item.id} className="flex-row items-center mb-3">
            <TextInput
              value={item.amount}
              onChangeText={value => handleAmountChange(index, value)}
              className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base"
              keyboardType="numeric"
              editable={!isCompleted}
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
              disabled={isCompleted}
            >
              <Icon name="trash-2" size={16} color={isCompleted ? "#999" : "#DB9245"} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={addPaymentOption}
          className="flex-row items-center justify-center bg-[#FBDBB5] rounded-lg py-3 mb-6"
          disabled={isCompleted}
        >
          <Icon name="plus" size={18} color={isCompleted ? "#999" : "#292C33"} />
          <Text className={`ml-2 text-${isCompleted ? '[#999]' : '[#292C33]'} font-medium`}>
            Add Payment Option
          </Text>
        </TouchableOpacity>

        {paymentDetails && paymentDetails.payments && paymentDetails.payments.length > 0 && (
          <>
            <Text className="text-base font-semibold mb-2">Payment History</Text>
            {paymentDetails.payments.map((item: any, index: number) => (
              <View key={index} className="flex-row items-center mb-3">
                <Text className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base">
                  ₹ {item.amount.toLocaleString('en-IN')}
                </Text>
                <Text className="flex-1 border border-[#DB9245] bg-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base text-white">
                  {item.paymentMethod}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        className="bg-[#D1853A] py-3 rounded-lg items-center mt-auto mb-10 mx-4"
        onPress={handleUpdatePayment}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-base">
          {isCompleted ? 'Back to Items' : (loading ? 'Updating...' : 'Update Payment')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveInvoicePaymentScreen;