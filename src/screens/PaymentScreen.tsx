/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import Icon1 from 'react-native-vector-icons/Feather';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../redux/store';
import {setPaymentDetails} from '../redux/commonSlice';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'PaymentScreen'
>;

type PaymentItem = {
  id: string;
  amount: string;
  mode: string;
};

const modeOptions = [
  {label: 'Advance', value: 'Advance'},
  {label: 'Cash', value: 'Cash'},
  {label: 'RTGS/NEFT', value: 'RTGS/NEFT'},
  {label: 'UPI', value: 'UPI'},
  {label: 'Cheque', value: 'Cheque'},
];

const PaymentScreen = ({navigation, route}: AddNewUserProps) => {
  const dispatch = useDispatch();
  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  // Log the payment details from route params
  console.log(
    'Payment details from route params:',
    route.params.paymentDetails,
  );

  // Initialize state with route params
  const [paymentData, setPaymentData] = useState<PaymentItem[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDetails, setLocalPaymentDetails] = useState(
    route.params.paymentDetails,
  );

  console.log(paymentData);

  // Ensure we have proper formatting for due amount
  const [currentDueAmount, setCurrentDueAmount] = useState(() => {
    // Parse the due amount, handling different formats
    const dueAmountStr = paymentDetails.dueAmount?.toString() || '0';
    // Remove currency symbol, commas, and whitespace before parsing
    const parsedAmount = parseFloat(dueAmountStr.replace(/[₹,\s]/g, '')) || 0;
    return parsedAmount;
  });

  // Track which dropdown is currently open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Calculate remaining due amount whenever payment data changes
  useEffect(() => {
    // Parse the total amount from string (remove commas and currency symbol)
    const totalAmountStr = paymentDetails.totalAmount?.toString() || '0';
    const totalAmount = parseFloat(totalAmountStr.replace(/[₹,\s]/g, '')) || 0;

    // Calculate the sum of all payment amounts
    const totalPaid = paymentData.reduce((sum, item) => {
      // Extract the numeric value from the amount string
      const amount = parseFloat(item.amount.replace(/[₹,\s]/g, '')) || 0;
      return sum + amount;
    }, 0);

    // Calculate the new due amount

    console.log(newDueAmount);

    console.log(route.params.paymentDetails.dueAmount);
    let newDueAmount;
    if (
      route.params.paymentDetails.dueAmount !==
      route.params.paymentDetails.totalAmount
    ) {
      newDueAmount = Math.max(
        0,
        typeof route.params.paymentDetails?.dueAmount === 'string'
          ? parseFloat(
              route.params.paymentDetails.dueAmount.replace(/[₹,\s]/g, ''),
            ) - totalPaid
          : route.params.paymentDetails.dueAmount - totalPaid,
      );
      // newDueAmount =
      //   newDueAmount -
      //   parseFloat(
      //     route.params.paymentDetails.dueAmount.replace(/[₹,\s]/g, ''),
      //   );
    } else {
      newDueAmount = Math.max(0, totalAmount - totalPaid);
    }

    // Format the due amount with commas
    const formattedDueAmount = newDueAmount.toLocaleString('en-IN');

    // Update the due amount in payment details
    setCurrentDueAmount(newDueAmount);
    const updatedPaymentDetails = {
      ...paymentDetails,
      dueAmount: formattedDueAmount,
      payments:
        paymentData?.length > 0
          ? paymentData.map(item => ({
              amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')),
              modeOfPayment: item.mode,
            }))
          : [],
    };

    setLocalPaymentDetails(updatedPaymentDetails);
  }, [paymentData, paymentDetails.totalAmount]);

  const handleModeChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].mode = value;
    setPaymentData(updatedData);
    setOpenDropdownId(null); // Close dropdown after selection
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const addPaymentOption = () => {
    // Generate a unique ID for the new payment option
    const newId = Date.now().toString();

    // Default amount can be the due amount or empty
    let defaultAmount = paymentAmount;
    if (!defaultAmount) {
      // If no amount is entered, use the current due amount
      defaultAmount = `₹ ${currentDueAmount.toLocaleString('en-IN')}`;
    } else if (!defaultAmount.startsWith('₹')) {
      defaultAmount = `₹ ${defaultAmount}`;
    }

    // Add new payment option to the array
    setPaymentData([
      ...paymentData,
      {id: newId, amount: defaultAmount, mode: 'Advance'},
    ]);

    // Reset payment amount input
    setPaymentAmount('');
  };

  const handleAmountChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].amount = value.startsWith('₹') ? value : `₹ ${value}`;
    setPaymentData(updatedData);
  };

  // Add this function to handle deletion of a payment row
  const handleDeletePayment = (id: string) => {
    setPaymentData(paymentData.filter(item => item.id !== id));
  };

  const handleUpdatePayment = () => {
    // Format payment data for API
    const formattedPayments =
      paymentData?.length > 0
        ? paymentData.map(item => ({
            amount: parseFloat(item.amount.replace(/[₹,\s]/g, '')),
            modeOfPayment: item.mode,
          }))
        : [];

    route?.params?.paymentHistory?.length > 0 &&
      formattedPayments.push(...route.params.paymentHistory);

    // Final payment details to be used by other components
    const finalPaymentDetails = {
      ...paymentDetails,
      payments: formattedPayments,
    };

    console.log('Updating payment details in Redux:', finalPaymentDetails);

    console.log('Current due amount before update:', paymentDetails);

    // Dispatch to Redux
    dispatch(setPaymentDetails(finalPaymentDetails));

    // Navigate back
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#F4D5B2] p-4 pt-10">
      <ScrollView className="flex-1 bg-[#F4D5B2] p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4 mt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
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

        <Text className="text-lg font-semibold text-center mb-4">
          Payment Details
        </Text>

        {/* Total Amount */}
        <View className="flex-row justify-between items-center border border-black rounded-lg mb-2 overflow-hidden">
          <View className="bg-black px-4 py-4">
            <Text className="text-white font-semibold">Total Amount</Text>
          </View>
          <View className="px-4 py-3 flex-1">
            <Text className="text-right text-base font-semibold">
              ₹ {paymentDetails.totalAmount}
            </Text>
          </View>
        </View>

        {/* Due Amount */}
        <View className="flex-row justify-between items-center border border-black rounded-lg mb-6 overflow-hidden">
          <View className="bg-black px-5 py-4">
            <Text className="text-white font-semibold ">Due Amount</Text>
          </View>
          <View className="px-4 py-3 flex-1">
            <Text className="text-right text-base font-semibold">
              ₹ {paymentDetails.dueAmount}
            </Text>
          </View>
        </View>

        {/* Add Payment Mode */}
        <Text className="text-base font-semibold mb-2">Add Payment Mode</Text>

        {/* Payment Options List */}
        {paymentData.map((item, index) => (
          <View key={item.id} className="flex-row items-center mb-3">
            <TextInput
              value={item.amount}
              onChangeText={value => handleAmountChange(index, value)}
              className="flex-1 border border-[#DB9245] rounded-lg px-4 py-3 mr-2 text-base"
              keyboardType="numeric"
            />

            {/* Custom Dropdown */}
            <View style={{width: '35%', marginRight: 8}}>
              <TouchableOpacity
                onPress={() => toggleDropdown(item.id)}
                style={{
                  backgroundColor: '#D6872A',
                  borderRadius: 10,
                  padding: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text style={{color: '#fff', fontSize: 14}}>{item.mode}</Text>
                <Icon
                  name={
                    openDropdownId === item.id ? 'chevron-up' : 'chevron-down'
                  }
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* Dropdown Options */}
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
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}>
                  {modeOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(255,255,255,0.3)',
                      }}
                      onPress={() => handleModeChange(index, option.value)}>
                      <Text style={{color: '#fff', fontSize: 14}}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => handleDeletePayment(item.id)}
              className="w-8 h-8 rounded-full border border-[#DB9245] justify-center items-center">
              <Icon name="trash-2" size={16} color="#DB9245" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Payment Option Button */}
        <TouchableOpacity
          onPress={addPaymentOption}
          className="flex-row items-center justify-center bg-[#FBDBB5] rounded-lg py-3 mb-6">
          <Icon name="plus" size={18} color="#292C33" />
          <Text className="ml-2 text-[#292C33] font-medium">
            Add Payment Option
          </Text>
        </TouchableOpacity>

        {route?.params?.paymentHistory?.length > 0 && (
          <>
            <Text className="text-base font-semibold mb-2">
              Payment History
            </Text>
            {route.params?.paymentHistory.map((item: any, index: number) => (
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

      {/* Update Payment Button */}
      <TouchableOpacity
        className="bg-[#D1853A] py-3 rounded-lg items-center mt-auto mb-10"
        disabled={paymentData?.length === 0}
        onPress={handleUpdatePayment}>
        <Text className="text-white font-semibold text-base">
          Update Payment
        </Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentScreen;
