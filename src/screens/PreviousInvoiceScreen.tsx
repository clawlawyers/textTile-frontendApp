import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderHistoryParamList} from '../stacks/OrderHistory';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useFocusEffect} from '@react-navigation/native';

type CompletedOrderProps = NativeStackScreenProps<
  OrderHistoryParamList,
  'CompletedOrder'
>;

// const orders = [
//   {
//     id: '123456',
//     title: '22KG Rayon Print',
//     customer: 'Ranvir Singh Emporium',
//     date: '02/02/2025',
//   },
//   {
//     id: '123455',
//     title: '2KG Rayon Print',
//     customer: 'Ranbir Kapoor Textiles',
//     date: '02/02/2025',
//   },
// ];

const CompletedOrdersScreen = ({navigation}: CompletedOrderProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = React.useState(true);

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const [orders, setOrders] = React.useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order: any) => {
      const clientName = order?.client?.name?.toLowerCase?.() ?? '';
      const queryLower = searchQuery.toLowerCase();

      const orderDate = order?.createdAt ? new Date(order.createdAt) : null;
      if (!orderDate || isNaN(orderDate.getTime())) return false;

      // Use UTC methods to avoid timezone issues
      const day = orderDate.getUTCDate().toString().padStart(2, '0');
      const month = (orderDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = orderDate.getUTCFullYear().toString();

      // Format date as MM/DD/YYYY and DD/MM/YYYY
      const formattedDateMMDDYYYY = `${month}${day}${year}`; // e.g., "05/06/2025"
      const formattedDateDDMMYYYY = `${day}${month}${year}`; // e.g., "06/05/2025"
      const dateMMDD = `${month}${day}`; // e.g., "0506"
      const dateDDMM = `${day}${month}`; // e.g., "0605"

      // Allow partial and full date matches
      const dateParts = [
        year,
        month,
        day,
        formattedDateMMDDYYYY,
        formattedDateDDMMYYYY,
        dateMMDD,
        dateDDMM,
      ];

      // Remove all non-digit characters for date search
      const matchesDate = dateParts.some(part =>
        part.includes(searchQuery.replace(/\//g, '')),
      );

      return clientName.includes(queryLower) || matchesDate;
    });

    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  useFocusEffect(
    useCallback(() => {
      const getOrders = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/orders/${activeFirm?._id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser?.token}`,
              },
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch orders: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          const completedOrder = data.orders.filter(
            (order: any) => order.status === 'completed',
          );
          setOrders(completedOrder);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };

      if (currentUser?.token) {
        getOrders();
      }

      return () => {};
    }, [currentUser?.token, activeFirm]),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Orders...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Fixed Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Fixed Title */}
      <Text className="text-lg font-semibold text-black mb-4">
        Completed Orders
      </Text>

      <View className="mb-2 rounded-lg">
        <TextInput
          className="bg-[#292C33] rounded-lg px-4 py-3 text-white text-lg"
          placeholder="Search by client name or date..."
          placeholderTextColor="#fff"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Scrollable Orders List */}
      <ScrollView
        className="flex-1 mb-8"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: any) => (
            <TouchableOpacity
              key={order._id}
              onPress={() => {
                navigation.navigate('InvoiceDetailScreen', {
                  orderDetails: order,
                });
              }}>
              <LinearGradient
                colors={['#C7742D', '#FAD9B3']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center">
                <View>
                  <Text className="text-xs text-white">
                    Order No: {order?._id}
                  </Text>
                  <Text className="text-base text-white font-semibold">
                    {order?.client?.name || 'Unknown Client'}
                  </Text>
                </View>
                <Text className="text-xs text-[#292C33]">
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })
                    : 'N/A'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : orders.length > 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="mt-2 text-black">No matching orders found</Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="mt-2 text-black">No Completed Orders</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CompletedOrdersScreen;
