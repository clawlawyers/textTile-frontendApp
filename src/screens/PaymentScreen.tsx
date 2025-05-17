import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {Dropdown} from 'react-native-element-dropdown';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'PaymentScreen'
>;

type PaymentItem = {
  id: string;
  amount: string;
  mode: string;
};

const modeOptions = [
  {label: 'Advance', value: 'Advance'},
  {label: 'Cash', value: 'Cash'},
  {label: 'RTGS/NEFT', value: 'RTGS/NEFT'},
  {label: 'UPI', value: 'UPI'},
  {label: 'Cheque', value: 'Cheque'},
];

const PaymentScreen = ({navigation}: AddNewUserProps) => {
  const [paymentData, setPaymentData] = useState<PaymentItem[]>([
    {id: '1', amount: '₹ 10,000', mode: 'Advance'},
    {id: '2', amount: '₹ 15,000', mode: 'Advance'},
    {id: '3', amount: '₹ 695', mode: 'Advance'},
  ]);

  const handleModeChange = (index: number, value: string) => {
    const updatedData = [...paymentData];
    updatedData[index].mode = value;
    setPaymentData(updatedData);
  };

  return (
    <ScrollView className="flex-1 bg-[#F4D5B2] p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        <View className="flex-1 items-end -ml-4">
          <Text className="text-sm text-black">Order Creation For</Text>
          <Text className="text-base font-bold text-black">
            Rameswaram Emporium
          </Text>
          <View className="w-full">
            <Text className="text-xs text-center text-black">
              Order Number : 023568458464
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-lg font-semibold text-center mb-4">
        Payment Details
      </Text>

      {/* Total Amount */}
      <View className="flex-row justify-between items-center border border-black rounded-lg mb-2 overflow-hidden">
        <View className="bg-black px-4 py-4">
          <Text className="text-white font-semibold">Total Amount</Text>
        </View>
        <View className="px-4 py-3 flex-1">
          <Text className="text-right text-base font-semibold">₹ 3,25,695</Text>
        </View>
      </View>

      {/* Due Amount */}
      <View className="flex-row justify-between items-center border border-black rounded-lg mb-6 overflow-hidden">
        <View className="bg-black px-4 py-4">
          <Text className="text-white font-semibold">Due Amount</Text>
        </View>
        <View className="px-4 py-3 flex-1">
          <Text className="text-right text-base font-semibold">₹ 3,00,000</Text>
        </View>
      </View>

      {/* Add Payment Mode */}
      <Text className="text-base font-semibold mb-2">Add Payment Mode</Text>

      {paymentData.map((item, index) => (
        <View key={item.id} className="flex-row items-center mb-3">
          <TextInput
            value={item.amount}
            className="flex-1 border border-[#DB9245] rounded-lg px-4 py-2 mr-2 text-base bg-white"
            editable={false}
          />

          <Dropdown
            style={{
              backgroundColor: '#D1853A',
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 45,
              width: 130,
              justifyContent: 'center',
              zIndex: 10, // important
            }}
            containerStyle={{
              backgroundColor: '#D1853A',
              borderRadius: 8,
              borderWidth: 0,
              elevation: 10, // Android shadow fix
              zIndex: 1000, // make sure it sits above
            }}
            itemTextStyle={{color: '#fff'}}
            selectedTextStyle={{
              color: '#fff',
              fontWeight: '500',
              fontSize: 14,
            }}
            placeholderStyle={{color: '#fff'}}
            iconColor="#fff"
            data={modeOptions}
            labelField="label"
            valueField="value"
            value={item.mode}
            onChange={item => handleModeChange(index, item.value)}
            renderRightIcon={() => (
              <Icon name="chevron-down" size={16} color="#fff" />
            )}
            dropdownPosition="bottom" // force dropdown to open downward
          />
        </View>
      ))}

      {/* Update Payment Button */}
      <TouchableOpacity className="bg-[#D1853A] py-3 rounded-xl items-center mt-12">
        <Text className="text-white font-semibold text-base">
          Update Payment
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PaymentScreen;
