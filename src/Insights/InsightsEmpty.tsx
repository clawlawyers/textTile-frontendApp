/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../stacks/Account';

type InsightsEmptyProps = NativeStackScreenProps<
  AccountStackParamList,
  'InsightsEmpty'
>;

const InsightScreen: React.FC<InsightsEmptyProps> = ({ navigation }) => {
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<string | null>(null);
  const [searchProduct, setSearchProduct] = useState('');

  const insightCategories = [
    { label: 'Monthly product wise order percentage', value: 'MonthlyProductwiseOrdersScreen' },
    { label: 'Monthly design wise order percentage', value: 'MonthlyDesignwiseOrdersScreen' },
    { label: 'Monthly Advances vs Dues Product Wise', value: 'MonthlyAdvanceVsDuesProductwiseScreen' },
    { label: 'Monthly Order Placement Analytics', value: 'MonthlyOrderPlacementAnalyticsScreen' },
    { label: 'Left Over Stock Product Wise', value: 'LeftoverstockproductwiseScreen' },
    { label: 'Left Over Stock Design Wise', value: 'LeftoverstockDesignwiseScreen' },
  ];

  const handleSearch = () => {
    if (!selectedInsightCategory) {
      Alert.alert('Error', 'Please select an insight category first.');
      return;
    }
    console.log('Searching for product:', searchProduct);
  };

  const clearSearch = () => {
    setSearchProduct('');
    console.log('Search cleared');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FAD9B3]"
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
          <View className="flex-row items-center rounded-lg py-2 px-4">
            <View className="flex-column">
              <Text style={{ fontSize: 10 }} className="text-black text-right mr-1.5">
                Insights For
              </Text>
              <Text className="text-black text-sm font-bold mr-2.5">May 2025</Text>
            </View>
            <TouchableOpacity onPress={() => console.log('Open calendar')}>
              <Feather name="calendar" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

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
              placeholder="Select Insight Category"
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

        <View className="items-center justify-center flex-1">
          <View className="w-10 h-10 rounded-full bg-[#CA6800] items-center justify-center">
            <Text className="text-white text-2xl font-bold">!</Text>
          </View>
          <Text className="text-lg font-bold text-black mt-4">Insights Parameter Empty</Text>
          <Text className="text-sm text-black text-center mt-1 px-8">
            Please enter a search term
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default InsightScreen;