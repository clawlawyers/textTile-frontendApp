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
  ActivityIndicator,
  ToastAndroid,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
// import {useNavigation} from '@react-navigation/native';

type SignupProps = NativeStackScreenProps<HomeStackParamList, 'Signup'>;

const CreateAccountScreen = ({navigation}: SignupProps) => {
  //   const navigation = useNavigation();

  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    phoneNumber: '',
    email: '',
    organisationName: '',
    GSTNumber: '',
  });

  const handleCreateAccount = async () => {
    // Implement account creation logic here

    if (
      !formData.GSTNumber ||
      !formData.organisationName ||
      !formData.email ||
      !formData.name ||
      !formData.phoneNumber
    ) {
      ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    const response = await fetch(
      `${NODE_API_ENDPOINT}/auth/accountCreatationRequest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      },
    );

    console.log(response);

    if (!response.ok) {
      setLoading(false);
      const errorText = await response.text();
      throw new Error(
        `Failed to create account: ${response.status} ${errorText}`,
      );
    }
    const data = await response.json();
    console.log(data);

    setLoading(false);

    ToastAndroid.show('Account creation request sent', ToastAndroid.SHORT);

    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      organisationName: '',
      GSTNumber: '',
    });

    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <ScrollView className="flex-1 bg-[#FAD9B3] px-6 pt-10">
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
          onChangeText={text => setFormData({...formData, name: text})}
          value={formData.name}
          placeholder="Enter Your Full Name"
          placeholderTextColor="#666666"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          onChangeText={text => setFormData({...formData, phoneNumber: text})}
          value={formData.phoneNumber}
          placeholder="Enter Your Mobile Number"
          placeholderTextColor="#666666"
          keyboardType="phoneNumber-pad"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          onChangeText={text => setFormData({...formData, email: text})}
          value={formData.email}
          placeholder="Enter Your Email ID"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          onChangeText={text =>
            setFormData({...formData, organisationName: text})
          }
          value={formData.organisationName}
          placeholder="Enter Organisation Name"
          placeholderTextColor="#666666"
          className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
        />
        <TextInput
          onChangeText={text => setFormData({...formData, GSTNumber: text})}
          value={formData.GSTNumber}
          placeholder="Enter organisationName GST Number"
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
        disabled={loading}
        className="bg-[#DA8A33] rounded-md mt-6 p-4 items-center"
        onPress={handleCreateAccount}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Create Account
          </Text>
        )}
      </Pressable>

      {/* Login Link */}
      <Text className="text-center text-sm mt-4">
        Already Have An Account?{' '}
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text className="text-[#DA8A33] font-medium">Log In</Text>
        </TouchableOpacity>
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;
