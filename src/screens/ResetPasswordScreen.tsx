import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {useNavigation} from '@react-navigation/native';

type ResetPasswordProps = NativeStackScreenProps<
  HomeStackParamList,
  'ResetPassword'
>;

const ResetPasswordScreen = ({navigation}: ResetPasswordProps) => {
  //   const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleSendOTP = () => {
    console.log('Send OTP to:', email);
    navigation.navigate('OptVerification');
  };

  return (
    <View className="flex-1 bg-[#FDD9A0] px-6 pt-16">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
        <Icon name="arrow-left" size={20} color="#292C33" />{' '}
      </TouchableOpacity>

      {/* Logo */}
      <View className="items-start mb-6">
        <Image
          source={require('../assets/logo.png')} // Replace with actual logo path
          // eslint-disable-next-line react-native/no-inline-styles
          style={{width: 64, height: 64}}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-black mb-2">Reset Password</Text>

      {/* Description */}
      <Text className="text-base text-black mb-6">
        Please Enter Your Email ID and we will send an OTP in the next step to
        reset your password
      </Text>

      {/* Email Input */}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter Your Email ID"
        placeholderTextColor="#666666"
        keyboardType="email-address"
        className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
      />

      {/* Send OTP Button */}
      <View className="absolute bottom-4 left-6 right-6 flex-row justify-center">
        <TouchableOpacity
          className="bg-[#D68B2D] py-4 rounded-xl items-center justify-center w-full"
          onPress={handleSendOTP}>
          <Text className="text-white font-semibold text-base">Send OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;
