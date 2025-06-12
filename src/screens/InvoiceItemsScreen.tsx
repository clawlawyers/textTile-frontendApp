/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { NODE_API_ENDPOINT } from '../utils/util';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

type Item = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type InvoiceItemsProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoiceItemsScreen'
>;

const InvoiceItemScreen = ({ navigation, route }: InvoiceItemsProps) => {
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1');
  const [gstValue, setGstValue] = useState<string>('0');
  const [mode, setMode] = useState<'percent' | 'rupees'>('percent');
  const [value, setValue] = useState<string>('0');
  const [cartProducts, setCartProducts] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dueAmount, setDueAmount] = useState<number>(0);

  const invoiceStatus = route.params?.invoiceStatus || 'new';
  const invoiceId = route.params?.invoiceId || '60d5ec49f8c7b00015e4a1b1';
  const invoiceNumber = route.params?.invoiceNumber || '501';
  const billingDetails = route.params?.billingDetails || {};

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { width, height } = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const headerHeight = height * 0.15;
  const fontSize = isSmallDevice ? 10 : 12;

  const bottomButtonHeight = verticalScale(70);
  const formHeight = verticalScale(150);
  const tableHeaderHeight = verticalScale(40);
  const discountSectionHeight = verticalScale(40);
  const gstSectionHeight = verticalScale(40);
  const dueAmountHeight = verticalScale(50);
  const totalAmountHeight = verticalScale(50);
  const indicatorSectionHeight =
    discountSectionHeight +
    gstSectionHeight +
    dueAmountHeight +
    totalAmountHeight +
    verticalScale(8);
  const marginSpacing = verticalScale(24);

  const tableMaxHeight =
    height -
    (headerHeight +
      formHeight +
      tableHeaderHeight +
      indicatorSectionHeight +
      2 * bottomButtonHeight +
      marginSpacing);

  useEffect(() => {
    const loadItems = async () => {
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
            throw new Error('Failed to fetch invoice items');
          }

          const data = await response.json();
          const fetchedItems = data.customProducts?.map((prod: any) => ({
            id: `temp-${Date.now()}-${Math.random()}`,
            name: prod.inventoryProduct || 'Unknown Product',
            price: prod.unitPrice || 0,
            quantity: prod.quantity || 0,
          })) || [];
          setCartProducts(fetchedItems);
          setGstValue(data.gstPercentage?.toString() || '0');
          setValue(data.discount?.toString() || '0');
          setMode(data.discountType || 'percent');
          setDueAmount(data.dueAmount || 0);
        } catch (error) {
          console.error('Error fetching invoice items:', error);
          Alert.alert('Error', 'Failed to fetch invoice items');
        }
      }
    };

    loadItems();
  }, [invoiceStatus, invoiceId]);

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice || !newItemQuantity) {
      Alert.alert('Error', 'Please fill in all item details');
      return;
    }

    const newItem: Item = {
      id: `temp-${Date.now()}`,
      name: newItemName,
      quantity: parseInt(newItemQuantity, 10) || 1,
      price: parseFloat(newItemPrice) || 0,
    };

    setCartProducts([...cartProducts, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQuantity('1');
  };

  const calculateItemTotal = (item: Item) => {
    const baseTotal = item.price * item.quantity;
    const discountValue = parseFloat(value) || 0;
    let discountAmount = 0;
    if (mode === 'percent') {
      discountAmount = (baseTotal * discountValue) / 100;
    } else {
      discountAmount = discountValue / (cartProducts.length || 1);
    }

    const discountedTotal = baseTotal - discountAmount;
    const gstPercentage = parseFloat(gstValue) || 0;
    const gstAmount = (discountedTotal * gstPercentage) / 100;

    return discountedTotal + gstAmount;
  };

  const baseTotalPrice = useMemo(() => {
    return cartProducts.reduce((sum: number, item: Item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [cartProducts]);

  const discountAmount = useMemo(() => {
    const discountValue = parseFloat(value) || 0;
    if (mode === 'percent') {
      return (baseTotalPrice * discountValue) / 100;
    }
    return discountValue;
  }, [baseTotalPrice, value, mode]);

  const gstAmount = useMemo(() => {
    const gstPercentage = parseFloat(gstValue) || 0;
    return ((baseTotalPrice - discountAmount) * gstPercentage) / 100;
  }, [baseTotalPrice, discountAmount, gstValue]);

  const adjustedTotalPrice = useMemo(() => {
    return baseTotalPrice - discountAmount + gstAmount;
  }, [baseTotalPrice, discountAmount, gstAmount]);

  useEffect(() => {
    setDueAmount(adjustedTotalPrice);
  }, [adjustedTotalPrice]);

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setCartProducts(cartProducts.filter(item => item.id !== itemId));
        },
      },
    ]);
  };

  const handlePriceChange = (index: number, newPrice: string) => {
    const updatedProducts = [...cartProducts];
    updatedProducts[index] = {
      ...updatedProducts[index],
      price: parseFloat(newPrice) || 0,
    };
    setCartProducts(updatedProducts);
  };

  const handleConfirmOrder = async () => {
    if (invoiceStatus === 'completed') {
      Alert.alert('Info', 'This invoice is completed and cannot be edited.');
      return;
    }

    if (cartProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the invoice.');
      return;
    }

    setLoading(true);

    const payload = {
      clientDetails: {
        name: billingDetails.billTo || '',
        firmName: billingDetails.billingFrom || '',
        address: billingDetails.billToAddress || '',
        firmGSTNumber: billingDetails.billToGSTIN || '',
        billingFromAddress: billingDetails.billingFromAddress || '',
        billingFromGSTIN: billingDetails.billingFromGSTIN || '',
      },
      customProducts: cartProducts.map(item => ({
        inventoryProduct: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: adjustedTotalPrice,
      paidAmount: parseFloat(billingDetails.amountPaid || '0'),
      dueAmount: dueAmount,
      paymentStatus: parseFloat(billingDetails.amountPaid || '0') >= adjustedTotalPrice ? 'completed' : 'pending',
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

      Alert.alert(
        'Success',
        `Invoice ${invoiceNumber} ${invoiceStatus === 'new' ? 'created' : 'updated'} and PDF downloaded to ${path}`
      );

      setLoading(false);
      navigation.navigate('GenerateInvoiceScreen', { invoiceStatus, invoiceId, invoiceNumber });
    } catch (error: any) {
      setLoading(false);
      console.error('Error processing invoice:', error);
      Alert.alert('Error', error.message || 'Failed to process invoice');
    }
  };

  const isEditable = invoiceStatus !== 'completed';

  return (
    <SafeAreaView className="flex-1 bg-[#FBDBB5] pb-2">
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

      <View className="flex-1 mb-2">
        <View style={{ paddingTop: headerHeight + verticalScale(10) }}>
          <View className="bg-[#DB9245] rounded-lg px-4 py-3 mb-4 mx-4">
            <Text style={styles.label}>Add Item:</Text>
            <TextInput
              style={styles.input}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Item Name"
              placeholderTextColor="#FFF"
              editable={isEditable}
            />
            <View className="flex-row justify-between gap-2" style={{ paddingRight: scale(6) }}>
              <TextInput
                style={styles.input2}
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                placeholder="Quantity"
                placeholderTextColor="#FFF"
                keyboardType="numeric"
                editable={isEditable}
              />
              <TextInput
                style={styles.input2}
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                placeholder="Price"
                placeholderTextColor="#FFF"
                keyboardType="numeric"
                editable={isEditable}
              />
            </View>
            <TouchableOpacity
              className="bg-[#292C33] rounded-lg items-center mt-2"
              style={{ width: scale(320), paddingVertical: 12 }}
              onPress={handleAddItem}
              disabled={!isEditable}
            >
              <Text className="text-white font-medium">Add Item</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between mx-4">
            <Text style={{ fontSize, width: '25%' }} className="text-white font-semibold">
              Item Name
            </Text>
            <Text style={{ fontSize, width: '15%' }} className="text-white font-semibold text-center">
              Quantity
            </Text>
            <Text style={{ fontSize, width: '25%' }} className="text-white font-semibold text-center">
              Rate
            </Text>
            <Text style={{ fontSize, width: '25%' }} className="text-white font-semibold text-center">
              Amount
            </Text>
            <Text style={{ fontSize, width: '10%' }} className="text-white font-semibold text-center">
              Action
            </Text>
          </View>

          <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mx-4 mb-6">
            <ScrollView
              style={{ maxHeight: tableMaxHeight }}
              showsVerticalScrollIndicator={true}
            >
              {cartProducts.length === 0 ? (
                <Text className="text-white text-center py-4">No items added</Text>
              ) : (
                cartProducts.map((item, index) => (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between mb-3 py-1"
                  >
                    <Text style={{ fontSize, width: '25%' }} className="text-white text-wrap">
                      {item.name}
                    </Text>
                    <Text style={{ fontSize, width: '15%' }} className="text-white text-center">
                      {item.quantity}
                    </Text>
                    <View style={{ width: '25%' }} className="px-1">
                      <TextInput
                        style={{ fontSize }}
                        className="border border-white rounded-md px-2 py-1 text-white text-center"
                        value={item.price.toString()}
                        onChangeText={text => handlePriceChange(index, text)}
                        keyboardType="numeric"
                        editable={isEditable}
                      />
                    </View>
                    <Text style={{ fontSize, width: '25%' }} className="text-white text-center">
                      ₹{calculateItemTotal(item).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={{ width: '10%' }}
                      className="items-center"
                      onPress={() => handleRemoveItem(item.id)}
                      disabled={!isEditable}
                    >
                      <Icon name="trash-2" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View className="bg-[#FBDBB5] px-4">
            <View
              className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 mb-2"
              style={{ height: verticalScale(40) }}
            >
              <View className="flex-1">
                <Text className="text-sm text-[#E7CBA1] font-medium">Discount:</Text>
              </View>
              <View className="flex-1 flex-row bg-[#FBDBB5] rounded-md mr-2">
                <TouchableOpacity
                  onPress={() => setMode('percent')}
                  className={`flex-1 items-center justify-center rounded-md px-4 py-3 ${
                    mode === 'percent' ? 'bg-[#DB9245]' : ''
                  }`}
                  disabled={!isEditable}
                >
                  <Text className="text-sm font-medium text-black">%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode('rupees')}
                  className={`flex-1 items-center justify-center px-4 rounded-md ${
                    mode === 'rupees' ? 'bg-[#DB9245]' : ''
                  }`}
                  disabled={!isEditable}
                >
                  <Text className="text-sm font-medium text-black">₹</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center bg-[#FAD9B3] rounded-md w-[45%] px-4 h-[100%]">
                {mode === 'rupees' && <Text className="text-xs text-[#292C33] font-medium">₹</Text>}
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="0"
                  placeholderTextColor="black"
                  keyboardType="numeric"
                  className="text-[#000000] text-sm font-medium flex-1 text-right leading-[0.55rem]"
                  style={{ minWidth: 40 }}
                  editable={isEditable}
                />
                {mode === 'percent' && <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>}
                <Icon name="edit-2" size={14} color="#C7742D" style={{ marginLeft: 8 }} />
              </View>
            </View>

            <View
              className="flex-row items-center justify-between bg-[#292C33] rounded-lg px-4 py-1 mb-2"
              style={{ height: verticalScale(40) }}
            >
              <View className="flex-1">
                <Text className="text-sm text-[#E7CBA1] font-medium">GST Percentage:</Text>
              </View>
              <View className="flex-row items-center bg-[#FAD9B3] rounded-md px-3 w-[45%] h-[100%]">
                <TextInput
                  value={gstValue}
                  onChangeText={setGstValue}
                  placeholder="0"
                  placeholderTextColor="#000000"
                  keyboardType="numeric"
                  className="text-[#000000] text-sm font-medium text-right min-w-[40px] flex-1 leading-[0.55rem]"
                  editable={isEditable}
                />
                <Text className="text-sm text-[#292C33] font-medium ml-1">%</Text>
                <Icon name="edit-2" size={14} color="#C7742D" style={{ marginLeft: 8 }} />
              </View>
            </View>

            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
              <View className="bg-[#292C33] px-5 py-4">
                <Text className="text-white font-semibold">Due Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹ {dueAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between border border-black rounded-lg overflow-hidden mb-2">
              <View className="bg-[#292C33] px-4 py-4">
                <Text className="text-white font-semibold">Total Amount</Text>
              </View>
              <View className="px-4 py-3 flex-1">
                <Text className="text-right font-semibold text-base">
                  ₹ {adjustedTotalPrice.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-[#FBDBB5] px-4 py-2">
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center border bg-[#292C33]"
                onPress={() =>
                  navigation.navigate('InvoicePaymentScreen', {
                    invoiceStatus,
                    invoiceId,
                    invoiceNumber,
                    billingDetails,
                    paymentDetails: {
                      totalAmount: adjustedTotalPrice.toLocaleString('en-IN'),
                      dueAmount: dueAmount.toLocaleString('en-IN'),
                      payments: [], // Initial payments array
                    },
                    paymentHistory: [], // Add if you have payment history
                  })
                }
                disabled={!isEditable}
              >
                <Text className="font-bold text-center text-white py-2">Payment Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center justify-center border border-[#DB9245] bg-[#DB9245]"
                onPress={handleConfirmOrder}
                disabled={loading || !isEditable}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-center">
                    {invoiceStatus === 'new' ? 'Save Invoice' : 'Update Invoice'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  input2: {
    width: scale(155),
    backgroundColor: '#292C33',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default InvoiceItemScreen;