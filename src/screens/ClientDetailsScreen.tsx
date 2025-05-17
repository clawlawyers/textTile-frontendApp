import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

const orders = [
  {date: '25/05/2025', orderNo: '325698565478', status: 'Active'},
  {date: '26/05/2025', orderNo: '325698565479', status: 'Active'},
  //   {date: '27/05/2025', orderNo: '325698565480', status: 'Completed'},
  //   {date: '28/05/2025', orderNo: '325698565481', status: 'Completed'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ClientListScreen'
>;

const ClientDetailsScreen = ({navigation}: AddNewUserProps) => {
  return (
    <View className="flex-1 bg-[#FBD7A2] pt-14 px-4 pb-4">
      <StatusBar barStyle="dark-content" backgroundColor="#FBD7A2" />

      {/* Top Navigation */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity>
      </View>

      {/* Title + Edit */}
      <View className="flex-row justify-between items-center mb-3 m-2">
        <Text className="text-lg font-bold text-black">Client Details</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Client Info */}
      <View className="mb-3 m-2">
        <View className="mb-1 flex flex-row">
          <Text className="text-[15px] text-black font-bold ">
            Client Name :{'         '}
          </Text>
          <Text className="font-normal">RR Enterprise</Text>
        </View>

        <View className="mb-1 flex flex-row">
          <Text className="text-[15px] text-black font-bold ">
            Client Contact : {'     '}
          </Text>

          <Text className="font-normal">Rajarshi Das</Text>
        </View>

        <View className="mb-1 flex flex-row">
          <Text className="text-[15px] text-black font-bold ">
            Firm Name :{'            '}
          </Text>
          <Text className="font-normal">RR Enterprise</Text>
        </View>

        <View className="mb-1 flex flex-row">
          <Text className="text-[15px] text-black font-bold ">
            Firm GST : {'              '}
          </Text>
          <Text className="font-normal">012365485964425</Text>
        </View>

        <View className="mb-1 flex flex-row">
          <Text className="text-[15px] text-black font-bold ">
            Firm Address :{'       '}
          </Text>
          <Text className="font-normal text-wrap text-start ">
            AF–56, Prasanta Apartment,{'\n'} Kestopur, Kolkata– 700101,{'\n'}{' '}
            India
          </Text>
        </View>
      </View>

      {/* Recent Orders Scrollable */}
      <View className="rounded-xl m-2 mb-3 bg-[#DB9245] max-h-[250px]">
        <Text className="text-white font-bold my-4 ml-4 text-base">
          Recent Orders
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {orders.map((order, index) => (
            <LinearGradient
              key={index}
              colors={['#ffff', '#F1B97A']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              className="p-3 mb-3 flex-row justify-between items-center mx-2 rounded-md">
              <View>
                <Text className="text-[13px] text-black mb-1">
                  Order Placed On :{' '}
                  <Text className="font-semibold">{order.date}</Text>
                </Text>
                <Text className="text-[13px] text-black">
                  Order No :{' '}
                  <Text className="font-semibold">{order.orderNo}</Text>
                </Text>
              </View>
              <Text className="px-7 py-1 rounded-lg text-xs font-medium border">
                {order.status}
              </Text>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Buttons */}
      <TouchableOpacity className="bg-[#1F1F1F] py-4 rounded-xl items-center mb-4">
        <Text className="text-white font-semibold text-base">
          Generate Client Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#1F1F1F] py-4 rounded-xl items-center"
        onPress={() => navigation.navigate('ClientFabricDetailsScreen')}>
        <Text className="text-white font-semibold text-base">
          Update Client Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClientDetailsScreen;
