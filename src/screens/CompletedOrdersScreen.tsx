import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
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

  const [orders, setOrders] = React.useState([]);
  useFocusEffect(
    useCallback(() => {
      const getOrders = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${NODE_API_ENDPOINT}/orders`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          });
          console.log(response);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch orders: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          console.log(data);
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

      // Optional cleanup function
      return () => {};
    }, [currentUser?.token]),
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Orders...</Text>
      </View>
    );
  }

  console.log(orders);

  return (
    <View className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Fixed Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        {/* <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity> */}
      </View>

      {/* Fixed Title */}
      <Text className="text-lg font-semibold text-black mb-4">
        Completed Orders
      </Text>

      {/* Scrollable Orders List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}>
        {orders.length > 0 ? (
          orders.map(order => (
            <TouchableOpacity
              key={order._id}
              onPress={() => {
                console.log('Order', order);
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
                    Order No: {order._id}
                  </Text>
                  <Text className="text-base text-white font-semibold">
                    {order.client.name}{' '}
                  </Text>
                </View>
                <Text className="text-xs text-[#292C33]">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))
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
