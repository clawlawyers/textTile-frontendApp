/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {HomeStackParamList} from '../stacks/Home';

import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddClientScreen'
>;

const AddClientScreen = ({navigation}: AddNewUserProps) => {
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [firmName, setFirmName] = useState('');
  const [firmAddress, setFirmAddress] = useState('');
  const [firmGST, setFirmGST] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const addClientHandler = async () => {
    // if (currentUser?.type !== 'manager') {
    //   return;
    // }
    try {
      setLoading(true);
      const response = await fetch(`${NODE_API_ENDPOINT}/clients/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          name: clientName,
          phone: clientContact,
          firmName: firmName,
          address: firmAddress,
          firmGSTNumber: firmGST,
          email: clientEmail,
        }),
      });

      if (!response.ok) {
        setLoading(false);
        const errorText = await response.text();
        throw new Error(
          `Failed to add client: ${response.status} ${errorText}`,
        );
      }
      setLoading(false);
      setClientContact('');
      setClientEmail('');
      setClientName('');
      setFirmAddress('');
      setFirmGST('');
      setFirmName('');
      navigation.replace('ClientListScreen');
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD9B3]">
      <ScrollView
        className="flex-1 px-6 pt-14 pb-8"
        contentContainerStyle={{
          paddingBottom: keyboardVisible ? 200 : 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
            <Icon1 name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View className="items-start">
          <Image
            source={require('../assets/logo.png')}
            style={{width: 80, height: 80, resizeMode: 'contain'}}
          />
        </View>

        {/* Title & Subtitle */}
        <View className="mt-4 mb-2">
          <Text className="text-black text-xl font-bold">Set Up Client</Text>
          <Text className="text-black text-sm mt-1">
            Set Up Your Client first to proceed with{'\n'}
            <Text className="text-[#DB9245]">Order Placement</Text>
          </Text>
        </View>

        {/* Input Form */}
        <View className="space-y-4 gap-1">
          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Client Name"
            placeholderTextColor="#6B6B6B"
            value={clientName}
            onChangeText={setClientName}
          />
          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Client Contact"
            placeholderTextColor="#6B6B6B"
            keyboardType="phone-pad"
            value={clientContact}
            onChangeText={setClientContact}
          />

          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Client Email"
            placeholderTextColor="#6B6B6B"
            value={clientEmail}
            onChangeText={setClientEmail}
          />
          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Firm Name"
            placeholderTextColor="#6B6B6B"
            value={firmName}
            onChangeText={setFirmName}
          />
          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Firm Address"
            placeholderTextColor="#6B6B6B"
            multiline
            value={firmAddress}
            onChangeText={setFirmAddress}
          />
          <TextInput
            className="border border-[#DB9245] rounded-md px-4 py-3 text-black"
            placeholder="Enter Firm GST"
            placeholderTextColor="#6B6B6B"
            value={firmGST}
            onChangeText={setFirmGST}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-[#DB9245] py-4 rounded-xl items-center mt-6"
          onPress={addClientHandler}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Add Client
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddClientScreen;
