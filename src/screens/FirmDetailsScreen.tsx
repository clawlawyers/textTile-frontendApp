import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import DeleteConfirmation from '../components/DeleteConfirmation';
import {NODE_API_ENDPOINT} from '../utils/util';
import {retrieveAuth} from '../redux/authSlice';

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'FirmDetailsScreens'
>;

const FirmDetailsScreen = ({navigation, route}: AddNewUserProps) => {
  const {firmDetails} = route.params;

  console.log(firmDetails);

  const organizationName = useSelector(
    (state: RootState) => state.auth.user?.organizationName,
  );

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const dispatch = useDispatch();

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleDeleteFirm = async () => {
    // Prevent deletion of the currently active firm
    if (activeFirm?._id === firmDetails._id) {
      ToastAndroid.show(
        'You cannot delete the currently active firm.',
        ToastAndroid.SHORT,
      );
      return;
    }
    const response = await fetch(
      `${NODE_API_ENDPOINT}/companies/${firmDetails._id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete firm: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log(data);

    dispatch(retrieveAuth());

    setShowPermissionDialog(false);

    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 pb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Ionicons name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
        {/*
        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>

      <View className="flex-row justify-between mt-8 mb-5">
        <Text className="text-xl  font-bold text-black">Firm Details</Text>

        <TouchableOpacity
          className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center"
          onPress={() => setShowPermissionDialog(true)}>
          <Icon name="delete" size={18} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="space-y-2">
          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">
              Organization Name :
            </Text>
            <Text className="text-black flex-1">{organizationName}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">
              Firm Name :
            </Text>
            <Text className="text-black flex-1">{firmDetails.name}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">GST No :</Text>
            <Text className="text-black flex-1">{firmDetails.GSTNumber}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">Address :</Text>
            <Text className="text-black flex-1">{firmDetails.address}</Text>
          </View>
        </View>
      </ScrollView>

      <DeleteConfirmation
        type={'Firm'}
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onDelete={handleDeleteFirm}
      />

      {/* Bottom Button */}
      <TouchableOpacity
        className="bg-black py-4 mt-6 rounded-xl items-center justify-center"
        onPress={() => {
          console.log(firmDetails.inventory);
          if (firmDetails.inventory !== undefined) {
            navigation.navigate('InventoryProductList', {
              companyId: firmDetails._id,
            });
          } else {
            ToastAndroid.show(
              'Inventory not setup for this firm',
              ToastAndroid.SHORT,
            );
            // navigation.navigate('SetUpInventoryScreen');
          }
        }}>
        <Text className="text-white font-semibold text-sm">View Inventory</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirmDetailsScreen;
