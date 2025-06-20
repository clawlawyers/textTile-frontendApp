import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {AddNewUserStackParamList} from '../stacks/AddNewUser';
import {NODE_API_ENDPOINT} from '../utils/util';
import {RootState} from '../redux/store';
import {useSelector} from 'react-redux';
import EditInventoryProduct from './EditInventoryProduct';

type UserPermissionsProps = NativeStackScreenProps<
  AddNewUserStackParamList,
  'UserPermissions'
>;

interface PermissionState {
  _id: string;
  // addFirm: boolean;
  deleteClient: boolean;
  addClient: boolean;
  generateInvoice: boolean;
  viewInventory: boolean;
  editInventory: boolean;
  createOrder: boolean;
  addInvetory: boolean;
  editClient: boolean;
  description: string;
  __v: number;
  salesman: string;
}

const UserPermissionScreen = ({navigation, route}: UserPermissionsProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      if (currentUser?.type !== 'manager') {
        return;
      }
      try {
        const response = await fetch(
          `${NODE_API_ENDPOINT}/salesmen/${route.params.salesmanId}/getPermissions`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          },
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch user permissions: ${response.status} ${errorText}`,
          );
        }
        const data = await response.json();
        setPermissions(data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        Alert.alert('Error', 'Failed to fetch user permissions');
      }
    };
    getPermissions();
  }, [currentUser?.token, currentUser?.type, route.params.salesmanId]);

  const togglePermission = (key: keyof PermissionState) => {
    if (permissions && typeof permissions[key] === 'boolean') {
      setPermissions({
        ...permissions,
        [key]: !permissions[key],
      });
    }
  };

  const updatePermissions = async () => {
    if (!permissions || currentUser?.type !== 'manager') {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/salesmen/${route.params.salesmanId}/updatePermissions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
          body: JSON.stringify({permissions: permissions}),
        },
      );

      console.log(response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update permissions: ${response.status} ${errorText}`,
        );
      }

      const data = await response.json();
      console.log('Permissions updated:', data);
      ToastAndroid.show('Permissions Updated', ToastAndroid.SHORT);
      navigation.replace('AddNewUserAdded');
    } catch (error) {
      console.error('Error updating permissions:', error);
      Alert.alert('Error', 'Failed to update user permissions');
    } finally {
      setLoading(false);
    }
  };

  const renderCheckbox = (
    label: string,
    permissionKey: keyof PermissionState,
  ) => {
    const isChecked = permissions ? permissions[permissionKey] : false;


    return (
      <TouchableOpacity
        key={label}
        className="flex-row items-center mb-1 ml-5"
        onPress={() => togglePermission(permissionKey)}>
        <View
          className={`w-4 h-4 border border-[#DB9245] rounded-full mr-3 ${
            isChecked ? 'bg-[#DB9245]' : ''
          }`}
        />
        <Text className="text-[#FBDBB5] text-sm">{label}</Text>
      </TouchableOpacity>
    );
  };

  const handleSelectAllInventory = ()=>{
    if(permissions){
      setPermissions({
        ...permissions,
        viewInventory:true,
        addInvetory:true,
        editInventory:true,
      })
    }
  }

  const handleSelectclientmanagement = ()=>{
    if(permissions){
      setPermissions({
        ...permissions,
        addClient:true,
        editClient:true,
        deleteClient:true,
      })
    }
  }

  const handleSelectordermanagement = ()=>{
    if(permissions){
      setPermissions({
        ...permissions,
        createOrder:true,
        generateInvoice:true,
      })
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#FAD7AF] px-6 pt-12">
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-1">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center mb-6">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View className="items-start mt-4 mb-6">
        <Image
          source={require('../assets/logo.png')}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Title and Subtitle */}
      <Text className="text-black text-2xl font-bold mb-1">
        Set User Permissions
      </Text>
      <Text className="text-sm text-black mb-4 leading-snug">
        Set User Permissions as to what{' '}
        {/* <Text className="text-[#C16800] font-semibold">Deepika Padukone</Text>{' '} */}
        can be allowed to access and modify.
      </Text>

      {/* Firm Management Section */}
      {/* <View className="bg-[#1E1E1E] rounded-xl p-4 mb-2">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
          <View className="w-4 h-4 border border-[#DB9245] rounded-full mr-3" />
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Firm Management
            </Text>
          </View>
        </View>
        {renderCheckbox('Add Firm', 'addFirm')}
      </View> */}

      {/* Client Management Section */}
      <View className="bg-[#1E1E1E] rounded-xl p-4 mb-2">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
        <TouchableOpacity onPress={handleSelectclientmanagement}>
          <View
            className={`w-4 h-4 border border-[#DB9245] rounded-full mr-3 ${
              permissions?.addClient &&
              permissions?.editClient &&
              permissions?.deleteClient
                ? 'bg-[#DB9245]'
                : ''
            }`}
          />
        </TouchableOpacity>
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Client Management
            </Text>
          </View>
        </View>
        {renderCheckbox('Add Client', 'addClient')}
        {renderCheckbox('Edit Client', 'editClient')}
        {renderCheckbox('Delete Client', 'deleteClient')}
      </View>

      {/* Order Management Section */}
      <View className="bg-[#1E1E1E] rounded-xl p-4 mb-2">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
        <TouchableOpacity onPress={handleSelectordermanagement}>
          <View
            className={`w-4 h-4 border border-[#DB9245] rounded-full mr-3 ${
              permissions?.createOrder &&
              permissions?.generateInvoice 
                ? 'bg-[#DB9245]'
                : ''
            }`}
          />
        </TouchableOpacity>
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Order Management
            </Text>
          </View>
        </View>
        {renderCheckbox('Create Order', 'createOrder')}
        {renderCheckbox('Generate Invoice', 'generateInvoice')}
      </View>

      {/* Inventory Management Section */}
      <View className="bg-[#1E1E1E] rounded-xl p-4 mb-5">
        <View className="text-[#FAD7AF] font-semibold flex flex-row">
        <TouchableOpacity onPress={handleSelectAllInventory}>
          <View
            className={`w-4 h-4 border border-[#DB9245] rounded-full mr-3 ${
              permissions?.viewInventory &&
              permissions?.addInvetory &&
              permissions?.editInventory
                ? 'bg-[#DB9245]'
                : ''
            }`}
          />
        </TouchableOpacity>
          <View>
            <Text className="text-[#CA6800] font-semibold mb-2 ">
              Inventory Management
            </Text>
          </View>
        </View>
        {renderCheckbox('View Inventory', 'viewInventory')}
        {renderCheckbox('Add Inventory', 'addInvetory')}
        {renderCheckbox('Edit Inventory', 'editInventory')}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-[#D6872A] py-4 rounded-xl items-center justify-center mb-6"
        disabled={loading}
        onPress={updatePermissions}>
        <Text className="text-white font-semibold text-base">
          {loading ? 'Updating...' : 'Update User Permission'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserPermissionScreen;
