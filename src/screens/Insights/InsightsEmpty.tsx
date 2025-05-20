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
import {HomeStackParamList} from '../../stacks/Home';
import Feather from 'react-native-vector-icons/Feather';

type InsightsEmptyProps = NativeStackScreenProps<
  HomeStackParamList,
  'InsightsEmpty'
>;

const InsightScreen: React.FC<InsightsEmptyProps> = ({navigation}) => {
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
                fontSize: 16,
                textAlign: 'left',
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
              placeholder={'Select Insight Category'}
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

        <View className="items-center justify-center flex-1">
          <View className="w-10 h-10 rounded-full bg-[#D6872A] items-center justify-center">
            <Text className="text-white text-2xl font-bold">!</Text>
          </View>
          <Text className="text-lg font-bold text-black mt-4">
            Insights Parameter Empty
          </Text>
          <Text className="text-sm text-black text-center mt-1 px-8">
            Please enter a search term
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InsightScreen;
