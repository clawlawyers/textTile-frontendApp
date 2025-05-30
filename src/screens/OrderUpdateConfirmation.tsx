import React from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.
import Icon from 'react-native-vector-icons/Ionicons'; // You can change this to Ionicons, FontAwesome, etc.
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'OrderUpdateConfirmationScreen'
>;

const OrderUpdateConfirmationScreen = ({
  navigation,
  route,
}: AddNewUserProps) => {
  const [orderNumber, setOrderNumber] = React.useState(route.params.orderId);

  const currentClient = useSelector(
    (state: RootState) => state.common.currentClient,
  );

  const copyToClipboard = () => {
    Clipboard.setString(orderNumber);
    Alert.alert('Copied', 'Order number copied to clipboard.');
  };

  return (
    <View className="flex-1 bg-[#fdd8ac] px-4 pt-12 relative">
      {/* Back Button */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        <View className="flex-1 items-end -ml-4">
          <Text className="text-sm text-black">Order Creation For</Text>
          <Text className="text-base font-bold text-black">
            {currentClient.name}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text className="text-center text-lg font-bold text-black mt-6">
        Order Update Confirmation
      </Text>

      {/* Status */}
      <View className="flex-1 justify-center items-center">
        <Icon name="alert-circle" size={40} color="#c05f00" />
        <Text className="text-xl font-bold text-black mt-4">Order Updated</Text>
        <Text className="text-center mt-2 text-black">
          Order Has Been Update Successfully{'\n'}
          Order Number : <Text className="font-medium">{orderNumber}</Text>
        </Text>
      </View>

      {/* Copy Button */}
      <TouchableOpacity
        onPress={copyToClipboard}
        className="bg-[#e67e22] py-4 mx-4 mb-8 rounded-2xl items-center flex-row justify-center">
        <Icon1 name="copy" size={20} color="white" />
        <Text className="text-white font-bold text-base ml-2">
          Copy Order Number
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderUpdateConfirmationScreen;
