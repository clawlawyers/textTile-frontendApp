/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { NODE_API_ENDPOINT, checkPermission } from '../utils/util';
import { useFocusEffect } from '@react-navigation/native';
import RNFetchBlob from 'react-native-blob-util';
import { verticalScale } from '../utils/scaling';
import { AreaChart, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { AccountStackParamList } from '../stacks/Account';

type LeftoverstockproductwiseScreenProps = NativeStackScreenProps<
  AccountStackParamList,
  'LeftoverstockproductwiseScreen'
>;

const LeftoverstockproductwiseScreen: React.FC<LeftoverstockproductwiseScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [monthlyStockData, setMonthlyStockData] = useState([]);
  const [startStock, setStartStock] = useState<number | null>(null);
  const [endStock, setEndStock] = useState<number | null>(null);
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
    {
      label: 'Monthly Advances vs Dues Product Wise',
      value: 'MonthlyAdvanceVsDuesProductwiseScreen',
    },
    { label: 'Monthly Order Placement Analytics', value: 'MonthlyOrderPlacementAnalyticsScreen' },
    { label: 'Left Over Stock Product Wise', value: 'LeftoverstockproductwiseScreen' },
    { label: 'Left Over Stock Design Wise', value: 'LeftoverstockDesignwiseScreen' },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toISOString().split('T')[0];
  };

  const displayDate = (date: Date | null): string => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const { type } = event;
    setShowDatePicker(false);
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
        if (Platform.OS === 'android') {
          setTimeout(() => {
            setDatePickerMode('end');
            setShowDatePicker(true);
          }, 100);
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
          let url = `${NODE_API_ENDPOINT}/analytics/stock?companyId=${companyId}&groupBy=month`;
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
          console.log('Fetched analytics data:', data);

          // Table data
          const stats = data.stats || {};
          const totalStock = stats.totalStock || 0;
          const orderedQuantity = stats.totalOrderedQuantity || 0;
          const remainingStock = totalStock - orderedQuantity > 0 ? totalStock - orderedQuantity : 0;
          setAnalyticsData([
            { name: 'Cumulative Stock', value: totalStock, color: '#2C6E49' },
            { name: 'Remaining Stock', value: remainingStock, color: '#FFB703' },
            { name: 'Ordered Quantity', value: orderedQuantity, color: '#8D0801' },
          ]);

          // Graph data and legend values from monthlyValues
          const monthlyValues = data.monthlyValues || {};
          setStartStock(monthlyValues.monthStartStock || null);
          setEndStock(monthlyValues.monthEndStock || null);
          const monthMap = new Map();
          if (monthlyValues.startDate && monthlyValues.monthStartStock) {
            const startMonth = new Date(monthlyValues.startDate).toLocaleString('en-US', { month: 'short' });
            monthMap.set(startMonth, {
              month: startMonth,
              stock: monthlyValues.monthStartStock || 0,
            });
          }
          if (monthlyValues.endDate && monthlyValues.monthEndStock) {
            const endMonth = new Date(monthlyValues.endDate).toLocaleString('en-US', { month: 'short' });
            monthMap.set(endMonth, {
              month: endMonth,
              stock: monthlyValues.monthEndStock || 0,
            });
          }
          const monthlyData = months.map((month, index) => ({
            month,
            stock: monthMap.has(month) ? monthMap.get(month).stock : 0,
            index,
          }));
          setMonthlyStockData(monthlyData);
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
    if (loading) return;

    if (Platform.OS === 'android') {
      const hasPermission = await checkPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to download reports',
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (!analyticsData.length) {
        throw new Error('No data available to download.');
      }

      if (!startDate || !endDate) {
        throw new Error('Please select both start and end dates to download the report.');
      }

      if (!activeFirm || !activeFirm._id) {
        throw new Error('No active firm selected.');
      }

      const companyId = activeFirm._id;
      // Placeholder endpoint; replace with correct one when confirmed
      let url = `${NODE_API_ENDPOINT}/analytics/download-report?companyId=${companyId}&type=leftover-stock-product-wise`;
      if (startDate) {
        url += `&startDate=${formatDate(startDate)}`;
      }
      if (endDate) {
        url += `&endDate=${formatDate(endDate)}`;
      }

      console.log('Full download URL:', url);
      console.log('Token used:', currentUser?.token ? 'Present' : 'Missing');

      const { dirs } = RNFetchBlob.fs;
      const dirPath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const timestamp = new Date().getTime();
      const filename = `report_leftover_stock_${companyId}_${timestamp}.pdf`;
      const filePath = `${dirPath}/${filename}`;

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
                title: 'Report Downloaded',
                description: 'Your report has been downloaded successfully',
                mime: 'application/pdf',
                mediaScannable: true,
                path: filePath,
              },
            }
          : {
              fileCache: true,
              path: filePath,
            };

      const res = await RNFetchBlob.config(downloadConfig).fetch('GET', url, {
        Authorization: `Bearer ${currentUser?.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      });

      console.log('Response info:', res.info());

      if (res.info().status === 401) {
        Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
        navigation.navigate('LoginScreen');
        return;
      }

      if (res.info().status === 404) {
        throw new Error('Report download endpoint not found. Please contact support.');
      }

      if (!(res.info().status >= 200 && res.info().status < 300)) {
        const errorText = await res.text();
        console.log('Response error text:', errorText);
        throw new Error(`Failed to download report: ${res.info().status} ${errorText}`);
      }

      const fileExists = await RNFetchBlob.fs.exists(filePath);
      if (!fileExists) {
        throw new Error('File does not exist after download');
      }

      const fileSize = await RNFetchBlob.fs.stat(filePath).then((stats) => stats.size);
      console.log(`File exists: ${fileExists}, size: ${fileSize}B`);

      if (fileSize <= 0) {
        throw new Error('Downloaded file is empty (0B)');
      }

      Alert.alert('Success', 'Report downloaded successfully');

      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(filePath);
      } else {
        RNFetchBlob.android.actionViewIntent(filePath, 'application/pdf');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', error.message || 'Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for AreaChart
  const lineChartData = monthlyStockData.map((item) => item.stock);

  // Custom dot component for small dots
  const Dot = ({ x, y, value }) => (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#000000',
        borderWidth: 0.5,
        borderColor: '#fff',
      }}
    />
  );

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
            <View className="flex-row items-center mr-2">
              <View className="flex-column">
                <Text style={{ fontSize: 10 }} className="text-black text-right">
                  Start Date
                </Text>
                <Text className="text-black text-sm font-bold">{displayDate(startDate)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCalendarPress('start')} className="ml-1.5">
                <Feather name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <View className="flex-column">
                <Text style={{ fontSize: 10 }} className="text-black text-right">
                  End Date
                </Text>
                <Text className="text-black text-sm font-bold">{displayDate(endDate)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleCalendarPress('end')} className="ml-1.5">
                <Feather name="calendar" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={datePickerMode === 'start' ? startDate || new Date() : endDate || new Date()}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'inline'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Dropdown + Search Input Section */}
        <View className="mb-5">
          <View className="bg-[#DB9245] rounded-lg mb-4 shadow-md">
            <Dropdown
              style={{
                height: 42,
                paddingHorizontal: 15,
                borderRadius: 12,
              }}
              containerStyle={{
                borderRadius: 8,
                backgroundColor: '#292C33',
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
                backgroundColor: '#292C33',
              }}
              itemTextStyle={{
                color: '#fff',
                fontSize: 14,
                paddingVertical: 4,
              }}
              iconStyle={{
                width: 24,
                height: 22,
                tintColor: '#fff',
              }}
              data={insightCategories}
              labelField="label"
              valueField="value"
              placeholder={'Left Over Stock Product Wise'}
              value={selectedInsightCategory}
              onChange={(item) => {
                setSelectedInsightCategory(item.value);
                navigation.navigate(item.value);
              }}
              renderRightIcon={() => <Ionicons name="chevron-down" size={18} color="#fff" />}
            />
          </View>

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

        {/* Table and Chart */}
        <View
          className="flex-1 bg-[#DB9245] rounded-xl px-4 pt-4 mt-4"
          style={{ maxHeight: verticalScale(460) }}
        >
          <View className="space-y-3 gap-2">
            {/* Total Stock Cumulative */}
            <View className="flex-row items-center rounded-xl overflow-hidden">
              <View className="bg-black w-1/2 px-4 py-4">
                <Text className="text-white text-sm font-semibold text-base">
                  Total Stock Cumulative
                </Text>
              </View>
              <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
                <Text className="text-right text-base font-semibold text-black">
                  {analyticsData[0]?.value?.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Total Orders Cumulative */}
            <View className="flex-row items-center rounded-xl overflow-hidden">
              <View className="bg-black w-1/2 px-4 py-4">
                <Text className="text-white text-sm font-semibold text-base">
                  Total Ordered Quantity
                </Text>
              </View>
              <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
                <Text className="text-right text-base font-semibold text-black">
                  {analyticsData[2]?.value?.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            {/* Stock Remaining Monthly */}
            <View className="flex-row items-center rounded-xl overflow-hidden mb-4">
              <View className="bg-black w-1/2 px-4 py-4">
                <Text className="text-white text-sm font-semibold text-base">
                  Stock Remaining
                </Text>
              </View>
              <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
                <Text className="text-right text-base font-semibold text-black">
                  {analyticsData[1]?.value?.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Legends and Area Chart */}
          {monthlyStockData.length > 0 && (
            <View className="items-center justify-center mt-2 relative">
              {/* Legends */}
              <View style={{ flex:1 ,position: 'absolute', top: 0, right: 10, flexDirection: 'row' }}>
                <View>
              <Text className="text-black text-xs text-center font-semibold">Month Start Stock</Text>
                <View
                  style={{
                    backgroundColor: '#FBDBB5',
                    padding: 4,
                    borderRadius: 4,
                    marginRight: 10,
                    width: 120,
                  }}
                >
                  
                  <Text className="text-black text-center font-bold text-xs">
                    {startStock ? startStock.toLocaleString('en-IN') : 'N/A'}
                  </Text>
                </View>
                </View>
                <View>
                <Text className="text-black text-xs text-center font-semibold">Month End Stock</Text>
                <View
                  style={{
                    backgroundColor: '#FBDBB5',
                    padding: 4,
                    borderRadius: 4,
                    width: 120,
                  }}
                > 
                  <Text className="text-black text-center font-bold text-xs">
                    {endStock ? endStock.toLocaleString('en-IN') : 'N/A'}
                  </Text>
                </View>
                </View>
              </View>

              {/* Area Chart */}
              <View style={{ height: 200, width: '100%', flexDirection: 'row', marginTop: 50 }}>
                <YAxis
                  data={lineChartData}
                  contentInset={{ top: 10, bottom: 10 }}
                  svg={{ fill: '#fff', fontSize: 10 }}
                  gridSvg={{ stroke: '#DB9245' }}
                  numberOfTicks={5}
                  formatLabel={(value) => value.toLocaleString('en-IN')}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <AreaChart
                    style={{ height: 200, width: '100%' }}
                    data={lineChartData}
                    svg={{ stroke: '#000000', strokeWidth: 0.5, fill: 'rgba(0, 0, 0, 0.2)' }}
                    contentInset={{ top: 10, bottom: 10 }}
                    curve={shape.curveLinear}
                    renderDecorator={({ x, y, value }) => (
                      <Dot key={value} x={x(value)} y={y(value)} value={value} />
                    )}
                  />
                  <XAxis
                    style={{ marginTop: 5 }}
                    data={monthlyStockData.map((_, index) => index)}
                    formatLabel={(index) => monthlyStockData[index]?.month || ''}
                    contentInset={{ left: 10, right: 10 }}
                    svg={{ fill: '#fff', fontSize: 10 }}
                    gridSvg={{ stroke: '#DB9245' }}
                  />
                </View>
              </View>
              <Text className="text-white font-bold text-lg text-center mt-14">
                Remaining Stock by Month
              </Text>
            </View>
          )}
        </View>

        {/* Download Button */}
        <View className=" mt-12 pb-5">
          <TouchableOpacity
            onPress={()=>ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT)}
            className="bg-[#DB9245] py-4 rounded-xl items-center"
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

export default LeftoverstockproductwiseScreen;