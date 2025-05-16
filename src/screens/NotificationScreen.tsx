import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import MaterialIconsIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type NotificationProps = NativeStackScreenProps<
  HomeStackParamList,
  'Notification'
>;

const notifications = [
  {
    type: 'Stock Alert',
    title: 'Item 22KG Rayon Print',
    subtitle: 'Quantity < 10%',
    time: '01:22',
  },
  {
    type: 'Order Alert',
    title: '15Kg Heavy Pressed Sheet',
    subtitle: 'Order Created for Aditya Enterprise',
    time: '01:15',
  },
  {
    type: 'Inventory Alert',
    title: '15Kg Heavy Pressed Sheet',
    subtitle: 'Item Added in Inventory',
    time: '01:05',
  },
  {
    type: 'Inventory Alert',
    title: '5Kg Heavy Pressed Sheet',
    subtitle: 'Item Removed From Inventory',
    time: '01:00',
  },
];

export default function NotificationScreen({navigation}: NotificationProps) {
  return (
    <View className="flex-1 bg-[#FFE0B2] pt-12 px-4">
      {/* Header */}
      <View className="flex flex-row justify-between px-3">
        <View>
          <View className="flex-row items-center mb-4">
            <View className="border rounded-full p-1">
              <MaterialIconsIcon name="person-outline" size={25} />
            </View>
            <View className="mt-4 px-4">
              <Text className="text-black">Admin</Text>
              <Text className="text-base font-bold mb-4">
                Soumya Snigdha Banik
              </Text>
            </View>
          </View>
        </View>
        <View className="mt-6 ">
          {/* <FontistoIcon name="bell" size={25} color={'#DB9245'} /> */}
          <View className="relative">
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
          </View>
        </View>
      </View>

      {/* Notifications Box */}
      <View className="bg-[#262626] rounded-xl flex-1 mb-4">
        <View className="flex-row justify-between items-center mb-4  p-4">
          <Text className="text-3xl font-semibold text-[#FBDBB5]">
            Notifications
          </Text>
          <TouchableOpacity className="rounded-full p-1 border border-[#FBDBB5]">
            <FeatherIcon name="trash-2" size={17} color="#FBDBB5" />
          </TouchableOpacity>
        </View>

        <ScrollView className="space-y-4">
          {notifications.map((item, index) => (
            <LinearGradient
              key={index}
              colors={['#DB9245', '#292C33']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              className="rounded-lg p-3 mb-1">
              <Text className="text-xs text-white">{item.type}</Text>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-semibold">{item.title}</Text>
                  <Text className="text-white text-xs">{item.subtitle}</Text>
                </View>
                <Text className="text-xs text-white">{item.time}</Text>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
