/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../stacks/Home';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NODE_API_ENDPOINT } from '../utils/util';
import { useFocusEffect } from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { verticalScale } from '../utils/scaling';

type MonthlyProductwiseOrdersScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'MonthlyProductwiseOrdersScreen'
>;

const MonthlyProductwiseOrdersScreen: React.FC<
  MonthlyProductwiseOrdersScreenProps
> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
  const [selectedInsightCategory, setSelectedInsightCategory] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end' | null>(null);

  const insightCategories = [
    { label: 'Monthly product wise order percentage', value: 'MonthlyProductwiseOrdersScreen' },
    { label: 'Monthly design wise order percentage', value: 'MonthlyDesignwiseOrdersScreen' },
    { label: 'Monthly Advances vs Dues Product Wise', value: 'MonthlyAdvanceVsDuesProductwiseScreen' },
    { label: 'Monthly Order Placement Analytics', value: 'MonthlyOrderPlacementAnalyticsScreen' },
    { label: 'Left Over Stock Product Wise', value: 'LeftoverstockproductwiseScreen' },
    { label: 'Left Over Stock Design Wise', value: 'LeftoverstockDesignwiseScreen' },
  ];

  // Transform analyticsData to match the expected structure
  const transformedData = useMemo(() => {
    return analyticsData.map((item) => ({
      productName: item.productDetails?.category_code || 'Unknown Product',
      orderCount: item.orderCount || 0,
      quantity: item.totalQuantity || 0,
    }));
  }, [analyticsData]);

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toISOString().split('T')[0]; // e.g., "2025-05-01"
  };

  const displayDate = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const { type } = event; // On Android, event.type can be 'set' or 'dismissed'

    // Hide the picker immediately on both platforms
    setShowDatePicker(false);

    // On Android, handle dismissal
    if (Platform.OS === 'android' && type === 'dismissed') {
      setDatePickerMode(null);
      return;
    }

    if (selectedDate && datePickerMode) {
      if (datePickerMode === 'start') {
        setStartDate(selectedDate);
        if (endDate && selectedDate > endDate) {
          setEndDate(null);
        }
        // On Android, prompt for end date after selecting start date
        if (Platform.OS === 'android') {
          setTimeout(() => {
            setDatePickerMode('end');
            setShowDatePicker(true);
          }, 100); // Small delay to ensure smooth transition
        }
      } else if (datePickerMode === 'end') {
        if (startDate && selectedDate < startDate) {
          Alert.alert('Error', 'End date must be after start date');
          setDatePickerMode(null);
          return;
        }
        setEndDate(selectedDate);
        setDatePickerMode(null);
      }
    } else {
      setDatePickerMode(null);
    }
  };

  const handleCalendarPress = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchProduct);
    // Filtering is already handled in the render method
  };

  const clearSearch = () => {
    setSearchProduct('');
    console.log('Search cleared');
  };

  useFocusEffect(
    useCallback(() => {
      const getProductSalesAnalytics = async () => {
        if (!activeFirm || !currentUser) return;

        setLoading(true);
        try {
          const companyId = activeFirm._id;
          let url = `${NODE_API_ENDPOINT}/analytics/all?companyId=${companyId}`;
          if (startDate) {
            url += `&startDate=${formatDate(startDate)}`;
          }
          if (endDate) {
            url += `&endDate=${formatDate(endDate)}`;
          }

          console.log('Fetching analytics from:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser.token}`,
            },
          });

          if (response.status === 401) {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
            navigation.navigate('LoginScreen');
            return;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch analytics: ${response.status} ${errorText}`);
          }

          const data = await response.json();
          console.log('Fetched analytics data:', data.salesData);
          setAnalyticsData(data.salesData || []);
        } catch (error) {
          console.error('Error fetching sales analytics:', error);
          Alert.alert('Error', 'Failed to fetch analytics data');
        } finally {
          setLoading(false);
        }
      };

      getProductSalesAnalytics();

      return () => {};
    }, [currentUser?.token, activeFirm, startDate, endDate, navigation]),
  );

  const downloadReport = async () => {
    if (!transformedData.length) {
      Alert.alert('Error', 'No data available to download.');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates to download the report.');
      return;
    }

    setLoading(true);
    try {
      if (!activeFirm || !activeFirm._id) {
        throw new Error('No active firm selected.');
      }
      const companyId = activeFirm._id;
      let url = `${NODE_API_ENDPOINT}/analytics/download-report?companyId=${companyId}&type=product-wise-orders`;
      if (startDate) {
        url += `&startDate=${formatDate(startDate)}`;
      }
      if (endDate) {
        url += `&endDate=${formatDate(endDate)}`;
      }

      console.log('Downloading report from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
        },
      });

      if (response.status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to download report: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const filename = `product_wise_orders_${formatDate(startDate)}_to_${formatDate(endDate)}.pdf`;
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

      Alert.alert('Success', `Report downloaded to ${path}`);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', error.message || 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#FBDBB5]"
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5 mt-2.5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full border border-[#292C33] justify-center items-center"
          >
            <Ionicons name="arrow-back" size={20} color="#292C33" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            {/* Start Date */}
            <View className="flex-row items-center mr-2">
              <View className="flex-column">
                <Text style={{ fontSize: 10 }} className="text-black text-right">
                  Start Date
                </Text>
                <Text className="text-black text-sm font-bold">
                  {displayDate(startDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCalendarPress('start')}
                className="ml-1.5"
              >
                <Feather name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            {/* End Date */}
            <View className="flex-row items-center">
              <View className="flex-column">
                <Text style={{ fontSize: 10 }} className="text-black text-right">
                  End Date
                </Text>
                <Text className="text-black text-sm font-bold">
                  {displayDate(endDate)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCalendarPress('end')}
                className="ml-1.5"
              >
                <Feather name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'inline'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Dropdown + Search Input Section */}
        <View className="mb-5">
          <View className="bg-[#D6872A] rounded-lg mb-4 shadow-md">
          <Dropdown
            style={{
              height: 42,
              paddingHorizontal: 15,
              borderRadius: 12,
            }}
            containerStyle={{
              borderRadius: 8,
              backgroundColor: '#292C33', // Dark background for the dropdown list
              marginTop: 4,
            }}
            placeholderStyle={{
              color: '#fff',
              fontSize: 15,
              textAlign: 'left',
            }}
            selectedTextStyle={{
              color: '#fff',
              fontSize: 14,
              textAlign: 'left',
            }}
            itemContainerStyle={{
              backgroundColor: '#292C33', // Dark background for each item
            }}
            itemTextStyle={{
              color: '#fff', // White text for dropdown items
              fontSize: 14,
              paddingVertical: 4,
            }}
            iconStyle={{
              width: 24,
              height: 22,
              tintColor: '#fff', // White chevron icon
            }}
            data={insightCategories}
            labelField="label"
            valueField="value"
            placeholder={'Monthly product wise order percentage'}
            value={selectedInsightCategory}
            onChange={(item) => {
              setSelectedInsightCategory(item.value);
              navigation.navigate(item.value);
            }}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={18} color="#fff" />
            )}
          />
        </View>

          {/* Search Product Input */}
          <View className="flex-row items-center bg-[#E0E0E0] rounded-lg px-4 h-[40px]">
            <TextInput
              className="flex-1 text-base text-black"
              placeholder="Search Product"
              placeholderTextColor="#888"
              value={searchProduct}
              onChangeText={setSearchProduct}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#888" />
            </TouchableOpacity>
            {searchProduct.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <Ionicons name="close" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Table */}
        <View className="bg-[#2D2D2D] rounded-t-lg px-3 py-2 flex-row justify-between">
          <Text className="text-white text-center text-sm font-semibold w-[33%]">
            Product Name
          </Text>
          <Text className="text-white text-center text-sm font-semibold w-[33%]">
            Order Count
          </Text>
          <Text className="text-white text-sm text-center font-semibold w-[33%]">
            Quantity
          </Text>
        </View>

        <ScrollView
          className="bg-[#D1853A] rounded-b-lg px-3 py-2"
          style={{ maxHeight: verticalScale(450) }}
        >
          {transformedData.length === 0 ? (
            <Text className="text-white text-center py-4">No data available</Text>
          ) : (
            transformedData
              .filter((item) =>
                item.productName.toLowerCase().includes(searchProduct.toLowerCase())
              )
              .map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between mb-2"
                >
                  <Text className="text-sm w-[33%] text-center text-white">
                    {item.productName || 'N/A'}
                  </Text>
                  <Text className="text-sm text-center w-[33%] text-white">
                    {item.orderCount || 'N/A'}
                  </Text>
                  <Text className="text-sm w-[33%] text-center text-white">
                    {item.quantity || 'N/A'}
                  </Text>
                </View>
              ))
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <TouchableOpacity
             onPress={()=>ToastAndroid.showWithGravityAndOffset('Feature Coming Soon', ToastAndroid.SHORT, ToastAndroid.BOTTOM,
              0,
              700 )}
            className="bg-[#D6872A] py-4 rounded-xl items-center"
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Downloading...' : 'Download Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MonthlyProductwiseOrdersScreen;