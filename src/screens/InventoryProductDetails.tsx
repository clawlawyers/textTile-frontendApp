import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import DeleteConfirmation from '../components/DeleteConfirmation';
import RNFetchBlob from 'rn-fetch-blob';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryProductDetails'
>;

const InventoryProductDetails = ({navigation, route}: AddNewUserProps) => {
  const [prodDetails, setProdDetails] = React.useState({
    category: '',
    title: '',
    designCode: '',
    stock: '',
    image: '',
  });

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const [downloading, setDownloading] = useState(false);

  console.log(prodDetails);

  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setProdDetails(route.params.productDetails);
  }, [route.params.productDetails]);

  const [showPermissionDialog, setShowPermissionDialog] = React.useState(false);

  const handleDeleteProduct = async () => {
    setShowPermissionDialog(false);
    console.log(activeFirm);
    const deleteProduct = await fetch(
      `${NODE_API_ENDPOINT}/inventory/${activeFirm?.inventory}/products/${prodDetails._id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      },
    );
    console.log(deleteProduct);

    if (!deleteProduct.ok) {
      const errorText = await deleteProduct.text();
      console.log(errorText);
      throw new Error(
        `Failed to delete product: ${deleteProduct.status} ${errorText}`,
      );
    }
    setShowPermissionDialog(false);
    const data = await deleteProduct.json();
    console.log(data);

    navigation.goBack();
  };

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

  const handleDownloadInventoryProd = () => {
    Alert.alert('Download Inventory', 'Dowload in CSV or PDF', [
      {
        text: 'PDF',
        style: 'destructive',
        onPress: () => downloadInvoiceInPdf(),
      },
      {
        text: 'CSV',
        onPress: () => downloadInvoiceInCsv(),
      },
    ]);
  };

  const downloadInvoiceInCsv = async () => {
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
      const productId = prodDetails._id;

      // Set download path based on platform
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `inventrory_prod_${productId}_${timestamp}.csv`;
      const filePath = `${dirPath}/${filename}`;

      const apiUrl = `${NODE_API_ENDPOINT}/inventory/product/${productId}/download/csv`;
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
                mime: 'text/csv',
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
      Alert.alert('Success', 'Inventory Product downloaded successfully');

      // Open the PDF
      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        // For Android, use the action view intent
        // If using download manager, this might not be necessary as the notification will allow opening
        // But we'll include it anyway for better user experience
        RNFetchBlob.android.actionViewIntent(filePath, 'text/csv');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', `Failed to download invoice: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const downloadInvoiceInPdf = async () => {
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
      const productId = prodDetails._id;

      // Set download path based on platform
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `inventory_Prod_${productId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;

      const apiUrl = `${NODE_API_ENDPOINT}/inventory/product/${productId}/download/pdf`;
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
      Alert.alert('Success', 'Inventory Product downloaded successfully');

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
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View>
          <Text className="text-xs text-[#292C33] text-right">
            Inventory For
          </Text>
          <Text className="text-sm font-semibold text-black text-right">
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Product Image */}
      <View className="items-center mb-4">
        {prodDetails.image ? (
          <Image
            source={{uri: prodDetails.image}}
            className="w-full h-52 bg-white"
            resizeMode="stretch"
          />
        ) : (
          <Image
            source={require('../assets/t-shirt.png')}
            className="w-full h-52 bg-white"
            resizeMode="stretch"
          />
        )}
      </View>

      {/* Action Icons */}
      <View className="flex-row justify-end gap-4 mb-4">
        {/* <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="alert-triangle" size={20} color="#292C33" />
        </TouchableOpacity> */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center"
          onPress={() => setShowPermissionDialog(true)}>
          <Icon name="trash-2" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      <DeleteConfirmation
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        type="Product"
        onDelete={handleDeleteProduct}
      />

      {/* Product Info */}
      <View className=" mb-2 text-black flex-row flex">
        <Text className="text-base font-bold">Item Name:{'  '}</Text>
        <Text className="text-base mb-2 text-black">
          {prodDetails.category_code}
        </Text>
      </View>

      <View className="space-y-1 mb-6">
        <View className="text-sm text-black flex flex-row">
          <Text className="">Full Bale No : </Text>
          {'     '}
          <Text className="font-bold">{prodDetails.bail_number}</Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Entry Date : </Text>
          {'     '}
          <Text className="font-bold">
            {'   '}
            {new Date(prodDetails.bail_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Design No : {'   '}</Text>

          <Text className="font-bold"> {prodDetails.design_code}</Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Lote No : </Text>
          {'     '}
          <Text className="font-bold">{prodDetails.lot_number}</Text>
        </View>
      </View>

      <View className="flex  gap-2 mt-auto">
        <View className="flex-row items-center justify-end mt-auto mb-0">
          <View className="flex-row items-center gap-2">
            {downloading ? (
              <ActivityIndicator size={'small'} />
            ) : (
              <TouchableOpacity
                onPress={handleDownloadInventoryProd}
                className="flex flex-row gap-2">
                <Icon name="download" size={14} color="#292C33" />
                <Text className="text-xs text-[#292C33]">
                  Download Product Details
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className=" flex border flex-row justify-center rounded-md py-2 mt-auto">
          <Text className="text-base text-black mb-1">
            Available Stock ( Bail Quantity ) :
          </Text>
          <Text className="text-sm text-black">{prodDetails.stock_amount}</Text>
        </View>

        {/* Footer Buttons */}
        <View className="flex-row justify-between gap-4 mt-auto mb-10">
          <TouchableOpacity
            className="flex-1 border border-[#292C33] py-3 rounded-lg items-center"
            onPress={() =>
              navigation.navigate('StockManagement', {
                productDetails: prodDetails,
              })
            }>
            <Text className="text-black font-semibold">Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#DB9245] py-3 rounded-lg items-center"
            onPress={() => {
              navigation.navigate('EditInventoryProduct', {
                productDetails: prodDetails,
              });
            }}>
            <Text className="text-white font-semibold">Edit Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InventoryProductDetails;
