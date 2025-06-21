/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setInventoryName} from '../redux/commonSlice';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { scale } from '../utils/scaling';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

const bailNumbers = [
  {label: 'Bail No', value: 'Bail No'},
  {label: 'Item Name', value: 'Item Name'},
  {label: 'Design No', value: 'Design No'},
  {label: 'Lot No', value: 'Lot No'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryProductList'
>;

const InventoryProductList = ({navigation, route}: AddNewUserProps) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedBail, setSelectedBail] = useState('Bail No');
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [itemNames, setItemNames] = useState<{label: string; value: string}[]>([]);
  const [isItemNameDropdownOpen, setIsItemNameDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  // Update item names for dropdown when products change
  useEffect(() => {
    const uniqueItemNames = Array.from(
      new Set(products.map(item => item.category_code).filter(Boolean)),
    ).map(name => ({label: name, value: name}));
    setItemNames(uniqueItemNames);
  }, [products]);

  // Reset item name filter when selectedBail changes
  useEffect(() => {
    if (selectedBail !== 'Item Name') {
      setSelectedItemName(null);
    }
  }, [selectedBail]);

  // Filter products based on selected item name, search text, and bail filter
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = products;

    // Filter by selected item name first
    if (selectedItemName) {
      filtered = filtered.filter(
        item => item.category_code === selectedItemName,
      );
    }

    // Then apply search text and bail filter
    filtered = filtered.filter(item => {
      if (!searchText.trim()) {
        return true; // Show all when no search text
      }

      const searchLower = searchText.toLowerCase().trim();

      switch (selectedBail) {
        case 'Bail No':
          return item.bail_number?.toLowerCase().includes(searchLower);
        case 'Item Name':
          return item.category_code?.toLowerCase().includes(searchLower);
        case 'Design No':
          return item.design_code?.toLowerCase().includes(searchLower);
        case 'Lot No':
          return item.lot_number?.toLowerCase().includes(searchLower);
        default:
          return (
            item.bail_number?.toLowerCase().includes(searchLower) ||
            item.category_code?.toLowerCase().includes(searchLower) ||
            item.design_code?.toLowerCase().includes(searchLower) ||
            item.lot_number?.toLowerCase().includes(searchLower)
          );
      }
    });

    setFilteredProducts(filtered);
  }, [searchText, selectedBail, selectedItemName, products]);

  useFocusEffect(
    useCallback(() => {
      const getProdList = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/companies/${route.params.companyId}/inventory`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch products: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          dispatch(setInventoryName(data.inventoryName));

          if (data.products.length === 0) {
            navigation.replace('InventoryEmptyScreen');
          } else {
            setProducts(data.products);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching products:', error);
          setLoading(false);
        }
      };

      if (currentUser && route.params?.companyId) {
        getProdList();
      }

      return () => {
        setProducts([]);
      };
    }, [currentUser, route.params?.companyId, dispatch, navigation]),
  );

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
      return true;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const handleDownloadInventory = () => {
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

    if (Platform.OS === 'android') {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download Inventory',
        );
        return;
      }
    }

    setDownloading(true);

    try {
      const inventoryId = activeFirm?.inventory;
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const timestamp = new Date().getTime();
      const filename = `inventrory_${inventoryId}_${timestamp}.csv`;
      const filePath = `${dirPath}/${filename}`;
      const apiUrl = `${NODE_API_ENDPOINT}/inventory/${inventoryId}/download/csv`;
      console.log(`Downloading inventory from: ${apiUrl}`);

      if (Platform.OS === 'android') {
        const exists = await RNFetchBlob.fs.exists(dirPath);
        if (!exists) {
          await RNFetchBlob.fs.mkdir(dirPath);
        }
      }

      const downloadConfig =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: filePath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: 'inventory Downloaded',
                description: 'Your inventory has been downloaded successfully',
                mime: 'text/csv',
                mediaScannable: true,
                path: filePath,
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };

      const res = await RNFetchBlob.config(downloadConfig).fetch(
        'GET',
        apiUrl,
        {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      );

      console.log('Response info:', res.info());

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

      Alert.alert('Success', 'Inventory Product List downloaded successfully');

      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        RNFetchBlob.android.actionViewIntent(filePath, 'text/csv');
      }
    } catch (error) {
      console.error('Error downloading inventory:', error);
      Alert.alert('Error', `Failed to download inventory: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const downloadInvoiceInPdf = async () => {
    if (downloading) return;

    if (Platform.OS === 'android') {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download inventory',
        );
        return;
      }
    }

    setDownloading(true);

    try {
      const inventoryId = activeFirm?.inventory;
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const timestamp = new Date().getTime();
      const filename = `inventory_${inventoryId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;
      const apiUrl = `${NODE_API_ENDPOINT}/inventory/${inventoryId}/download/pdf`;
      console.log(`Downloading inventory from: ${apiUrl}`);

      if (Platform.OS === 'android') {
        const exists = await RNFetchBlob.fs.exists(dirPath);
        if (!exists) {
          await RNFetchBlob.fs.mkdir(dirPath);
        }
      }

      const downloadConfig =
        Platform.OS === 'android'
          ? {
              fileCache: true,
              path: filePath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: 'inventory Downloaded',
                description: 'Your inventory has been downloaded successfully',
                mime: 'application/pdf',
                mediaScannable: true,
                path: filePath,
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };

      const res = await RNFetchBlob.config(downloadConfig).fetch(
        'GET',
        apiUrl,
        {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      );

      console.log('Response info:', res.info());

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

      Alert.alert('Success', 'Inventory Product List downloaded successfully');

      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      console.error('Error downloading Inventory:', error);
      Alert.alert('Error', `Failed to download inventory: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
         <LottieView
          source={require('../assets/lottieanimation1.json')} // Your downloaded .json file
          autoPlay
          loop
          style={{ width: 180, height: 130 }}
         />
        <Text className="mt-2 text-black">Loading inventory...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD9B3] pt-14 px-4 pb-2">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        <View className="flex-1 items-end -ml-4">
          <Text className="text-sm text-black">Inventory Name</Text>
          <Text className="text-base font-bold text-black">
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Dropdown + Search */}
      <View className="flex-row items-center mb-4 border border-[#D6872A] rounded-xl">
        <View className="w-[30%] bg-[#D6872A] rounded-l-xl px-2">
          <Dropdown
            style={{
              height: 42,
              backgroundColor: 'transparent',
              margin: 0,
              padding: 0,
            }}
            containerStyle={{
              borderRadius: 5,
              backgroundColor: '#D6872A',
              margin: 0,
              padding: 0,
            }}
            itemContainerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.2)',
              padding: 0,
            }}
            placeholderStyle={{
              color: '#fff',
              fontSize: 14,
              marginLeft: 8,
            }}
            selectedTextStyle={{
              color: '#fff',
              fontSize: 12,
              marginLeft: 8,
            }}
            iconStyle={{
              width: 20,
              height: 20,
              tintColor: '#fff',
              marginRight: 8,
            }}
            itemTextStyle={{
              color: '#fff',
              fontSize: 14,
              padding: 0,
            }}
            activeColor="rgba(255,255,255,0.2)"
            data={bailNumbers}
            labelField="label"
            valueField="value"
            placeholder={selectedBail}
            value={selectedBail}
            onChange={item => setSelectedBail(item.value)}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setIsDropdownOpen(false)}
            renderRightIcon={() => (
              <Ionicons
                name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#fff"
                style={{marginRight: 8}}
              />
            )}
            renderItem={(item, selected) => (
              <View
                className="py-2 px-2"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: selected ? 'bold' : 'normal',
                    fontSize: 12,
                  }}>
                  {item.label}
                </Text>
                {selected && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            )}
          />
        </View>
        <View className="flex-1 rounded-r-lg px-3 flex-row items-center bg-[#FAD9B3]">
          <TextInput
            placeholder="Search..."
            className="flex-1 text-black"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={18} color="black" />
        </View>
      </View>

      {/* Item Name Dropdown */}
      {selectedBail === 'Item Name' && (
        <View className="mb-4">
          <View className="w-full bg-[#D6872A] rounded-xl px-2">
            <Dropdown
              style={{
                height: 42,
                backgroundColor: 'transparent',
                margin: 0,
                padding: 0,
              }}
              containerStyle={{
                borderRadius: 5,
                backgroundColor: '#D6872A',
                margin: 0,
                padding: 0,
              }}
              itemContainerStyle={{
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.2)',
                padding: 0,
              }}
              placeholderStyle={{
                color: '#fff',
                fontSize: 14,
                marginLeft: 8,
              }}
              selectedTextStyle={{
                color: '#fff',
                fontSize: 12,
                marginLeft: 8,
              }}
              iconStyle={{
                width: 20,
                height: 20,
                tintColor: '#fff',
                marginRight: 8,
              }}
              itemTextStyle={{
                color: '#fff',
                fontSize: 14,
                padding: 0,
              }}
              activeColor="rgba(255,255,255,0.2)"
              data={[{label: 'All Items', value: ''}, ...itemNames]}
              labelField="label"
              valueField="value"
              placeholder="Select Item Name"
              value={selectedItemName || ''}
              onChange={item => setSelectedItemName(item.value || null)}
              onFocus={() => setIsItemNameDropdownOpen(true)}
              onBlur={() => setIsItemNameDropdownOpen(false)}
              renderRightIcon={() => (
                <Ionicons
                  name={isItemNameDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#fff"
                  style={{marginRight: 8}}
                />
              )}
              renderItem={(item, selected) => (
                <View
                  className="py-2 px-2"
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: selected
                      ? 'rgba(255,255,255,0.2)'
                      : 'transparent',
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: selected ? 'bold' : 'normal',
                      fontSize: 12,
                    }}>
                    {item.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              )}
            />
          </View>
        </View>
      )}

      {/* Download List */}
      <TouchableOpacity
        className="self-end mb-3 flex-row items-center"
        onPress={handleDownloadInventory}>
        {downloading ? (
          <ActivityIndicator color={'#fff'} size={'small'} />
        ) : (
          <>
            <Ionicons name="cloud-download-outline" size={18} color="black" />
            <Text className="ml-1 text-sm text-black">Download List</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Product Grid */}
      <FlatList
          className="mb-20 rounded-lg"
          data={filteredProducts.length > 0 ? filteredProducts : products}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 4 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item._id}
              className="w-[48%] bg-[#DB9245] rounded-lg mb-4 overflow-hidden border border-[#DB9245]"
              onPress={() =>
                navigation.navigate('InventoryProductDetails', {
                  productDetails: item,
                })
              }>
              
              {/* Image Container */}
              <View className="w-full h-32 bg-[#DB9245] px-4 pt-4 pb-2 justify-center items-center">
              <Image
                source={
                  item?.image
                    ? { uri: item.image }
                    : require('../assets/t-shirt.png')
                }
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>

            {/* Details */}
            <View className="bg-[#DB9245] p-2">
              <Text className="text-sm font-semibold text-black">Bail No:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.bail_number}</Text>
              <Text className="text-sm font-semibold text-black">Item Name:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.category_code}</Text>
              <Text className="text-sm font-semibold text-black">Design Code:</Text>
              <Text className="text-sm font-semibold text-white mb-1">{item.design_code}</Text>
              <View
                className="bg-[#FAD9B3] rounded-md flex-1 self-center px-2 py-1 mt-2">
                <Text className="text-sm text-black font-semibold text-center">
                  {item.stock_amount ? 'In Stock' : 'Out Of Stock'}
                </Text>
              </View>
            </View>
            </TouchableOpacity>
          )}
        />
          
          

      {/* Bottom Actions */}
      <View className="absolute bottom-4 left-4 right-4 flex-row gap-4 mb-1 flex-1">
        <TouchableOpacity
          className=" flex-1 py-4 rounded-xl items-center border bg-[#292C33] border-[#292C33]"
          onPress={() => navigation.navigate('AddInventoryScreen')}>
          <Text className="text-white font-semibold text-base">
            Update Invenotry
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InventoryProductList;