import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';

type OptVerificationProps = NativeStackScreenProps<
  HomeStackParamList,
  'OptVerification'
>;

const OTP_LENGTH = 6;

const OtpVerificationScreen = ({navigation}: OptVerificationProps) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDD9A0] px-6 pt-16">
      <KeyboardAvoidingView
        className="flex-1 justify-between"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
            <Icon name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>

          <View className="items-start mb-6">
            <Image
              source={require('../assets/logo.png')}
              style={{width: 64, height: 64}}
              resizeMode="contain"
            />
            <Text className="text-xl font-semibold mt-6">OTP Verification</Text>
            <Text className="text-sm mt-2 text-center">
              Enter the OTP that we just sent in your Email ID
            </Text>
            <Text className="font-semibold text-black mt-1">
              soumyabanik0@gmail.com
            </Text>
          </View>

          <View className="items-center mt-5">
            <View className="flex-row justify-between mt-6 space-x-2 gap-3">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  className="w-12 h-14 border border-[#A87E58] text-center rounded-lg text-lg"
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                />
              ))}
            </View>

            <View className="flex-row mt-4">
              <Text className="text-sm">Didn’t Receive Code ? </Text>
            </View>
            <View className="flex-row">
              <Text>You Can Resend in </Text>
              <Text className="font-bold text-black">{timer} Secs</Text>
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity
          className="mt-6 bg-[#DB9245] px-6 py-3 rounded-lg w-full mb-4"
          onPress={() => navigation.navigate('NewPassword')}>
          <Text className="text-white text-base font-semibold text-center">
            Verify OTP
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;
