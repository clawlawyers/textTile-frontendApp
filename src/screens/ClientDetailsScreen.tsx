import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import DeleteConfirmation from '../components/DeleteConfirmation';
import PermissionDeniedDialog from '../components/PermissionDeniedDialog';

// const orders = [
//   {date: '25/05/2025', orderNo: '325698565478', status: 'Active'},
//   {date: '26/05/2025', orderNo: '325698565479', status: 'Active'},
//   {date: '27/05/2025', orderNo: '325698565480', status: 'Completed'},
//   {date: '28/05/2025', orderNo: '325698565481', status: 'Completed'},
// ];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ClientDetailsScreen'
>;

const ClientDetailsScreen = ({navigation, route}: AddNewUserProps) => {
  const [clientDetails, setClientDetails] = useState({
    name: '',
    phone: '',
    firmName: '',
    address: '',
    firmGSTNumber: '',
    email: '',
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showPermissionDeleteDialog, setShowPermissionDeleteDialog] =
    useState(false);

  console.log(orders);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  console.log(activeFirm);

  useFocusEffect(
    useCallback(() => {
      const getDetails = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/clients/${route.params.clientId}`,
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
              `Failed to fetch client details: ${response.status} ${errorText}`,
            );
          }

          const data = await response.json();
          setClientDetails(data);

          const getOrderHistory = await fetch(
            `${NODE_API_ENDPOINT}/orders/${route.params.clientId}/${activeFirm?._id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser?.token}`,
              },
            },
          );

          if (!getOrderHistory.ok) {
            const errorText = await getOrderHistory.text();
            throw new Error(
              `Failed to fetch order history: ${getOrderHistory.status} ${errorText}`,
            );
          }

          const orderHistory = await getOrderHistory.json();
          setOrders(orderHistory.orders);
        } catch (error) {
          console.error('Error fetching client details:', error);
        } finally {
          setLoading(false);
        }
      };

      getDetails();
    }, [currentUser?.token, route.params.clientId, activeFirm?._id]),
  );

  const handleDeleteClient = async () => {
    // if (currentUser?.type !== 'manager') {
    //   return;
    // }
    console.log(route.params.clientId);
    const deleteClient = await fetch(
      `${NODE_API_ENDPOINT}/clients/${route.params.clientId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      },
    );
    console.log(deleteClient);

    if (!deleteClient.ok) {
      const errorText = await deleteClient.text();
      throw new Error(
        `Failed to delete client: ${deleteClient.status} ${errorText}`,
      );
    }
    setShowPermissionDialog(false);
    const data = await deleteClient.json();
    console.log(data);

    navigation.goBack();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <ActivityIndicator size="large" color="#DB9245" />
        <Text className="mt-2 text-black">Loading Client Details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAD9B3] pt-14 px-4 pb-12">
      <StatusBar barStyle="dark-content" backgroundColor="#FBD7A2" />

      {/* Top Navigation */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      {/* Title + Edit */}
      <View className="flex-row justify-between items-center mb-2 m-2">
        <Text className="text-lg font-bold text-black">Client Details</Text>
        <TouchableOpacity
          className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center"
          onPress={() => {
            if (
              !currentUser?.permissions?.deleteClient &&
              currentUser?.type !== 'manager'
            ) {
              setShowPermissionDialog(true);
              return;
            }
            setShowPermissionDeleteDialog(true);
          }}>
          <Icon1 name="trash-2" size={15} color="black" />
        </TouchableOpacity>
      </View>
      <DeleteConfirmation
        visible={showPermissionDeleteDialog}
        onClose={() => setShowPermissionDeleteDialog(false)}
        type="Client"
        onDelete={handleDeleteClient}
      />

      <PermissionDeniedDialog
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      />

      {/* Client Info */}
      <View className="mb-2 m-2">
        <View className="flex flex-row">
          <Text className="text-base text-black font-bold ">
            Client Name :{'         '}
          </Text>
          <Text className="font-normal">{clientDetails.name}</Text>
        </View>

        <View className="flex flex-row">
          <Text className="text-base text-black font-bold ">
            Client Contact : {'     '}
          </Text>

          <Text className="font-normal">{clientDetails.phone}</Text>
        </View>

        <View className="flex flex-row">
          <Text className="text-base text-black font-bold ">
            Firm Name :{'            '}
          </Text>
          <Text className="font-normal">{clientDetails.firmName}</Text>
        </View>

        <View className="flex flex-row">
          <Text className="text-base text-black font-bold ">
            Firm GST : {'              '}
          </Text>
          <Text className="font-normal">{clientDetails.firmGSTNumber}</Text>
        </View>

        <View className="flex flex-row">
          <Text className="text-base text-black font-bold ">
            Firm Address :{'       '}
          </Text>
          <Text className="font-normal text-wrap text-start ">
            {clientDetails.address}
          </Text>
        </View>
      </View>

      {/* Recent Orders Scrollable */}
      <View className="rounded-xl m-2 mb-2 bg-[#DB9245] ">
        <Text className="text-white font-bold my-2 ml-4 text-base">
          {orders.length <= 0 ? 'No order Placed' : 'Recent Orders'}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="max-h-[200px]">
          {orders.map((order, index) => (
            <TouchableOpacity
              key={order._id}
              onPress={() => {
                if (order.status === 'pending') {
                  navigation.navigate('PendingOrderScreen', {
                    orderDetails: order,
                  });
                } else {
                  navigation.navigate('InvoiceScreen', {orderDetails: order});
                }
              }}>
              <LinearGradient
                key={index}
                colors={['#ffff', '#F1B97A']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="p-3 mb-3 flex-row justify-between items-center rounded-md">
                <View>
                  <Text className="text-xs text-black">
                    Order Placed On :{' '}
                    <Text className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </Text>
                  </Text>
                  <Text className="text-base text-black">
                    Order No :{' '}
                    <Text className="font-semibold">{order._id}</Text>
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="px-5 py-1 rounded-lg text-xs font-medium border">
                    {order.status}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mt-auto">
        {/* Bottom Buttons */}
        <TouchableOpacity
          className="bg-[#1F1F1F] py-4 rounded-xl items-center mb-2"
          onPress={() => {
            ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
          }}>
          <Text className="text-white font-semibold text-base">
            Generate Client Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#1F1F1F] py-4 rounded-xl items-center"
          onPress={() => {
            if (
              !currentUser?.permissions?.editClient &&
              currentUser?.type !== 'manager'
            ) {
              setShowPermissionDialog(true);
              return;
            }
            navigation.navigate('EditClientScreen', {
              clientDetails,
            });
          }}>
          <Text className="text-white font-semibold text-base">
            Update Client Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClientDetailsScreen;
