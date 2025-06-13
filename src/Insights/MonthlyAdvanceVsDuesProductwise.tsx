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
import { PieChart } from 'react-native-svg-charts';
import { AccountStackParamList } from '../stacks/Account';

type MonthlyAdvancesVsDuesProductwiseScreenProps = NativeStackScreenProps<
  AccountStackParamList,
  'MonthlyAdvanceVsDuesProductwiseScreen'
>;

const MonthlyAdvanceVsDuesProductwiseScreen: React.FC<
  MonthlyAdvancesVsDuesProductwiseScreenProps
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
          let url = `${NODE_API_ENDPOINT}/analytics/payments?companyId=${companyId}`;
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
          const summary = data.summary;
          const totalamount = summary?.totalAmount || 0;
          const paid = summary?.totalPaidAmount || 0;
          const due = summary?.totalDueAmount || 0;
          setAnalyticsData([
            { name: 'Advanced Received', value: paid, color: '#292C33' },
            { name: 'Dues Receivable', value: due, color: '#666666' },
            { name: 'Total Receivable', value: totalamount, color: '#fff' },
          ]);
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
    if (!analyticsData.length) {
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
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/pdf',
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

  // Filter analyticsData to include only Advanced Received and Dues Receivable
  const chartData = analyticsData.filter(item => 
    item.name === 'Advanced Received' || item.name === 'Dues Receivable'
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
      className="flex-1 bg-[#FBDBB5] "
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
              placeholder={'Monthly Advances vs Dues Product Wise '}
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
        <View className=" flex-1 bg-[#DB9245] rounded-xl px-4 pt-4 mt-4  "
        style={{maxHeight:verticalScale(460)}}>
        <View className="space-y-3 gap-2">
          {/* Total Receivable */}
          <View className="flex-row items-center rounded-xl overflow-hidden">
            <View className="bg-black w-1/2 px-4 py-4">
              <Text className="text-white font-semibold text-base">Total Receivable</Text>
            </View>
            <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
              <Text className="text-right text-base font-semibold text-black">
                ₹{analyticsData[2]?.value?.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Advanced Received */}
          <View className="flex-row items-center rounded-xl overflow-hidden">
            <View className="bg-black w-1/2 px-4 py-4">
              <Text className="text-white font-semibold text-base">Advanced Received</Text>
            </View>
            <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
              <Text className="text-right text-base font-semibold text-black">
                ₹{analyticsData[0]?.value?.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Dues Receivable */}
          <View className="flex-row items-center rounded-xl overflow-hidden mb-4">
            <View className="bg-black w-1/2 px-4 py-4">
              <Text className="text-white font-semibold text-base">Dues Receivable</Text>
            </View>
            <View className="bg-[#FBDBB5] w-1/2 px-4 py-4">
              <Text className="text-right text-base font-semibold text-black">
                ₹{analyticsData[1]?.value?.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Doughnut Chart */}
        {chartData.length > 0 && (
          <View className="items-center justify-center mt-2">
            <View style={{ height: 250, justifyContent: 'center', alignItems: 'center' }}>
              <PieChart
                style={{ height: 250, width: 250 }}
                outerRadius={'95%'}
                innerRadius={'60%'} // Makes it a doughnut
                padAngle={0.03}
                data={chartData.map(item => ({
                  key: item.name,
                  value: item.value,
                  svg: { fill: item.color },
                }))}
              />
              <View
                style={{
                  position: 'absolute',
                  top: '42%',
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                <Text className="text-white font-bold text-md text-center">
                  Analytics on{'\n'}Order Placed
                </Text>
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-between flex-wrap mt-4 ">
              {chartData.map((item, index) => (
                <View key={index} className="flex-row items-between  mx-4 mt-4">
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor: item.color,
                      marginRight: 6,
                    }}
                  />
                  <Text className="text-white text-md font-semibold">{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>


        <View className="absolute bottom-0 left-0 right-0 px-5 pb-5 ">
          <TouchableOpacity
            onPress={downloadReport}
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

export default MonthlyAdvanceVsDuesProductwiseScreen;