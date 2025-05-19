import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getListOfFirms, NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch} from 'react-redux';
import {login} from '../redux/authSlice';

type LoginProps = NativeStackScreenProps<HomeStackParamList, 'Login'>;

const LoginScreen = ({navigation}: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // <-- loader state
  const dispatch = useDispatch();

  const handleLogin = async () => {
    console.log('Login button pressed');

    if (email === '' || password === '') {
      Alert.alert('Login Failed', 'Please enter email and password.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
      return;
    }

    setLoading(true); // Start loader
    try {
      const loginData = await fetch(`${NODE_API_ENDPOINT}/auth/manager/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (!loginData.ok) {
        Alert.alert('Login Failed', 'Please check your email and password.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
        setLoading(false);
        return;
      }

      const data = await loginData.json();
      console.log('Login successful', data);

      dispatch(
        login({
          token: data.token,
          userId: data.user.id,
          name: data.user.name,
          email: data.user.email,
          type: data.user.type,
          companies: getListOfFirms(data.user.companies),
        }),
      );

      ToastAndroid.show('Login successful!', ToastAndroid.SHORT); // <-- success toast
      navigation.replace('Home');
      // You can navigate or save token here
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Login Failed', 'An error occurred. Please try again.', [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] px-6 pt-16">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
        <Icon name="arrow-left" size={20} color="#292C33" />
      </TouchableOpacity>

      {/* Logo */}
      <View className="place-items-start mb-8 mt-4">
        <Image
          source={require('../assets/logo.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Welcome Text */}
      <Text className="text-xl font-bold text-black">Welcome Back</Text>
      <Text className="text-lg font-semibold text-[#DB9245] mb-6">
        <Text className="text-black">to</Text> Inventory Automation
      </Text>
      <Text className="text-xs text-black mb-6">Log In To Your Account</Text>

      {/* Email Input */}
      <TextInput
        placeholder="Enter Your Email ID"
        placeholderTextColor="#666666"
        value={email}
        onChangeText={setEmail}
        className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
      />

      {/* Password Input */}
      <View className="flex-row items-center border rounded-lg border-[#A87E58] px-4 mb-2">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Your Password"
          placeholderTextColor="#666666"
          secureTextEntry={!showPassword}
          className="flex-1 text-[#000]"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#DB9245"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        className="mb-6 self-end"
        onPress={() => navigation.navigate('ResetPassword')}>
        <Text className="text-base font-bold text-[#DB9245]">
          Forgot Password ?
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center mb-6 flex-row justify-center"
        onPress={handleLogin}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Log In</Text>
        )}
      </TouchableOpacity>

      {/* Create Account */}
      <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
        <Text className="text-sm text-black">New Here ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-sm text-[#DB9245] font-semibold">
            Create An Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
