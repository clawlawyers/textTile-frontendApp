import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../stacks/Home';
import { RootState } from '../redux/store';
import { NODE_API_ENDPOINT } from '../utils/util';
import { verticalScale } from '../utils/scaling';

type WalletScreenProps = NativeStackScreenProps<HomeStackParamList, 'Wallet'>;

const WalletScreen = ({ navigation }: WalletScreenProps) => {
  const { height } = Dimensions.get('window');
  const walletSectionHeight = height * 0.82; // 75% of screen height
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [walletBalance, setWalletBalance] = useState<number>(4586); // Default fallback
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWalletBalance = async () => {
    if (!currentUser?.userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/managers/wallet/${currentUser.userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentUser.token || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet balance: ${response.status}`);
      }

      const data = await response.json();
      setWalletBalance(data.wallet.coins || 0); // Use wallet.coins from API response
    } catch (error: any) {
      console.error('Fetch wallet balance error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch wallet balance.');
      setWalletBalance(0); // Fallback to 0 on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance(); // Fetch on component mount
  }, []);

  const handleRecharge = async () => {
    try {
      await Linking.openURL('https://youfabriqs.com');
    } catch (error) {
      console.error('Error opening YouFabriqs website:', error);
      Alert.alert('Error', 'Failed to open YouFabriqs website.');
    }
  };

  return (
    <View className="flex-1 bg-[#FAD9B3]">
      <SafeAreaView className="flex-1 justify-between">
        {/* Wallet Section (75% height) */}
        <View
          className="bg-[#292C33]"
          style={{ height: walletSectionHeight, paddingHorizontal: 20, paddingTop: verticalScale(25) }}
        >
          {/* Top Icons */}
          <View className="flex-row justify-between items-center mb-6 pt-4">
            <TouchableOpacity
              className="bg-white/10 p-2 rounded-full"
              onPress={() => navigation.navigate('TextileImageGenerator')}
            >
              <Icon name="home" size={20} color="#DB9245" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white/10 p-2 rounded-full"
              onPress={fetchWalletBalance}
              disabled={isLoading}
            >
              <Icon name="restart" size={20} color={isLoading ? '#999' : '#DB9245'} />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View className="flex-1 pt-12 px-4 justify-center items-center align-center">
            <Image
              source={require('../assets/clawcoins.png')}
              style={{ width: 250, height: 162.5, marginBottom: 10 }}
            />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-center text-xl text-white font-bold">
              Your Wallet Balance
            </Text>
            <Text className="text-center font-bold text-[#DB9245] "
            style={{fontSize:verticalScale(50)}}>
              {isLoading ? 'Loading...' : walletBalance}
            </Text>
            <Text className="text-center  text-xl text-white font-medium ">
              Claw Credits
            </Text>

            {/* CC Value Box */}
            <View className="border border-white rounded-md px-3 py-1 mt-3 self-center w-fit">
              <Text className="text-sm text-white font-semibold text-center">
                1 Claw Credit = ₹ 5
              </Text>
            </View>
          </View>
        </View>

        {/* Recharge Button (Pinned to Bottom) */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl mx-auto"
          style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}
          onPress={handleRecharge}
        >
          <Text className="text-white text-center font-semibold text-base">
            Recharge Wallet
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default WalletScreen;