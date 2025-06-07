/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import RNFetchBlob from 'rn-fetch-blob';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const orderData = new Array(5).fill({
  bailNo: 'TX-BL-001',
  designNo: 'DS24COT101',
  lotNo: '24-500',
  category: 'Cotton Shirting',
  quantity: '5,000',
});

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InvoiceScreen'
>;

const InvoiceScreen = ({navigation, route}: AddNewUserProps) => {
  const {width, height} = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const fontSize = isSmallDevice ? 10 : 12;
  const listMaxHeight = height * 0.35; // 35% of screen height
  const [cartProducts, setCartProducts] = useState(
    route.params.orderDetails.products,
  );

  console.log(route.params.orderDetails);

  const [downloading, setDownloading] = React.useState(false);

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
    if (downloading) return;

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
      const orderId = route.params.orderDetails?._id;

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

  return (
    <SafeAreaView className="flex-1 bg-[#FBD7A2] pt-14 px-4 pb-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mt-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        {/*
        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Client Info */}
      <View className="bg-[#DB9245] rounded-lg mt-8 mb-5 p-4">
        <Text className="text-sm text-white">
          {route.params?.orderDetails?.client?.name}
        </Text>
        <Text className="text-xl font-bold text-white mt-1">
          {route.params?.orderDetails?.client?.firmName}
        </Text>
      </View>

      {/* Table Header */}
      <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-3 flex-row justify-between">
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold">
          Bail No
        </Text>
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold">
          Design
        </Text>
        <Text
          style={{fontSize, width: '15%'}}
          className="text-white font-semibold text-center">
          Lot No
        </Text>
        <Text
          style={{fontSize, width: '20%'}}
          className="text-white font-semibold text-center">
          Category
        </Text>
        <Text
          style={{fontSize, width: '25%'}}
          className="text-white font-semibold text-center">
          Quantity
        </Text>
      </View>

      {/* Cart Items Container */}
      <View className="bg-[#D1853A] rounded-b-lg px-3 py-2 mb-4">
        {/* Scrollable Items List */}
        <ScrollView
          style={{maxHeight: listMaxHeight}}
          showsVerticalScrollIndicator={false}
          className="mb-2">
          {cartProducts?.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between mb-3 py-1 ">
              <Text style={{fontSize, width: '20%'}} className="text-white">
                {item?.inventoryProduct?.bail_number}
              </Text>
              <Text style={{fontSize, width: '20%'}} className="text-white">
                {item?.inventoryProduct?.design_code}
              </Text>
              <Text
                style={{fontSize, width: '20%'}}
                className="text-white text-center">
                {item?.inventoryProduct?.lot_number}
              </Text>
              <Text style={{fontSize, width: '25%'}} className="text-white">
                {item?.inventoryProduct?.category_code}
              </Text>
              <Text style={{fontSize, width: '15%'}} className="text-white">
                {item?.quantity}
              </Text>
              {/* <View style={{width: '25%'}} className="px-1">
                <TextInput
                  style={{fontSize}}
                  className="border border-white rounded-md px-2 py-1 text-white text-center"
                  value={item.unitPrice.toString()}
                  editable={false}
                />
              </View> */}
              {/* <TouchableOpacity
                  style={{width: '15%'}}
                  className="items-center"
                  onPress={() => handleRemoveItem(item.inventoryProduct._id)}>
                  <Icon name="trash-2" size={16} color="#fff" />
                </TouchableOpacity> */}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Download Button */}
      <TouchableOpacity
        className="bg-[#DB9245] mx-6 mb-6 py-3 rounded-lg items-center justify-center mt-auto"
        onPress={downloadInvoice}
        disabled={downloading}>
        {downloading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Download Invoice
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default InvoiceScreen;
