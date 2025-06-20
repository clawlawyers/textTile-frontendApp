import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
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
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
  const inventoryId = activeFirm?.inventory;

  console.log(activeFirm);

  const organizationName = useSelector(
    (state: RootState) => state.auth.user?.organizationName,
  );

  const dispatch = useDispatch();

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showDeleteInventoryDialog, setShowDeleteInventoryDialog] = useState(false);
  const [deleteInventoryLoading, setDeleteInventoryLoading] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const handleDeleteFirm = async () => {
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

  const handleDeleteAllInventory = async () => {
    if (!inventoryId) {
      ToastAndroid.show('No inventory exists for this firm.', ToastAndroid.SHORT);
      return;
    }
    setDeleteInventoryLoading(true);
    try {
      console.log('Deleting inventory with URL:', `${NODE_API_ENDPOINT}/inventory/delete/${inventoryId}`);
      console.log('Authorization token present:', !!currentUser?.token);
      const response = await fetch(
        `${NODE_API_ENDPOINT}/inventory/delete/${inventoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
        },
      );
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.json();
        } catch {
          errorText = await response.text();
        }
        console.error('API error response:', errorText);
        if (response.status === 404) {
          ToastAndroid.show('Inventory not found.', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed to delete inventory.', ToastAndroid.SHORT);
        }
        throw new Error(
          `Failed to delete inventory: ${response.status} ${JSON.stringify(errorText)}`,
        );
      }
      const data = await response.json();
      console.log('Inventory deleted:', data);
      ToastAndroid.show('All inventory deleted successfully', ToastAndroid.SHORT);
      dispatch(retrieveAuth());
      setShowDeleteInventoryDialog(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting inventory:', error.message);
      ToastAndroid.show('Failed to delete inventory', ToastAndroid.SHORT);
    } finally {
      setDeleteInventoryLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 pb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Ionicons name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>
      <View className='mt-2 justify-between flex-1'>
        <View className='bg-[#DB9245] pb-2 mt-2 px-3 justify-center rounded-xl'>
          <View className="flex-row justify-between px-1 mt-4 mb-3">
            <Text className="text-xl font-bold text-white">Firm Details</Text>
            <TouchableOpacity
              className="w-7 h-7 rounded-full justify-center items-center"
              onPress={() => setShowPermissionDialog(true)}>
              <Icon name="delete" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-1 gap-1">
              <View className="flex-row bg-[#FBDBB5] rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
                <Text className="font-semibold text-black w-[40%]">Company Name:</Text>
                <Text className="text-black">{firmDetails.organizationName}</Text>
              </View>
              <View className="flex-row bg-[#FBDBB5] rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
                <Text className="font-semibold text-black w-[40%]">Firm Name:</Text>
                <Text className="text-black">{firmDetails.name}</Text>
              </View>
              <View className="flex-row bg-[#FBDBB5] rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
                <Text className="font-semibold text-black w-[40%]">GST No:</Text>
                <Text className="text-black">{firmDetails.GSTNumber}</Text>
              </View>
              <View className="flex-row bg-[#FBDBB5] rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
                <Text className="font-semibold text-black w-[40%]">Address:</Text>
                <Text className="text-black">{firmDetails.address}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <DeleteConfirmation
          type={'Firm'}
          visible={showPermissionDialog}
          onClose={() => setShowPermissionDialog(false)}
          onDelete={handleDeleteFirm}
        />
        <DeleteConfirmation
          type={'Inventory'}
          visible={showDeleteInventoryDialog}
          onClose={() => setShowDeleteInventoryDialog(false)}
          onDelete={handleDeleteAllInventory}
        />

        {/* Bottom Button */}
        <View className='flex-row gap-2'>
          <TouchableOpacity
            className="bg-black py-4 flex-1 mt-6 rounded-xl items-center justify-center"
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
              }
            }}>
            <Text className="text-white font-semibold text-sm">View Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-black py-4 flex-1 mt-6 rounded-xl items-center justify-center ${deleteInventoryLoading ? 'opacity-50' : ''}`}
            onPress={() => setShowDeleteInventoryDialog(true)}
            disabled={deleteInventoryLoading}>
            <Text className="text-white font-semibold text-sm">
              {deleteInventoryLoading ? 'Deleting...' : 'Delete All Inventory'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FirmDetailsScreen;