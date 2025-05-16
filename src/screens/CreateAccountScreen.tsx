import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
// import {useNavigation} from '@react-navigation/native';

type SignupProps = NativeStackScreenProps<HomeStackParamList, 'Signup'>;

const CreateAccountScreen = ({navigation}: SignupProps) => {
  //   const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-[#FBD3A0] px-6 pt-10">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
        <Icon name="arrow-left" size={20} color="#292C33" />{' '}
      </TouchableOpacity>

      {/* Logo Placeholder */}
      <View className="items-start mt-6 mb-4">
        {/* Replace this with your logo Image */}
        <Image
          source={require('../assets/logo.png')}
          className="w-20 h-20 "
          resizeMode="contain"
        />
      </View>

      {/* Title and Subtitle */}
      <Text className="text-black text-2xl font-bold text-start">
        Create An Account
      </Text>
      <Text className="text-black text-sm text-start mt-2">
        Sign Up Now And Automate Your Inventory
      </Text>

      {/* Input Fields */}
      <View className="mt-6">
        <TextInput
          placeholder="Enter Your Full Name"
          placeholderTextColor="#666666"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          placeholder="Enter Your Mobile Number"
          placeholderTextColor="#666666"
          keyboardType="phone-pad"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          placeholder="Enter Your Email ID"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          placeholder="Enter Company Name"
          placeholderTextColor="#666666"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          placeholder="Enter Company GST Number"
          placeholderTextColor="#666666"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
      </View>

      {/* Terms */}
      <Text className="text-xs text-center text-gray-600 mt-4">
        By clicking "Create Account" you agree to Claw Legaltech’s{' '}
        <Text className="underline text-[#DB9245]">Terms & Conditions</Text> and{' '}
        <Text className="underline text-[#DB9245]">Privacy Policy</Text>
      </Text>

      {/* Create Account Button */}
      <Pressable
        className="bg-[#DA8A33] rounded-md mt-6 p-4 items-center"
        onPress={() => navigation.navigate('Home')}>
        <Text className="text-white font-semibold text-base">
          Create Account
        </Text>
      </Pressable>

      {/* Login Link */}
      <Text className="text-center text-sm mt-4">
        Already Have An Account?{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-[#DA8A33] font-medium">Log In</Text>
        </TouchableOpacity>
      </Text>
    </ScrollView>
  );
};

export default CreateAccountScreen;
