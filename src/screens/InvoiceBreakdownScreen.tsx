import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {OrderHistoryParamList} from '../stacks/OrderHistory';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import RNFetchBlob from 'rn-fetch-blob';
import {NODE_API_ENDPOINT} from '../utils/util';
import Share from 'react-native-share';

const paymentDetails = [
  {label: 'Total Amount', value: '₹ 63000'},
  {label: 'Advance Payment', value: '₹ 3000'},
  {label: 'Final Payment', value: '₹ 60000'},
  {label: 'Mode Of Payment', value: 'Cheque'},
  {label: 'Invoice Status', value: 'Paid'},
];

type InvoiceBreakdownScreenProps = NativeStackScreenProps<
  OrderHistoryParamList,
  'InvoiceBreakdownScreen'
>;

const InvoiceBreakdownScreen = ({
  navigation,
  route,
}: InvoiceBreakdownScreenProps) => {
  console.log(route.params.orderDetails);

  const [orderDetails, setOrderDetails] = React.useState(
    route.params.orderDetails,
  );

  const [downloading, setDownloading] = React.useState(false);

  const [shareDownloading, setShareDownloading] = React.useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const checkPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }

    if (+Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else if (+Platform.Version >= 29) {
      // No need to request permission explicitly for DownloadDir
      // DownloadManager can write without permission in scoped storage
      return true;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const downloadInvoice = async () => {
    if (shareDownloading) return;

    // Check for storage permission on Android
    if (Platform.OS === 'android') {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download invoices',
        );
        return;
      }
    }

    setDownloading(true);

    try {
      // Get the order ID
      const orderId = orderDetails._id;

      // Set download path based on platform
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `invoice_${orderId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;

      const apiUrl = `${NODE_API_ENDPOINT}/orders/invoice/${orderId}`;
      console.log(`Downloading invoice from: ${apiUrl}`);

      // For Android, first check if the directory exists
      if (Platform.OS === 'android') {
        const exists = await RNFetchBlob.fs.exists(dirPath);
        if (!exists) {
          await RNFetchBlob.fs.mkdir(dirPath);
        }
      }

      // Configure download with notification for Android
      const downloadConfig =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: filePath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: 'Invoice Downloaded',
                description: 'Your invoice has been downloaded successfully',
                mime: 'application/pdf',
                mediaScannable: true,
                path: filePath,
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };

      // Download the file
      const res = await RNFetchBlob.config(downloadConfig).fetch(
        'GET',
        apiUrl,
        {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      );

      // Check if we have a valid response
      console.log('Response info:', res.info());

      // Check if the file exists and has content
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File does not exist after download');
      }

      const fileSize = await RNFetchBlob.fs
        .stat(filePath)
        .then(stats => stats.size);
      console.log(`File exists: ${fileExists}, size: ${fileSize}B`);

      if (fileSize <= 0) {
        throw new Error('Downloaded file is empty (0B)');
      }

      // Show success message
      Alert.alert('Success', 'Invoice downloaded successfully');

      // Open the PDF
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        // For Android, use the action view intent
        // If using download manager, this might not be necessary as the notification will allow opening
        // But we'll include it anyway for better user experience
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', `Failed to download invoice: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const shareInvoice = async () => {
    if (shareDownloading) return;

    setShareDownloading(true);

    try {
      // Get the order ID
      const orderId = orderDetails._id;

      // Set download path based on platform
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `invoice_${orderId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;

      const apiUrl = `${NODE_API_ENDPOINT}/orders/invoice/${orderId}`;

      // Download the file first
      const res = await RNFetchBlob.config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', apiUrl, {
        Authorization: `Bearer ${currentUser?.token}`,
      });

      // Check if file exists and has content
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists || res.info().status !== 200) {
        throw new Error('Failed to download invoice for sharing');
      }

      // Share the file
      const shareOptions = {
        title: 'Share Invoice',
        message: 'Please find the attached invoice',
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', `Failed to share invoice: ${error.message}`);
    } finally {
      setShareDownloading(false);
    }
  };

  // const commonSlice = useSelector((state: RootState) => state.common);

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        {/* <TouchableOpacity
                className="mb-8"
                onPress={() => {
                  navigation.navigate('Notification');
                }}>
                <View className="relative">
                  <FontistoIcon name="bell" size={25} color={'#DB9245'} />
                  <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
                </View>
              </TouchableOpacity> */}
      </View>

      {/* Invoice Date & Time */}
      <View className="flex-row justify-end mb-4">
        <View>
          <Text className="text-sm font-semibold text-black text-right">
            Invoice Date & Time
          </Text>
          <Text className="text-sm text-black text-right">
            {new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Text>
        </View>
      </View>

      {/* Firm Details */}
      <View className="mb-4 ">
        <View className="flex flex-row gap-6">
          <Text className="text-sm text-black font-bold">Firm Name :</Text>
          <Text className="text-sm text-black mb-1">
            {orderDetails?.client?.firmName}
          </Text>
        </View>

        {/* <View className="flex flex-row gap-12">
          <Text className="text-sm text-black font-bold">GST No :</Text>
          <Text className="text-sm text-black mb-1">012356985421525445</Text>
        </View> */}
        <View className="flex flex-row gap-11">
          <Text className="text-sm text-black font-bold">Address :</Text>
          <Text className="text-sm text-black mb-2">
            {orderDetails?.client?.address}
          </Text>
        </View>

        <View className="flex flex-row gap-5">
          <Text className="text-sm text-black font-bold">Client Name :</Text>
          <Text className="text-sm text-black mb-1">
            {orderDetails?.client?.name}
          </Text>
        </View>

        <View className="flex flex-row gap-7">
          <Text className="text-sm text-black font-bold">Contact No :</Text>
          <Text className="text-sm text-black mb-2">
            {orderDetails?.client?.phone}
          </Text>
        </View>
      </View>

      <View className="rounded-xl overflow-hidden mb-6">
        <View className="flex-row mb-1">
          {/* Label (left side) */}
          <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
            <Text className="text-white font-semibold text-sm">
              Total Amount
            </Text>
          </View>
          {/* Value (right side) */}
          <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
            <Text className="text-black font-semibold text-sm text-right">
              {orderDetails.totalAmount}
            </Text>
          </View>
        </View>

        <View className="flex-row mb-1">
          {/* Label (left side) */}
          <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
            <Text className="text-white font-semibold text-sm">
              {orderDetails.discountValue === 0
                ? 'Discount  (%)'
                : 'Discount  (₹)'}
            </Text>
          </View>
          {/* Value (right side) */}
          <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
            <Text className="text-black font-semibold text-sm text-right">
              {orderDetails.discountValue}
            </Text>
          </View>
        </View>

        <View className="flex-row mb-1">
          {/* Label (left side) */}
          <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
            <Text className="text-white font-semibold text-sm">GST %</Text>
          </View>
          {/* Value (right side) */}
          <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
            <Text className="text-black font-semibold text-sm text-right">
              {orderDetails.gst}
            </Text>
          </View>
        </View>

        {orderDetails.payments.map((item, index) => (
          <View key={index} className="flex-row mb-1">
            {/* Label (left side) */}
            <View className="flex-1 bg-[#1F1F1F] px-4 py-3">
              <Text className="text-white font-semibold text-sm">
                {item.paymentMethod}
              </Text>
            </View>
            {/* Value (right side) */}
            <View className="flex-1 bg-[#DA8B2C] px-4 py-3">
              <Text className="text-black font-semibold text-sm text-right">
                {item.amount}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <TouchableOpacity
        className="bg-[#D6872A] py-3 rounded-xl"
        onPress={() => navigation.goBack()}>
        <Text className="text-center text-white font-semibold text-base">
          View Invoice Items
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-between mt-4">
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl border border-black mr-2"
          onPress={shareInvoice}
          disabled={shareDownloading}>
          <Text className="text-center text-black font-semibold ">
            <Icon name="share-2" size={20} color="#292C33" />
            {'   '} {shareDownloading ? 'Processing...' : 'Share'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 rounded-xl bg-[#D6872A] ml-2"
          onPress={downloadInvoice}
          disabled={downloading}>
          {downloading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-semibold">
              Download Invoice
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InvoiceBreakdownScreen;
