/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView, // Using ScrollView for consistency, even if not strictly needed for just empty message
  Platform,
  StatusBar,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons'; // For chevron-down, search, back arrow, and warning
import Feather from 'react-native-vector-icons/Feather'; // For the calendar icon
import {Dropdown} from 'react-native-element-dropdown'; // For the dropdown component

// Import the HomeStackParamList from your navigation types file
import {HomeStackParamList} from '../../stacks/Home';

// Define the type for items in the Insight Category dropdown
interface InsightCategoryDropdownItem {
  label: string;
  value: string | null; // Value can be string or null for the placeholder
}

// Define the navigation props type for InsightScreen
type InsightScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'InsightsEmpty'
>;

const InsightsEmpty: React.FC<InsightScreenProps> = ({navigation}) => {
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<
    string | null
  >(null);
  const [searchProduct, setSearchProduct] = useState<string>('');

  // Data for the Insight Category dropdown
  const insightCategories: InsightCategoryDropdownItem[] = [
    {label: 'Select Insight Category', value: null},
    {label: 'Sales Performance', value: 'sales_performance'},
    {label: 'Customer Demographics', value: 'customer_demographics'},
    {label: 'Product Trends', value: 'product_trends'},
    {label: 'Marketing Effectiveness', value: 'marketing_effectiveness'},
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#F9E7D4] px-4 pt-4 pb-6" // Using consistent padding/background color scheme
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}>
      <View className="flex-1 justify-between">
        {/* Header */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
              <Ionicons name="arrow-back" size={20} color="#292C33" />{' '}
              {/* Using Ionicons for back */}
            </TouchableOpacity>
            {/* Insights For May 2025 section, similar to "Inventory For CLAW" */}
            <View className="flex-row items-center bg-white rounded-lg py-2 px-4 shadow-md">
              <Text className="text-black text-sm mr-1.5">Insights For</Text>
              <Text className="text-black text-sm font-bold mr-2.5">
                May 2025
              </Text>
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

          {/* Dropdown + Search Input */}
          <View className="flex-row items-center mb-4 mt-2">
            {/* Dropdown for Insight Category, occupying 30% width */}
            <View className="w-[30%] bg-[#D6872A] rounded-l-lg px-2">
              <Dropdown
                style={{height: 40}}
                containerStyle={{
                  borderRadius: 0, // No border radius for the dropdown list container itself
                  borderTopLeftRadius: 8, // Applied to the dropdown box itself
                  borderBottomLeftRadius: 8, // Applied to the dropdown box itself
                }}
                placeholderStyle={{
                  color: '#fff',
                  fontSize: 14,
                  textAlign: 'center',
                }}
                selectedTextStyle={{
                  color: '#fff',
                  fontSize: 14,
                  textAlign: 'center',
                }}
                iconStyle={{width: 20, height: 20, tintColor: '#fff'}}
                data={insightCategories}
                labelField="label"
                valueField="value"
                placeholder={
                  selectedInsightCategory || 'Select Insight Category'
                } // Fallback for placeholder
                value={selectedInsightCategory}
                onChange={(item: InsightCategoryDropdownItem) =>
                  setSelectedInsightCategory(item.value)
                }
                renderRightIcon={() => (
                  <Ionicons name="chevron-down" size={18} color="#fff" />
                )}
              />
            </View>
            {/* Search Product Input, taking remaining width and rounded-r-md */}
            <View className="flex-1 bg-white rounded-r-md px-3 flex-row items-center h-[40px]">
              {' '}
              {/* Adjusted height to match dropdown */}
              <TextInput
                placeholder="Search Product"
                placeholderTextColor="#888"
                className="flex-1 text-black"
                value={searchProduct}
                onChangeText={(text: string) => setSearchProduct(text)}
              />
              <Ionicons name="search" size={18} color="black" />
            </View>
          </View>
          {/* No "Download List" button for InsightScreen based on previous context */}
        </View>

        {/* Content Area - Insights Parameter Empty Message */}
        {/* Using ScrollView for consistency with ProductListScreen, but no scrolling content here */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center items-center -mt-20">
            <Ionicons name="warning-outline" size={50} color="#D6872A" />
            <Text className="text-xl font-bold text-gray-700 mt-2.5">
              Insights Parameter Empty
            </Text>
            <Text className="text-sm text-gray-500 mt-1.5">
              Please enter a search term
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Button - "Update Inventory" button is from ProductListScreen,
            replace with appropriate button for InsightScreen or remove if not needed */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl items-center justify-center mt-4"
          onPress={() => console.log('Generate Insights')}>
          <Text className="text-white font-semibold text-base">
            Generate Insights
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InsightsEmpty;
