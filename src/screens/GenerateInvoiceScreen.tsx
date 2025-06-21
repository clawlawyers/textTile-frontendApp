/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { moderateScale, scale, verticalScale } from '../utils/scaling';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setBillingFrom,
  setBillingTo,
  setBillingDetails,
  setInvoiceNumber,
  setLoading,
  setError,
  resetInvoice,
} from '../redux/customInvoiceSlice';
import { setCurrentClient } from '../redux/commonSlice';
import { useFocusEffect } from '@react-navigation/native';

type AccountStackParamList = {
  GenerateInvoiceScreen: undefined;
  InvoiceItemsScreen: {
    invoiceStatus?: string;
  };
  InvoicePaymentScreen: {
    orderId?: string;
    invoiceStatus?: string;
  };
  InvoiceDetailsScreen: {
    orderId?: string;
    invoiceStatus?: string;
  };
  LoginScreen: undefined;
  InvoicesScreen: undefined;
};

type GenerateInvoiceProps = NativeStackScreenProps<
  AccountStackParamList,
  'GenerateInvoiceScreen'
>;

const GenerateInvoiceScreen = ({ navigation }: GenerateInvoiceProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentClient = useSelector((state: RootState) => state.common.currentClient);
  const { loading, error, invoiceNumber } = useSelector(
    (state: RootState) => state.customInvoice
  );

  // State for form inputs
  const [billingFrom, setLocalBillingFrom] = useState({
    firmName: currentUser?.firmName || '',
    firmAddress: currentUser?.address || '',
    firmGstNumber: currentUser?.gstin || '',
  });
  const [billingTo, setLocalBillingTo] = useState({
    firmName: currentClient?.name || '',
    firmAddress: currentClient?.address || '',
    firmGstNumber: currentClient?.gstNumber || '',
    mobileNumber: currentClient?.phone || '',
  });
  const [billingDate, setBillingDate] = useState<Date | null>(new Date());
  const [billingDueDate, setBillingDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'billing' | 'due' | null>(null);
  const [localInvoiceNumber, setLocalInvoiceNumber] = useState<string>('A00001');

  const invoiceStatus = 'new';

 

  // Generate six-digit invoice number (A00000-Z99999)
  const generateInvoiceNumber = async (increment: boolean = false): Promise<string> => {
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
      const letter = String.fromCharCode(65 + Math.floor(counter / 100000));
      const number = (counter % 100000).toString().padStart(5, '0');
      const invoiceId = `${letter}${number}`;
      if (!/^[A-Z]\d{5}$/.test(invoiceId)) {
        throw new Error(`Invalid invoice ID format: ${invoiceId}`);
      }
      console.log(`Generated invoiceNumber: ${invoiceId} (counter: ${counter})`);
      return invoiceId;
    } catch (error: any) {
      console.error('Error generating invoice number:', error);
      throw new Error(`Failed to generate invoice number: ${error.message}`);
    }
  };

  // Initialize invoice number and billingFrom
  useEffect(() => {
    const initInvoiceNumber = async () => {
      try {
        const nextInvoiceId = await generateInvoiceNumber(false);
        setLocalInvoiceNumber(nextInvoiceId);
        if (!setInvoiceNumber) {
          throw new Error('setInvoiceNumber is undefined');
        }
        const invoiceAction = setInvoiceNumber(nextInvoiceId);
        if (!invoiceAction || !invoiceAction.type) {
          throw new Error('Invalid setInvoiceNumber action');
        }
        dispatch(invoiceAction);
        // Prefill billingFrom from currentUser
        if (currentUser && (currentUser.firmName || currentUser.address)) {
          setLocalBillingFrom({
            firmName: currentUser.firmName || '',
            firmAddress: currentUser.address || '',
            firmGstNumber: currentUser.gstin || '',
          });
          if (!setBillingFrom) {
            throw new Error('setBillingFrom is undefined');
          }
          const billingFromAction = setBillingFrom({
            firmName: currentUser.firmName || '',
            firmAddress: currentUser.address || '',
            firmGstNumber: currentUser.gstin || undefined,
          });
          if (!billingFromAction || !billingFromAction.type) {
            throw new Error('Invalid setBillingFrom action');
          }
          dispatch(billingFromAction);
        }
      } catch (error: any) {
        console.error('Initialization error:', error);
        dispatch(setError('Failed to initialize invoice number'));
      }
    };
    initInvoiceNumber();
  }, [dispatch, currentUser]);

  // Prefill billingTo from currentClient
  useEffect(() => {
    if (currentClient) {
      setLocalBillingTo({
        firmName: currentClient.name || '',
        firmAddress: currentClient.address || '',
        firmGstNumber: currentClient.gstNumber || '',
        mobileNumber: currentClient.phone || '',
      });
      if (!setBillingTo) {
        console.error('setBillingTo is undefined');
        Alert.alert('Error', 'setBillingTo is undefined');
        return;
      }
      const billingToAction = setBillingTo({
        firmName: currentClient.name || '',
        firmAddress: currentClient.address || '',
        firmGstNumber: currentClient.gstNumber || undefined,
        mobileNumber: currentClient.phone ? Number(currentClient.phone) : undefined,
      });
      if (!billingToAction || !billingToAction.type) {
        console.error('Invalid setBillingTo action:', billingToAction);
        return;
      }
      dispatch(billingToAction);
    }
  }, [currentClient, dispatch]);

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

    // Validate required fields
    if (
      !billingFrom.firmName ||
      !billingFrom.firmAddress ||
      !billingTo.firmName ||
      !billingTo.firmAddress ||
      !billingTo.mobileNumber ||
      !billingDate ||
      !billingDueDate
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    dispatch(setLoading(true));

    try {
      // Generate new invoice number
      const newInvoiceNumber = await generateInvoiceNumber(true);

      // Store data in Redux
      const actions = [
        setInvoiceNumber ? setInvoiceNumber(newInvoiceNumber) : undefined,
        setBillingFrom
          ? setBillingFrom({
              firmName: billingFrom.firmName,
              firmAddress: billingFrom.firmAddress,
              firmGstNumber: billingFrom.firmGstNumber || undefined,
            })
          : undefined,
        setBillingTo
          ? setBillingTo({
              firmName: billingTo.firmName,
              firmAddress: billingTo.firmAddress,
              firmGstNumber: billingTo.firmGstNumber || undefined,
              mobileNumber: Number(billingTo.mobileNumber),
            })
          : undefined,
        setBillingDetails
          ? setBillingDetails({
              billingDate: billingDate.toISOString(),
              billingDueDate: billingDueDate.toISOString(),
            })
          : undefined,
        setCurrentClient
          ? setCurrentClient({
              name: billingTo.firmName,
              address: billingTo.firmAddress,
              gstNumber: billingTo.firmGstNumber,
              phone: billingTo.mobileNumber,
            })
          : undefined,
      ];

      actions.forEach((action, index) => {
        if (!action || !action.type) {
          console.error(`Invalid action at index ${index}:`, action);
          throw new Error(`Invalid action at index ${index}`);
        }
        console.log(`Dispatching action ${index}:`, action);
        dispatch(action);
      });

      // Log Redux state for debugging
      console.log('Redux state after dispatch:', {
        invoiceNumber: newInvoiceNumber,
        billingFrom,
        billingTo,
        billingDetails: {
          billingDate: billingDate?.toISOString(),
          billingDueDate: billingDueDate?.toISOString(),
        },
      });

      // Navigate to InvoiceItemsScreen
      navigation.navigate('InvoiceItemsScreen', {
        invoiceStatus,
      });

      Alert.alert('Success', 'Proceeding to add invoice items');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      dispatch(setError(error.message || 'Failed to save invoice data'));
      Alert.alert('Error', `Failed to save invoice: ${error.message}`);
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
      dispatch(setLoading(false));
    }
  };
  useFocusEffect(
    useCallback(() => {
      console.log('GenerateInvoiceScreen focused, resetting invoice state');
      dispatch(resetInvoice());
      return () => {
        console.log('GenerateInvoiceScreen unfocused');
      };
    }, [dispatch])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FBDBB5]">
      <View
        style={{
          height: verticalScale(170),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#292C33',
          marginBottom: 10,
          paddingVertical: verticalScale(10),
        }}
      >  <View className='flex-1 justify-center'
      style={{padding:moderateScale(10)}}>
        <View className="flex-row flex-1 justify-between w-full items-center ">
          <TouchableOpacity
            onPress={() => navigation.navigate('InvoicesScreen')}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
          >
            <Icon name="home" size={20} color="#FBDBB5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveInvoice}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
            disabled={loading}
          >
            <Icon name="download" size={20} color="#FBDBB5" />
          </TouchableOpacity>
        </View>
        <View className=" flex-1 items-center justify-center align-center ">
          <Text style={styles.title}>Create New Invoice</Text>
          <Text style={styles.invoiceNumber}>Invoice ID: {invoiceNumber || localInvoiceNumber}</Text>
        </View>
      </View>
      </View>

      <ScrollView style={styles.section}>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-2">
          <Text style={styles.label}>Billing From:</Text>
          <TextInput
            style={styles.input}
            value={billingFrom.firmName}
            onChangeText={(text) => setLocalBillingFrom({ ...billingFrom, firmName: text })}
            placeholder="Firm Name"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmAddress}
            onChangeText={(text) => setLocalBillingFrom({ ...billingFrom, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmGstNumber}
            onChangeText={(text) => setLocalBillingFrom({ ...billingFrom, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-2">
          <Text style={styles.label}>Billing To:</Text>
          <TextInput
            style={styles.input}
            value={billingTo.firmName}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, firmName: text })}
            placeholder="Firm Name"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmAddress}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmGstNumber}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
          />
          <TextInput
            style={styles.input}
            value={billingTo.mobileNumber}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, mobileNumber: text })}
            placeholder="Phone Number"
            placeholderTextColor="#FFF"
            keyboardType="phone-pad"
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
      </ScrollView>
      <View className="bg-[#FBDBB5] "
      style={{padding:moderateScale(8)}}>
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-[#292C33] rounded-lg justify-center py-2 mb-4 flex-1"
            style={{ height: verticalScale(45) }}
            onPress={() => {
              if (
                !billingFrom.firmName ||
                !billingFrom.firmAddress ||
                !billingTo.firmName ||
                !billingTo.firmAddress ||
                !billingTo.mobileNumber ||
                !billingDate ||
                !billingDueDate
              ) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
              }
              if (!setBillingFrom || !setBillingTo || !setBillingDetails) {
                console.error('Action creators missing:', {
                  setBillingFrom,
                  setBillingTo,
                  setBillingDetails,
                });
                Alert.alert('Error', 'Action creators are undefined');
                return;
              }
              const actions = [
                setBillingFrom({
                  firmName: billingFrom.firmName,
                  firmAddress: billingFrom.firmAddress,
                  firmGstNumber: billingFrom.firmGstNumber || undefined,
                }),
                setBillingTo({
                  firmName: billingTo.firmName,
                  firmAddress: billingTo.firmAddress,
                  firmGstNumber: billingTo.firmGstNumber || undefined,
                  mobileNumber: Number(billingTo.mobileNumber),
                }),
                setBillingDetails({
                  billingDate: billingDate.toISOString(),
                  billingDueDate: billingDueDate.toISOString(),
                }),
              ];
              actions.forEach((action, index) => {
                if (!action || !action.type) {
                  console.error(`Invalid action at index ${index}:`, action);
                  Alert.alert('Error', `Invalid action at index ${index}`);
                  return;
                }
                console.log(`Dispatching action ${index}:`, action);
                dispatch(action);
              });
              // Log Redux state for debugging
              console.log('Redux state after dispatch:', {
                invoiceNumber,
                billingFrom,
                billingTo,
                billingDetails: {
                  billingDate: billingDate?.toISOString(),
                  billingDueDate: billingDueDate?.toISOString(),
                },
              });
              navigation.navigate('InvoiceItemsScreen', {
                invoiceStatus,
              });
            }}
          >
            <Text className="text-center text-white text-lg font-bold">
              Invoice Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#DB9245] rounded-lg py-2 mb-4 flex-1 justify-center"
            style={{ height: verticalScale(45) }}
            onPress={handleSaveInvoice}
            disabled={loading}
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
          
        />
      )}
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
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
    flex:1,
    marginBottom: verticalScale(2),
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(12),
    
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