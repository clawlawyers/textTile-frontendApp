/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale } from '../utils/scaling';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type Item = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type AccountStackParamList = {
  GenerateInvoiceScreen: undefined;
  InvoiceItemsScreen: {
    orderId?: string;
    invoiceStatus?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    cartProducts?: Item[];
    paymentDetails?: any;
    paymentHistory?: any[];
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
    testOrderId?: string;
  };
  InvoicePaymentScreen: {
    invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    paymentDetails?: any;
    paymentHistory?: any[];
    cartProducts?: Item[];
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
  };
  InvoiceDetailsScreen: {
    invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    paymentDetails?: any;
    paymentHistory?: any[];
    cartProducts?: Item[];
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
  };
  LoginScreen: undefined;
};

type GenerateInvoiceProps = NativeStackScreenProps<
  AccountStackParamList,
  'GenerateInvoiceScreen'
>;

const GenerateInvoiceScreen = ({ navigation }: GenerateInvoiceProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // State for form inputs
  const [billingFrom, setBillingFrom] = useState({
    firmName: '',
    firmAddress: '',
    firmGstNumber: '',
  });
  const [billingTo, setBillingTo] = useState({
    firmName: '',
    firmAddress: '',
    firmGstNumber: '',
  });
  const [billingDate, setBillingDate] = useState<Date | null>(null);
  const [billingDueDate, setBillingDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'billing' | 'due' | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('A00001');

  const invoiceStatus = 'new';

  // Generate six-digit order ID (A00000-Z99999)
  const generateOrderId = async (increment: boolean = false): Promise<string> => {
    try {
      const key = 'invoice_counter';
      let counter = parseInt(await AsyncStorage.getItem(key) || '0', 10);
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

  // Initialize invoice number
  useEffect(() => {
    const initInvoiceNumber = async () => {
      try {
        const nextOrderId = await generateOrderId(false);
        setInvoiceNumber(nextOrderId);
        console.log(`Initialized invoiceNumber: ${nextOrderId}`);
      } catch (error) {
        console.error('Error initializing invoice number:', error);
        Alert.alert('Error', 'Failed to initialize invoice number');
      }
    };
    initInvoiceNumber();
  }, []);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setDatePickerMode(null);
      return;
    }
    if (selectedDate && datePickerMode) {
      if (datePickerMode === 'billing') {
        setBillingDate(selectedDate);
        if (billingDueDate && selectedDate > billingDueDate) {
          setBillingDueDate(null);
        }
      } else if (datePickerMode === 'due') {
        if (billingDate && selectedDate < billingDate) {
          Alert.alert('Error', 'Due date must be after billing date');
          return;
        }
        setBillingDueDate(selectedDate);
      }
      setDatePickerMode(null);
    }
  };

  const handleCalendarPress = (mode: 'billing' | 'due') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleSaveInvoice = async () => {
    if (loading) return;

    // Check if invoice is new
    if (invoiceStatus === 'new') {
      Alert.alert('Error', 'GST and discount can\'t be empty');
      return;
    }

    // Validate required fields
    if (
      !billingFrom.firmName ||
      !billingFrom.firmAddress ||
      !billingFrom.firmGstNumber ||
      !billingTo.firmName ||
      !billingTo.firmAddress ||
      !billingTo.firmGstNumber ||
      !billingDate ||
      !billingDueDate
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return;
    }

    setLoading(true);

    try {
      // Generate new order ID
      const newOrderId = await generateOrderId(true);
      const newInvoiceNumber = newOrderId;

      setOrderId(newOrderId);
      setInvoiceNumber(newInvoiceNumber);

      // Navigate to InvoiceItemsScreen with billing details and initial params
      navigation.navigate('InvoiceItemsScreen', {
        invoiceStatus,
        orderId: newOrderId,
        invoiceNumber: newInvoiceNumber,
        billingDetails: {
          billTo: billingTo.firmName,
          billToGSTIN: billingTo.firmGstNumber,
          billToAddress: billingTo.firmAddress,
          billingFrom: billingFrom.firmName,
          billingFromGSTIN: billingFrom.firmGstNumber,
          billingFromAddress: billingFrom.firmAddress,
          date: billingDate ? billingDate.toISOString() : '',
          duedate: billingDueDate ? billingDueDate.toISOString() : '',
          amountPaid: '0',
        },
        cartProducts: [],
        paymentDetails: { totalAmount: '0', dueAmount: '0', payments: [] },
        paymentHistory: [],
        discountValue: '0',
        discountMode: 'percent',
        gstValue: '0',
      });

      Alert.alert('Success', 'Proceeding to add invoice items');
    } catch (error) {
      console.error('Error generating order ID:', error);
      Alert.alert('Error', `Failed to proceed: ${error.message}`);
      // Revert counter on failure
      try {
        const key = 'invoice_counter';
        let counter = parseInt(await AsyncStorage.getItem(key) || '0', 10);
        if (counter > 0) {
          await AsyncStorage.setItem(key, (counter - 1).toString());
          console.log(`Reverted counter to: ${counter - 1}`);
        }
      } catch (revertError) {
        console.error('Error reverting counter:', revertError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FBDBB5]">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#292C33',
          marginBottom: 16,
          paddingVertical: verticalScale(10),
        }}
      >
        <View className="flex-row justify-between px-8 pt-10 w-full items-center mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('InvoicesScreen')}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
          >
            <Icon name="home" size={20} color="#FBDBB5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveInvoice}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
            disabled={invoiceStatus === 'new' || loading}
          >
            <Icon name="download" size={20} color="#FBDBB5" />
          </TouchableOpacity>
        </View>
        <View className="pb-1 pt-3">
          <Text style={styles.title}>Create New Invoice</Text>
          <Text style={styles.invoiceNumber}>Invoice ID: {invoiceNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-2">
          <Text style={styles.label}>Billing From:</Text>
          <TextInput
            style={styles.input}
            value={billingFrom.firmName}
            onChangeText={(text) => setBillingFrom({ ...billingFrom, firmName: text })}
            placeholder="Firm Name"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmAddress}
            onChangeText={(text) => setBillingFrom({ ...billingFrom, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmGstNumber}
            onChangeText={(text) => setBillingFrom({ ...billingFrom, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-2">
          <Text style={styles.label}>Billing To:</Text>
          <TextInput
            style={styles.input}
            value={billingTo.firmName}
            onChangeText={(text) => setBillingTo({ ...billingTo, firmName: text })}
            placeholder="Firm Name"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmAddress}
            onChangeText={(text) => setBillingTo({ ...billingTo, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmGstNumber}
            onChangeText={(text) => setBillingTo({ ...billingTo, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3">
          <Text style={styles.label}>Billing Details:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handleCalendarPress('billing')}
          >
            <Text style={{ color: billingDate ? '#FFF' : '#FFF', fontSize: 14 }}>
              {formatDate(billingDate)}
            </Text>
            <Icon name="calendar" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handleCalendarPress('due')}
          >
            <Text style={{ color: billingDueDate ? '#FFF' : '#FFF', fontSize: 14 }}>
              {formatDate(billingDueDate)}
            </Text>
            <Icon name="calendar" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="bg-[#FBDBB5] px-4 py-3">
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-[#292C33] rounded-lg justify-center py-3 mb-4 flex-1"
            style={{ height: verticalScale(45) }}
            onPress={() => {
              navigation.navigate('InvoiceItemsScreen', {
                invoiceStatus,
                orderId: orderId || undefined,
                invoiceNumber,
                billingDetails: {
                  billTo: billingTo.firmName,
                  billToGSTIN: billingTo.firmGstNumber,
                  billToAddress: billingTo.firmAddress,
                  billingFrom: billingFrom.firmName,
                  billingFromGSTIN: billingFrom.firmGstNumber,
                  billingFromAddress: billingFrom.firmAddress,
                  date: billingDate ? billingDate.toISOString() : '',
                  duedate: billingDueDate ? billingDueDate.toISOString() : '',
                  amountPaid: '0',
                },
                cartProducts: [],
                paymentDetails: { totalAmount: '0', dueAmount: '0', payments: [] },
                paymentHistory: [],
                discountValue: '0',
                discountMode: 'percent',
                gstValue: '0',
              });
            }}
          >
            <Text className="text-center text-white text-lg font-bold">
              Invoice Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#DB9245] rounded-lg py-3 mb-4 flex-1 justify-center"
            style={{ height: verticalScale(45) }}
            onPress={handleSaveInvoice}
            disabled={invoiceStatus === 'new' || loading}
          >
            <Text className="text-center text-white font-bold text-lg">
              {loading ? 'Saving...' : 'Save Invoice'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'billing' ? billingDate || new Date() : billingDueDate || new Date()}
          mode="date"
          display={Platform.OS === 'android' ? 'default' : 'inline'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  invoiceNumber: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: verticalScale(80),
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(8),
  },
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
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default GenerateInvoiceScreen;