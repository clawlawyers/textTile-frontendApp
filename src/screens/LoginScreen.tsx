import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch} from 'react-redux';
import {login, loginUser} from '../redux/authSlice';
import {setActiveFirm} from '../redux/commonSlice';

type LoginProps = NativeStackScreenProps<HomeStackParamList, 'Login'>;

const LoginScreen = ({navigation}: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // <-- loader state
  const [isUserLogin, setIsUserLogin] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dispatch = useDispatch();

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

  const handleLogin = async () => {
    console.log('Login button pressed');

    if (isUserLogin) {
      if (userId === '' || password === '') {
        Alert.alert('Login Failed', 'Please enter user ID and password.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
        return;
      }
    } else {
      if (email === '' || password === '') {
        Alert.alert('Login Failed', 'Please enter email and password.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
        return;
      }
    }

    setLoading(true); // Start loader
    try {
      // Use different endpoint based on login type
      const endpoint = isUserLogin
        ? `${NODE_API_ENDPOINT}/auth/salesman/login`
        : `${NODE_API_ENDPOINT}/auth/manager/login`;

      const loginData = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isUserLogin ? {user_id: userId, password} : {email, password},
        ),
      });

      if (!loginData.ok) {
        Alert.alert('Login Failed', 'Please check your credentials.', [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
        setLoading(false);
        return;
      }

      const data = await loginData.json();
      console.log('Login successful', data);

      if (data.user.type === 'manager') {
        dispatch(
          login({
            token: data.token,
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            type: data.user.type,
            companies: data.user.companies,
            organizationName: data.user.organizationName,
          }),
        );
      } else {
        dispatch(
          loginUser({
            token: data.token,
            userId: data.user.id,
            name: data.user.name,
            email: data.user.email,
            type: data.user.type,
            companies: data.user.companies,
            organizationName: data.user.organizationName,
            permissions: data.user.permissions,
          }),
        );
      }

      dispatch(setActiveFirm(data.user.companies[0]));

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD9B3]">
      <ScrollView
        className="flex-1 px-6 pt-16"
        contentContainerStyle={{
          paddingBottom: keyboardVisible ? 100 : 20,
          flexGrow: 1,
        }}>
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

        {/* Login Type Toggle */}
        <View className="flex-row items-center justify-center mb-6">
          <Text
            className={`mr-2 ${!isUserLogin ? 'font-bold' : ''} text-black`}>
            Manager
          </Text>
          <Switch
            trackColor={{false: '#A87E58', true: '#DB9245'}}
            thumbColor={isUserLogin ? '#fff' : '#fff'}
            onValueChange={() => setIsUserLogin(!isUserLogin)}
            value={isUserLogin}
          />
          <Text className={`ml-2 ${isUserLogin ? 'font-bold' : ''} text-black`}>
            User
          </Text>
        </View>

        <Text className="text-xs text-black mb-6">
          Log In To Your {isUserLogin ? 'User' : 'Manager'} Account
        </Text>

        {/* Conditional Input Fields */}
        {isUserLogin ? (
          /* User ID Input for User Login */
          <TextInput
            placeholder="Enter Your User ID"
            placeholderTextColor="#666666"
            value={userId}
            onChangeText={setUserId}
            className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
          />
        ) : (
          /* Email Input for Manager Login */
          <TextInput
            placeholder="Enter Your Email ID"
            placeholderTextColor="#666666"
            value={email}
            onChangeText={setEmail}
            className="rounded-md px-4 py-3 mb-4 text-[#000] border border-[#A87E58]"
          />
        )}

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
        <View className="flex-row justify-center mt-auto pt-6">
          <Text className="text-sm text-black">New Here ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-sm text-[#DB9245] font-semibold">
              Create An Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
