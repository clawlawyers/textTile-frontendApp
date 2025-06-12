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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { NODE_API_ENDPOINT } from '../utils/util';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

type GenerateInvoiceProps = NativeStackScreenProps<
  AccountStackParamList,
  'GenerateInvoiceScreen'
>;

interface Item {
  name: string;
  price: number;
  quantity: number;
  gst: number;
  discount: number;
  discountType: 'percentage' | 'rupees';
}

const GenerateInvoiceScreen = ({ navigation, route }: GenerateInvoiceProps) => {
  const [billTo, setBillTo] = useState<string>('');
  const [billToGSTIN, setBillToGSTIN] = useState<string>('');
  const [billingFrom, setBillingFrom] = useState<string>('');
  const [billingFromGSTIN, setBillingFromGSTIN] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [duedate, setDueDate] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [billToAddress, setBillToAddress] = useState<string>('');
  const [billingFromAddress, setBillingFromAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const invoiceStatus = route.params?.invoiceStatus || 'new';
  const orderId = route.params?.orderId; // Renamed from invoiceId to orderId

  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Validate orderId
  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  if (!orderId || !isValidObjectId(orderId)) {
    Alert.alert('Error', 'Invalid Order ID. Please try again.');
    navigation.goBack();
    return null;
  }

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (invoiceStatus === 'new') {
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/orders/custom-invoice/latest-invoice-number`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 401) {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            navigation.navigate('LoginScreen');
            return;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch latest invoice number: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          console.log('Fetched latest invoice number:', data); // Debug log
          setInvoiceNumber(data.invoiceNumber || 'INV-2025-001'); // Fallback in case of failure
        } catch (error) {
          console.error('Error fetching invoice number:', error);
          Alert.alert('Error', 'Failed to fetch invoice number. Using default value.');
          setInvoiceNumber('INV-2025-001'); // Fallback
        }

        // Set default dates for new invoices
        setDate(new Date().toISOString());
        setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
      } else {
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/orders/custom-invoice/${orderId}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 401) {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            navigation.navigate('LoginScreen');
            return;
          }

          if (response.status === 404) {
            Alert.alert('Error', 'Order not found. Please create the order first.');
            navigation.goBack();
            return;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch invoice details: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          console.log('Fetched invoice details:', data); // Debug log
          setBillTo(data.clientDetails.name || '');
          setBillToGSTIN(data.clientDetails.firmGSTNumber || '');
          setBillToAddress(data.clientDetails.address || '');
          setBillingFrom(data.clientDetails.firmName || '');
          setBillingFromAddress(data.clientDetails.billingFromAddress || '');
          setBillingFromGSTIN(data.clientDetails.billingFromGSTIN || '');
          setDate(data.invoiceDate || '');
          setDueDate(data.dueDate || '');
          setItems(
            data.products?.map((prod: any) => ({
              name: prod.inventoryProduct?.bail_number || 'Unknown Product',
              price: prod.unitPrice || 0,
              quantity: prod.quantity || 0,
              gst: 18,
              discount: 0,
              discountType: 'percentage' as 'percentage' | 'rupees',
            })) || []
          );
          setAmountPaid(data.paidAmount?.toString() || '0');
          setInvoiceNumber(data.invoiceNumber || 'INV-2025-001');
        } catch (error) {
          console.error('Error fetching invoice details:', error);
          Alert.alert('Error', 'Failed to fetch invoice details');
        }
      }
    };

    if (!currentUser?.token) {
      Alert.alert('Error', 'Authentication token is missing. Please log in again.');
      navigation.navigate('LoginScreen');
      return;
    }

    loadInvoiceData();
  }, [invoiceStatus, orderId, currentUser?.token, navigation]);

  const calculateItemTotal = (item: Item) => {
    const baseTotal = item.price * item.quantity;
    const gstAmount = (baseTotal * item.gst) / 100;
    let discountAmount = item.discount;

    if (item.discountType === 'percentage') {
      discountAmount = (baseTotal * item.discount) / 100;
    }

    return baseTotal + gstAmount - discountAmount;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const saveInvoice = async () => {
    if (!billTo || !billToGSTIN || !billingFrom || !billingFromGSTIN || !date || !duedate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (invoiceStatus === 'completed') {
      Alert.alert('Info', 'This invoice is completed and cannot be edited.');
      return;
    }

    setLoading(true);

    const total = calculateGrandTotal();
    const paidAmountValue = parseFloat(amountPaid || '0');
    const status = paidAmountValue >= total ? 'completed' : 'active';

    const payload = {
      clientDetails: {
        name: billTo,
        firmName: billingFrom,
        address: billToAddress,
        firmGSTNumber: billToGSTIN,
        billingFromAddress: billingFromAddress,
        billingFromGSTIN: billingFromGSTIN,
      },
      customProducts: items.map(item => ({
        inventoryProduct: '60d5ec49f8c7b00015e4a1b2', // Replace with actual product ID
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: total,
      paidAmount: paidAmountValue,
      dueAmount: Math.max(0, total - paidAmountValue),
      paymentStatus: status === 'completed' ? 'completed' : 'pending',
      notes: 'This invoice reflects a special agreement.',
      forceGenerate: true,
      invoiceNumber: invoiceNumber,
      invoiceDate: date,
      dueDate: duedate,
    };

    try {
      const endpoint = `${NODE_API_ENDPOINT}/orders/custom-invoice/${orderId}`;
      const method = invoiceStatus === 'new' ? 'POST' : 'PATCH';

      console.log('Saving invoice with payload:', JSON.stringify(payload, null, 2)); // Debug log

      const saveResponse = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (saveResponse.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }

      if (saveResponse.status === 404) {
        Alert.alert('Error', 'Order not found. Please create the order first.');
        navigation.goBack();
        return;
      }

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(
          `Failed to ${invoiceStatus === 'new' ? 'create' : 'update'} invoice: ${saveResponse.status} ${errorText}`
        );
      }

      // Generate PDF
      console.log('Generating PDF for invoice:', invoiceNumber); // Debug log
      const generateResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
        },
        body: JSON.stringify(payload),
      });

      if (generateResponse.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }

      if (generateResponse.status === 404) {
        Alert.alert('Error', 'Order not found. Please create the order first.');
        navigation.goBack();
        return;
      }

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

      Alert.alert(
        'Success',
        `Invoice ${invoiceNumber} ${invoiceStatus === 'new' ? 'created' : 'updated'} and PDF downloaded to ${path}`
      );

      setLoading(false);
      navigation.goBack();
    } catch (error: any) {
      setLoading(false);
      console.error('Error processing invoice:', error);
      Alert.alert('Error', error.message || 'Failed to process invoice');
    }
  };

  const isEditable = invoiceStatus !== 'completed';

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
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
            disabled={!isEditable}
          >
            <Icon name="home" size={20} color="#FBDBB5" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveInvoice}
            className="w-10 h-10 rounded-full border bg-[#DB9245] justify-center items-center"
            disabled={!isEditable || loading}
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
            value={billingFrom}
            onChangeText={setBillingFrom}
            placeholder="Firm Name"
            placeholderTextColor="#FFFF"
            editable={isEditable}
          />
          <TextInput
            style={styles.input}
            value={billingFromAddress}
            onChangeText={setBillingFromAddress}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
            editable={isEditable}
          />
          <TextInput
            style={styles.input}
            value={billingFromGSTIN}
            onChangeText={setBillingFromGSTIN}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
            editable={isEditable}
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-2">
          <Text style={styles.label}>Billing To:</Text>
          <TextInput
            style={styles.input}
            value={billTo}
            onChangeText={setBillTo}
            placeholder="Firm Name"
            placeholderTextColor="#FFF"
            editable={isEditable}
          />
          <TextInput
            style={styles.input}
            value={billToAddress}
            onChangeText={setBillToAddress}
            placeholder="Firm Address"
            placeholderTextColor="#FFF"
            editable={isEditable}
          />
          <TextInput
            style={styles.input}
            value={billToGSTIN}
            onChangeText={setBillToGSTIN}
            placeholder="Enter GSTIN number"
            placeholderTextColor="#FFF"
            editable={isEditable}
          />
        </View>
        <View className="bg-[#DB9245] rounded-lg px-4 py-3">
          <Text style={styles.label}>Billing Details:</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Enter Billing Date"
            placeholderTextColor="#fff"
            editable={isEditable}
          />
          <TextInput
            style={styles.input}
            value={duedate}
            onChangeText={setDueDate}
            placeholder="Enter Billing Due Date"
            placeholderTextColor="#fff"
            editable={isEditable}
          />
        </View>
      </View>
      <View className="bg-[#FBDBB5] px-4 py-3">
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-[#292C33] rounded-lg justify-center py-3 mb-4 flex-1"
            style={{ height: verticalScale(45) }}
            onPress={() =>
              navigation.navigate('InvoiceItemsScreen', {
                invoiceStatus,
                orderId, // Pass orderId instead of invoiceId
                invoiceNumber,
                billingDetails: {
                  billTo,
                  billToGSTIN,
                  billToAddress,
                  billingFrom,
                  billingFromGSTIN,
                  billingFromAddress,
                  date,
                  duedate,
                  amountPaid,
                },
              })
            }
            disabled={!isEditable}
          >
            <Text className="text-center text-white text-lg font-bold">
              Invoice Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#DB9245] rounded-lg py-3 mb-4 flex-1 justify-center"
            style={{ height: verticalScale(45) }}
            onPress={saveInvoice}
            disabled={loading || !isEditable}
          >
            <Text className="text-center text-white font-bold text-lg">
              {loading ? 'Saving...' : (invoiceStatus === 'new' ? 'Save Invoice' : 'Update Invoice')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
});

export default GenerateInvoiceScreen;