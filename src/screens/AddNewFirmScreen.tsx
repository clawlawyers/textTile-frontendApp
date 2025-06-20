import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {updateCompanies} from '../redux/authSlice';

type AddNewFirmScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddNewFirmScreen'
>;

const AddNewFirmScreen = ({navigation}: AddNewFirmScreenProps) => {
  const [formdata, setFormData] = React.useState({
    name: '',
    address: '',
    GSTNumber: '',
  });

  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = React.useState(false);
  const isFormValid = formdata.name.trim() && formdata.address.trim() && formdata.GSTNumber.trim();

  const addNewFirmHandler = async () => {
    if (!isFormValid) {
      ToastAndroid.show('Please fill all the fields', ToastAndroid.SHORT);
      return;
    }
    console.log(formdata);
    setLoading(true);
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/companies/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(formdata),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || 'Failed to add new firm');
      }
      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response body:', data);

      setFormData({name: '', address: '', GSTNumber: ''});
      ToastAndroid.show('New Firm Added', ToastAndroid.SHORT);
      dispatch(updateCompanies([...currentUser?.companies, data]));
      navigation.replace('FirmAddedScreen');
    } catch (error) {
      console.error('Error while adding firm:', error);
      ToastAndroid.show('Error adding firm', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FAD9B3] px-6 pt-12">
      {/* Top Navigation */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />{' '}
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View className="items-start mt-4 mb-6">
        <Image
          source={require('../assets/logo.png')} // Replace with your icon
          className="w-28 h-28"
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-black text-2xl font-bold mb-2">Add New Firm</Text>
      <Text className="text-sm text-black mb-6 leading-relaxed">
        Enter All The Firm Details to Proceed with Adding A Firm. Currently One
        Inventory is designated to each Firm.
      </Text>

      {/* Input Fields */}
      <TextInput
        onChangeText={text => setFormData({...formdata, name: text})}
        value={formdata.name}
        placeholder="Enter Firm Name"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        onChangeText={text => setFormData({...formdata, address: text})}
        value={formdata.address}
        placeholder="Enter Firm Address"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-4 text-[#666666]"
      />
      <TextInput
        onChangeText={text => setFormData({...formdata, GSTNumber: text})}
        value={formdata.GSTNumber}
        placeholder="Enter Firm GST Number"
        placeholderTextColor="#666666"
        className="border border-[#D9A676] rounded-md px-4 py-3 mb-10 text-[#666666]"
      />

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-[#D6872A] py-4 rounded-xl items-center justify-center ${!isFormValid || loading ? 'opacity-50' : 'opacity-100'}`}
        onPress={addNewFirmHandler}
        disabled={!isFormValid || loading}>
        <Text className="text-white font-semibold text-base">
          {loading ? <ActivityIndicator color="#fff" /> : 'Save New Firm'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddNewFirmScreen;