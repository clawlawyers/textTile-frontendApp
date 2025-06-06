/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import Feather from 'react-native-vector-icons/Feather';
import {PieChart} from 'react-native-svg-charts';

type MonthlyAdvanceVsDuesProductwiseScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'MonthlyAdvanceVsDuesProductwiseScreen'
>;

const MonthlyAdvanceVsDuesProductwiseScreen: React.FC<
  MonthlyAdvanceVsDuesProductwiseScreenProps
> = ({navigation}) => {
  const [selectedInsightCategory, setSelectedInsightCategory] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');

  const insightCategories = [
    {label: 'Select Insight Category', value: null}, // Default placeholder item
    {label: 'Sales Performance', value: 'sales_performance'},
    {label: 'Customer Demographics', value: 'customer_demographics'},
    {label: 'Product Trends', value: 'product_trends'},
    {label: 'Marketing Effectiveness', value: 'marketing_effectiveness'},
  ];

  return (
    <SafeAreaView
      // Apply background color directly with NativeWind
      className="flex-1 bg-[#F9E7D4]"
      // Conditional padding for Android StatusBar
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}>
      <View className="flex-1 px-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5 mt-2.5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full border border-[#292C33] justify-center items-center">
            <Ionicons name="arrow-back" size={20} color="#292C33" />{' '}
          </TouchableOpacity>
          <View className="flex-row items-center rounded-lg py-2 px-4">
            <View className="flex-column">
              <Text
                style={{fontSize: 10}}
                className="text-black text-right mr-1.5">
                Insights For
              </Text>
              <Text className="text-black text-sm font-bold mr-2.5">
                May 2025
              </Text>
            </View>
            <TouchableOpacity onPress={() => console.log('Open calendar')}>
              <Feather
                name="calendar"
                size={20}
                color="#000"
                className="ml-1.5"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown + Search Input Section */}
        <View className="mb-5">
          <View className="bg-[#D6872A] rounded-lg mb-4">
            <Dropdown
              style={{height: 42, paddingHorizontal: 15}}
              containerStyle={{borderRadius: 8}}
              placeholderStyle={{
                color: '#fff',
                fontSize: 13,
                textAlign: 'center',
              }}
              selectedTextStyle={{
                color: '#fff',
                fontSize: 14,
                textAlign: 'left',
              }}
              iconStyle={{width: 24, height: 22, tintColor: '#fff'}}
              data={insightCategories}
              labelField="label"
              valueField="value"
              placeholder={'Monthly Advance vs Dues Product Wise  '}
              value={selectedInsightCategory}
              onChange={item => setSelectedInsightCategory(item.value)}
              renderRightIcon={() => (
                <Ionicons name="chevron-down" size={18} color="black" />
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
            <TouchableOpacity onPress={() => console.log('Search product')}>
              <Ionicons name="search" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Receivables Summary */}
        <View className="bg-[#D6872A] rounded-xl p-4 mb-5">
          {/* Receivables Summary */}
          <View className="bg-[#D6872A] rounded-xl  mb-5">
            {[
              {label: 'Total Receivable', value: '$ 45,36,895'},
              {label: 'Advance Received', value: '$ 15,36,895'},
              {label: 'Dues Receivable', value: '$ 30,00,000'},
            ].map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between mb-1 rounded-xl bg-[#E89A4D]">
                <View className="w-1/2 bg-[#292C33] p-2 justify-center items-center rounded-l-lg">
                  <Text className="text-white font-semibold text-sm">
                    {item.label}
                  </Text>
                </View>
                <View className="w-1/2 bg-[#FBDBB5] justify-center items-center rounded-r-lg">
                  <Text className="font-semibold text-sm">{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Donut Chart */}
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View style={{height: 200, width: 200}}>
              <PieChart
                style={{height: 200}}
                outerRadius="90%"
                innerRadius="50%"
                padAngle={0}
                data={[
                  {
                    key: 1,
                    value: 30,
                    svg: {fill: '#292C33'},
                  },
                  {
                    key: 2,
                    value: 70,
                    svg: {fill: '#666666'},
                  },
                ]}
              />
              <View
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}>
                <Text
                  style={{fontSize: 10}}
                  className="text-white font-semibold text-center">
                  Analytics on{'\n'}Order Placed
                </Text>
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center gap-x-10  mt-3">
              <View className="flex-row items-center">
                <View className="w-5 h-5  bg-[#292C33] mr-1.5" />
                <Text className="text-white text-sm">Dues Receivable</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-5 h-5  bg-[#666666] mr-1.5" />
                <Text className="text-white text-sm">Advance Received</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MonthlyOrderPlacementAnalyticsScreen')
            }
            className="bg-[#D6872A] py-4 rounded-xl items-center">
            <Text className="text-white font-semibold text-base">
              Download Report
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MonthlyAdvanceVsDuesProductwiseScreen;
