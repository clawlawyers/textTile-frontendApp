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
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale } from '../utils/scaling';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { AccountStackParamList } from '../stacks/Account';
import { NODE_API_ENDPOINT } from '../utils/util';
import {
  setBillingFrom,
  setBillingTo,
  setBillingDetails,
  setInvoiceNumber,
} from '../redux/customInvoiceSlice';
import RNFetchBlob from 'rn-fetch-blob';

type ActiveInvoiceProps = NativeStackScreenProps<
  AccountStackParamList,
  'ActiveInvoiceScreen'
>;

const ActiveInvoiceScreen = ({ navigation, route }: ActiveInvoiceProps) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const invoiceState = useSelector((state: RootState) => state.customInvoice);
  const { invoice } = route.params;

  // Initialize state from Redux or route params
  const [billingFrom, setLocalBillingFrom] = useState({
    firmName: invoice.billingFrom.firmName,
    firmAddress: invoice.billingFrom.firmAddress,
    firmGstNumber: invoice.billingFrom.firmGstNumber || '',
  });
  const [downloading, setDownloading] = useState(false);
  const [billingTo, setLocalBillingTo] = useState({
    firmName: invoice.billingTo.firmName,
    firmAddress: invoice.billingTo.firmAddress,
    firmGstNumber: invoice.billingTo.firmGstNumber || '',
    mobileNumber: Number(invoice.billingTo.mobileNumber) || 0, // Ensure it's a number, default to 0 if invalid
  });
  const [billingDate, setLocalBillingDate] = useState<Date | null>(
    invoice.billingDetails.billingDate ? new Date(invoice.billingDetails.billingDate) : null,
  );
  const [billingDueDate, setLocalBillingDueDate] = useState<Date | null>(
    invoice.billingDetails.billingDueDate ? new Date(invoice.billingDetails.billingDueDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'billing' | 'due' | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate if invoice is completed by summing payments
  const totalPaidAmount = invoice.payments.reduce(
    (sum: number, payment: { amount: number }) => sum + (payment.amount || 0),
    0,
  );
  const isCompleted = totalPaidAmount >= invoice.totalAmount;

  // Sync local state with Redux on mount
  useEffect(() => {
    dispatch(setInvoiceNumber(invoice._id));
    dispatch(
      setBillingFrom({
        firmName: invoice.billingFrom.firmName,
        firmAddress: invoice.billingFrom.firmAddress,
        firmGstNumber: invoice.billingFrom.firmGstNumber || undefined,
      }),
    );
    dispatch(
      setBillingTo({
        firmName: invoice.billingTo.firmName,
        firmAddress: invoice.billingTo.firmAddress,
        firmGstNumber: invoice.billingTo.firmGstNumber || undefined,
        mobileNumber: Number(invoice.billingTo.mobileNumber) || 0,
      }),
    );
    dispatch(
      setBillingDetails({
        billingDate: invoice.billingDetails.billingDate,
        billingDueDate: invoice.billingDetails.billingDueDate,
      }),
    );
  }, [dispatch, invoice]);

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
        setLocalBillingDate(selectedDate);
        if (billingDueDate && selectedDate > billingDueDate) {
          setLocalBillingDueDate(null);
        }
      } else if (datePickerMode === 'due') {
        if (billingDate && selectedDate < billingDate) {
          Alert.alert('Error', 'Due date must be after billing date');
          return;
        }
        setLocalBillingDueDate(selectedDate);
      }
      setDatePickerMode(null);
    }
  };

  const handleCalendarPress = (mode: 'billing' | 'due') => {
    if (isCompleted) return;
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  // Validate and update mobileNumber
  const handleMobileNumberChange = (text: string) => {
    // Allow only numeric input
    if (!/^\d*$/.test(text)) {
      Alert.alert('Error', 'Mobile number must contain only digits');
      return;
    }

    // Convert to number and update state
    const mobileNumber = text ? Number(text) : 0; // If empty, set to 0
    setLocalBillingTo({ ...billingTo, mobileNumber });
  };

  const handleSaveInvoice = async () => {
    if (loading || isCompleted) return;

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

    // Validate mobileNumber
    if (!billingTo.mobileNumber || String(billingTo.mobileNumber).length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number (at least 10 digits)');
      return;
    }

    if (!currentUser?.token) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      navigation.navigate('LoginScreen');
      return;
    }

    setLoading(true);

    // Update Redux store
    dispatch(setBillingFrom(billingFrom));
    dispatch(setBillingTo(billingTo));
    dispatch(
      setBillingDetails({
        billingDate: billingDate.toISOString(),
        billingDueDate: billingDueDate.toISOString(),
      }),
    );

    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/custom-orders/${invoice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          billingFrom,
          billingTo: {
            ...billingTo,
            mobileNumber: Number(billingTo.mobileNumber), // Ensure it's a number
          },
          billingDetails: {
            billingDate: billingDate.toISOString(),
            billingDueDate: billingDueDate.toISOString(),
          },
        }),
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

      Alert.alert('Success', 'Invoice updated successfully');
    } catch (error) {
      console.error('Error updating invoice:', error);
      Alert.alert('Error', `Failed to update invoice: ${error.message}`);
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
          

  return (
    <View className="flex-1 bg-[#FBDBB5]">
      <View
        style={{
          height: verticalScale(170),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#292C33',
          marginBottom: verticalScale(14),
          paddingVertical: verticalScale(10),
        }}
      >
        <View className="flex-row justify-between px-8 pt-10 w-full items-center mb-8">
          <TouchableOpacity
            onPress={() => navigation.replace('PreviousInvoiceScreen')}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
          >
            <Icon name="home" size={20} color="#FBDBB5" />
          </TouchableOpacity>
          {isCompleted ? (
            <TouchableOpacity
              onPress={handleDownloadInvoice}
              className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
              disabled={loading}
            >
              <Icon name="download" size={20} color="#FBDBB5" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSaveInvoice}
              className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
              disabled={loading}
            >
              <Icon name="content-save" size={20} color="#FBDBB5" />
            </TouchableOpacity>
          )}
        </View>
        <View className="justify-center items-center align-center pb-2">
          <Text style={styles.title}>{isCompleted ? 'View Invoice' : 'Edit Invoice'}</Text>
          <Text style={styles.invoiceNumber}>Invoice ID: {invoice._id}</Text>
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
            editable={!isCompleted}
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmAddress}
            onChangeText={(text) => setLocalBillingFrom({ ...billingFrom, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
            editable={!isCompleted}
          />
          <TextInput
            style={styles.input}
            value={billingFrom.firmGstNumber}
            onChangeText={(text) => setLocalBillingFrom({ ...billingFrom, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
            editable={!isCompleted}
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
            editable={!isCompleted}
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmAddress}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, firmAddress: text })}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
            editable={!isCompleted}
          />
          <TextInput
            style={styles.input}
            value={billingTo.firmGstNumber}
            onChangeText={(text) => setLocalBillingTo({ ...billingTo, firmGstNumber: text })}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
            editable={!isCompleted}
          />
          <TextInput
            style={styles.input}
            value={billingTo.mobileNumber ? billingTo.mobileNumber.toString() : ''}
            onChangeText={handleMobileNumberChange}
            placeholder="Phone Number"
            placeholderTextColor="#FFF"
            editable={!isCompleted}
            keyboardType="phone-pad"
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3">
          <Text style={styles.label}>Billing Details:</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handleCalendarPress('billing')}
            disabled={isCompleted}
          >
            <Text style={{ color: billingDate ? '#FFF' : '#FFF', fontSize: 14 }}>
              {formatDate(billingDate)}
            </Text>
            <Icon name="calendar" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handleCalendarPress('due')}
            disabled={isCompleted}
          >
            <Text style={{ color: billingDueDate ? '#FFF' : '#FFF', fontSize: 14 }}>
              {formatDate(billingDueDate)}
            </Text>
            <Icon name="calendar" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View className="bg-[#FBDBB5] px-4 py-3">
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-[#292C33] rounded-lg justify-center py-3 mb-4 flex-1"
            style={{ height: verticalScale(45) }}
            onPress={() => {
              navigation.navigate('ActiveInvoiceItems', { invoice });
            }}
          >
            <Text className="text-center text-white text-lg font-bold">
              Invoice Items
            </Text>
          </TouchableOpacity>
          {isCompleted ? (
            <TouchableOpacity
              className="bg-[#DB9245] rounded-lg py-3 mb-4 flex-1 justify-center"
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
              className="bg-[#DB9245] rounded-lg py-3 mb-4 flex-1 justify-center"
              style={{ height: verticalScale(45) }}
              onPress={handleSaveInvoice}
              disabled={loading}
            >
              <Text className="text-center text-white font-bold text-lg">
                {loading ? 'Saving...' : 'Save Invoice'}
              </Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 'auto',
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(12),
    marginTop: verticalScale(1),
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

export default ActiveInvoiceScreen;