/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Icon1 from 'react-native-vector-icons/Feather'; // Assuming Icon1 is Feather (based on "arrow-left")
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from '../utils/scaling'; // Assuming scaling utilities are available

const InvoiceUpdated = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#FBDBB5]">
      <View className="flex-1 px-5 pt-6 relative">
        {/* Top Header Icons */}
        <View className="flex-row justify-between items-center px-4 mt-6 ">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center"
          >
            <Icon1 name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>

          {/* Uncomment if you want to add the notification icon back */}
          {/* <TouchableOpacity
            onPress={() => navigation.navigate('Notification')}
            className="relative"
          >
            <FontistoIcon name="bell" size={25} color={'#DB9245'} />
            <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
          </TouchableOpacity> */}
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center pb-12">
          {/* Logo with Shadow */}
          <View>
            <Image
              source={require('../assets/logo.png')} // Update the path based on your project
              style={{
                width: scale(150), // Responsive width
                height: verticalScale(140), // Responsive height
              }}
              resizeMode="contain"
            />
          </View>

          {/* Heading and Subtext */}
          <Text className="text-3xl font-bold text-black text-center mt-6">
            Invoice Updated
          </Text>
          <Text className="text-center mt-2 text-black text-base">
            Your Invoice is Updated{'\n'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};


export default InvoiceUpdated;