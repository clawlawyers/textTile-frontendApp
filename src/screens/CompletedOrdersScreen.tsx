import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderHistoryParamList} from '../stacks/OrderHistory';

type CompletedOrderProps = NativeStackScreenProps<
  OrderHistoryParamList,
  'CompletedOrder'
>;

const orders = [
  {
    id: '123456',
    title: '22KG Rayon Print',
    customer: 'Ranvir Singh Emporium',
    date: '02/02/2025',
  },
  {
    id: '123455',
    title: '2KG Rayon Print',
    customer: 'Ranbir Kapoor Textiles',
    date: '02/02/2025',
  },
];

const CompletedOrdersScreen = ({navigation}: CompletedOrderProps) => {
  return (
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
        <TouchableOpacity
          className="mb-8"
          onPress={() => {
            navigation.navigate('Notification');
          }}>
          {/* <FontistoIcon name="bell" size={25} color={'#DB9245'} /> */}
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-lg font-semibold text-black mb-4">
        Completed Orders
      </Text>

      {/* Orders List */}
      {orders.map(order => (
        <LinearGradient
          //   colors={['#db9245', '#FAD9B3']}
          //   start={{x: 0, y: 0}}
          //   end={{x: 1, y: 0}}
          //   locations={[0.4904, 1]} // Corresponds to 49.04% and 100%
          key={order.id}
          colors={['#C7742D', '#FAD9B3']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          className="rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-white">Order No: {order.id}</Text>
            <Text className="text-base text-white font-semibold">
              {order.title}
            </Text>
            <Text className="text-xs text-white">{order.customer}</Text>
          </View>
          <Text className="text-xs text-[#292C33]">{order.date}</Text>
        </LinearGradient>
      ))}
    </ScrollView>
  );
};

export default CompletedOrdersScreen;
