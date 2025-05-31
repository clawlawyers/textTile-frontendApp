import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderHistoryParamList} from '../stacks/OrderHistory';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import {setCurrentClient} from '../redux/commonSlice';
import {useFocusEffect} from '@react-navigation/native';
import {HomeStackParamList} from '../stacks/Home';

type CompletedOrderProps = NativeStackScreenProps<
  HomeStackParamList,
  'AlertSendScreen'
>;

const AlertSendScreen = ({navigation}: CompletedOrderProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = React.useState(true);
  const [processingOrderId, setProcessingOrderId] = React.useState<
    string | null
  >(null);

  const [orders, setOrders] = React.useState([]);

  const dispatch = useDispatch();

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

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
            (order: any) => order.status !== 'completed',
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

      // Optional cleanup if needed
      return () => {};
    }, [currentUser?.token, activeFirm?._id]),
  );

  const sendAlertHandle = async id => {
    try {
      setProcessingOrderId(id);
      const response = await fetch(
        `${NODE_API_ENDPOINT}/whatsapp/payment/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send alert: ${response.status} ${errorText}`,
        );
      }
      const data = await response.json();
      console.log(data);
      ToastAndroid.show('Alert Sent', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error sending alert:', error);
      ToastAndroid.show('Failed to send alert', ToastAndroid.SHORT);
    } finally {
      setProcessingOrderId(null);
    }
  };

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

      {/* Title */}
      <Text className="text-lg font-semibold text-black mb-4">
        Alert Sendable Orders
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
                dispatch(setCurrentClient(order.client));
                navigation.navigate('PendingOrderScreen', {
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
                  <TouchableOpacity
                    className="bg-[#15191A] py-2 px-3 rounded-md mt-1"
                    onPress={() => {
                      sendAlertHandle(order._id);
                      // ToastAndroid.show(
                      //   'Feature Coming Soon',
                      //   ToastAndroid.SHORT,
                      // );
                      // console.log('Send Alert');
                    }}>
                    {processingOrderId === order._id ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-xs text-center py-1 text-white font-medium">
                        Send Alert
                      </Text>
                    )}
                    {/* <Text className="text-xs text-center text-white font-medium">
                      Send Alert
                    </Text> */}
                  </TouchableOpacity>
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
            <Text className="mt-2 text-black">No Active Orders</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AlertSendScreen;
