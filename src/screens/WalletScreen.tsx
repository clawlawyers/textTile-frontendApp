import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type WalletScreenProps = NativeStackScreenProps<HomeStackParamList, 'Wallet'>;

const WalletScreen = ({navigation}: WalletScreenProps) => {
  return (
    <View className="flex-1 bg-[#FAD9B3]">
      <SafeAreaView className="bg-[#292C33] rounded-b-2xl px-4 pt-3 pb-6">
        {/* Top Icons */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            className="bg-white/10 p-2 rounded-full"
            onPress={() => navigation.navigate('TextileImageGenerator')}>
            <Icon name="home" size={20} color="#DB9245" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 p-2 rounded-full">
            <Icon name="restart" size={20} color="#DB9245" />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <Text className="text-center text-white font-semibold">
          Your Wallet Balance
        </Text>
        <Text className="text-center text-4xl font-bold text-[#DB9245] mt-2">
          4586
        </Text>
        <Text className="text-center text-white font-medium mt-1">
          Claw Credits
        </Text>

        {/* CC Value Box */}
        <View className="border border-white rounded-md px-3 py-1 mt-3 self-center w-fit">
          <Text className="text-xs text-white text-center">
            1 Claw Credit = ₹ 5
          </Text>
        </View>
      </SafeAreaView>

      {/* Info Section */}
      <ScrollView className="px-5 mt-5">
        {/* Credit Usage */}
        <Text className="font-bold text-sm text-black mb-2">
          Credit Usage :
        </Text>
        <View className="mb-4">
          <Text className="text-black text-sm mb-1">
            • Per Image Generated Costs 1 CC
          </Text>
          <Text className="text-black text-sm mb-1">
            • Per Image Edit Costs 1 CC
          </Text>
          <Text className="text-black text-sm mb-1">
            • Per Image to Grid Generation Costs 2 CC
          </Text>
          <Text className="text-black text-sm mb-1">
            • Per Colour Index Replacement Costs 2 CC
          </Text>
        </View>

        {/* Packages */}
        <Text className="font-bold text-sm text-black mb-2">
          Available Packages :
        </Text>
        <Text className="text-black text-sm mb-4">
          • Current Available Package : ₹500 for 100 CC
        </Text>
      </ScrollView>

      {/* Recharge Button */}
      <TouchableOpacity className="bg-[#292C33] py-4 rounded-xl mx-5 mt-2 mb-6">
        <Text className="text-white text-center font-semibold text-base">
          Recharge Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WalletScreen;
