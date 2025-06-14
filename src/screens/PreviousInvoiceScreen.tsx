import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useFocusEffect } from '@react-navigation/native';
import { AccountStackParamList } from '../stacks/Account';
import { NODE_API_ENDPOINT } from '../utils/util';

type PreviousInvoiceScreenProps = NativeStackScreenProps<
  AccountStackParamList,
  'PreviousInvoiceScreen'
>;

const PreviousInvoiceScreen = ({ navigation }: PreviousInvoiceScreenProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const filtered = orders.filter((order: any) => {
      const firmName = order?.billingFrom?.firmName?.toLowerCase?.() ?? '';
      const status = order?.dueAmount === 0 ? 'completed' : 'active';
      return firmName.includes(queryLower) || status.includes(queryLower);
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);


  useFocusEffect(
    useCallback(() => {
      const getOrders = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${NODE_API_ENDPOINT}/custom-orders/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          });

          if (response.status === 401) {
            Alert.alert('Session Expired', 'Please log in again.');
            navigation.navigate('LoginScreen');
            return;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch invoices: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          console.log('Available IDs:', data.orders.map((order: any) => order._id));
          setOrders(data.orders || []);
        } catch (error) {
          console.error('Error fetching invoices:', error);
          Alert.alert('Error', `Failed to fetch invoices: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };

      if (currentUser?.token) {
        getOrders();
      }

      return () => {};
    }, [currentUser?.token, navigation]),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Invoices...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Fixed Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6"
        >
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Fixed Title */}
      <Text className="text-lg font-semibold text-black mb-4">All Invoices</Text>

      {/* Search Bar */}
      <View className="mb-2 rounded-lg">
        <TextInput
          className="bg-[#292C33] rounded-lg px-4 py-3 text-white text-lg"
          placeholder="Search by billing from name or status..."
          placeholderTextColor="#fff"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Scrollable Invoices List */}
      <ScrollView
        className="flex-1 mb-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => (
            <TouchableOpacity
              key={order._id}
              onPress={() => {
                navigation.navigate('ActiveInvoiceScreen', {
                  invoice: order,
                });
              }}
            >
              <LinearGradient
                colors={['#C7742D', '#FAD9B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-xs text-white">
                    Invoice ID: {order?._id || 'N/A'}
                  </Text>
                  <Text className="text-base text-white font-semibold">
                    {order?.billingTo?.firmName || 'Unknown Client'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-md font-semibold text-[#292C33]">
                    {order?.dueAmount === 0 ? 'Completed' : 'Active'}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : orders.length > 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="mt-2 text-black">No matching invoices found</Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="mt-2 text-black">No Invoices Found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PreviousInvoiceScreen;