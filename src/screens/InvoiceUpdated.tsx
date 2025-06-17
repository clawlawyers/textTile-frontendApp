/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather';
import RNFetchBlob from 'rn-fetch-blob';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { scale, verticalScale } from '../utils/scaling';
import { AccountStackParamList } from '../stacks/Account';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NODE_API_ENDPOINT } from '../utils/util';

type InvoiceUpdatedProps = NativeStackScreenProps<
  AccountStackParamList,
  'InvoiceUpdated'
>;

const InvoiceUpdated = ({ navigation, route }: InvoiceUpdatedProps) => {
  const { invoice } = route.params;
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
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
      // Validate invoice ID and user token
      const invoiceId = invoice?._id;
      if (!invoiceId) {
        throw new Error('Invalid invoice ID');
      }
      if (!currentUser?.token) {
        throw new Error('User not authenticated');
      }

      // Set download path based on platform
      const { dirs } = RNFetchBlob.fs;
      const dirPath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `invoice_${invoiceId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;

      const apiUrl = `${NODE_API_ENDPOINT}/custom-orders/${invoiceId}`;
      console.log(`Downloading invoice from: ${apiUrl}`);

      // For Android, check if the directory exists
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
      const res = await RNFetchBlob.config(downloadConfig).fetch('GET', apiUrl, {
        Authorization: `Bearer ${currentUser?.token}`,
      });

      // Check response status
      if (res.info().status === 401) {
        throw new Error('401: Session expired');
      }
      if (res.info().status !== 200) {
        throw new Error(`Download failed: HTTP ${res.info().status}`);
      }

      // Check if the file exists and has content
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File does not exist after download');
      }

      const fileSize = await RNFetchBlob.fs.stat(filePath).then(stats => stats.size);
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
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);

      // Handle specific error cases
      if (String(error).includes('401')) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', `Failed to download invoice: ${error.message}`);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBDBB5]">
      <View className="flex-1 px-5 pt-6 relative">
        {/* Top Header Icons */}
        <View className="flex-row justify-between items-center px-4 mt-6">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('GenerateInvoiceScreen', {
                invoiceStatus: 'new',
                orderId: undefined,
                testOrderId: undefined,
                invoiceNumber: undefined,
                billingDetails: {},
                paymentDetails: { totalAmount: '0', dueAmount: '0', payments: [] },
                paymentHistory: [],
                cartProducts: [],
                discountValue: '0',
                discountMode: 'percent',
                gstValue: '0',
              })
            }
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center"
          >
            <Icon1 name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center pb-12">
          {/* Logo with Shadow */}
          <View>
            <Image
              source={require('../assets/logo.png')}
              style={{
                width: scale(150),
                height: verticalScale(140),
              }}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Subtext */}
          <Text className="text-3xl font-bold text-black text-center mt-6">
            Invoice Updated
          </Text>
          <Text className="text-center mt-2 text-black text-base">
            Your Invoice is Updated{'\n'}
          </Text>

          {/* Download Button */}
          <View className='justify-center align-center '>
          <TouchableOpacity
            className="bg-[#DB9245] rounded-lg py-3   justify-center mt-4"
            style={{width:scale(170)}}
            onPress={handleDownloadInvoice}
            disabled={downloading}
          >
            <Text className="text-center text-white font-bold text-lg">
              {downloading ? 'Downloading...' : 'Download Invoice'}
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InvoiceUpdated;