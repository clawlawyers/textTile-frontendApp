import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Clipboard,
} from 'react-native';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {RootState} from '../redux/store';
import {useSelector} from 'react-redux';
import {NODE_API_ENDPOINT} from '../utils/util';
import DeleteConfirmation from '../components/DeleteConfirmation';

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'UserDetailsScreen'
>;

const UserDetailsScreen = ({navigation, route}: AddNewUserProps) => {
  const [userDetails, setUserDetails] = useState(route.params.userDetails);
  const organizationName = useSelector(
    (state: RootState) => state.auth.user?.organizationName,
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const handleDeleteSalesMan = async () => {
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/salesmen/${userDetails._id}`,
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
        throw new Error(
          `Failed to fetch users: ${response.status} ${errorText}`,
        );
      }
      const data = await response.json();
      navigation.goBack();
    } catch (error) {}
  };
  const handleCopyUserId = () => {
    if (userDetails.user_id === 'Not Available') {
      ToastAndroid.show('No User ID to copy', ToastAndroid.SHORT);
      return;
    }
    Clipboard.setString(userDetails.user_id);
    ToastAndroid.show('User ID copied to clipboard', ToastAndroid.SHORT);
  };

  console.log(userDetails);
  

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
        <Text className="text-xl  font-bold text-black">User Details</Text>

        <TouchableOpacity
          className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center"
          onPress={() => {
            setShowPermissionDialog(true);
          }}>
          <Icon name="delete" size={18} color="#292C33" />
        </TouchableOpacity>
      </View>

      <DeleteConfirmation
        type={'User'}
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onDelete={handleDeleteSalesMan}
      />
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
            <Text className="font-semibold text-black w-[40%]">Name :</Text>
            <Text className="text-black flex-1">{userDetails.name}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">Phone No :</Text>
            <Text className="text-black flex-1">{userDetails.phone}</Text>
          </View>

          <View className="flex-row">
            <Text className="font-semibold text-black w-[40%]">
              Email Address :
            </Text>
            <Text className="text-black flex-1">{userDetails.email}</Text>
          </View>
        </View>
      </ScrollView>
      <View className="px-4 py-2 bg-[#DB9245] rounded-lg">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-base font-bold">User Login Details</Text>
            <TouchableOpacity onPress={handleCopyUserId}>
            <Icon name="content-copy" size={18} color="#292C33" />
            </TouchableOpacity>
        </View>

         <View className="flex-row justify-between items-center mt-2 pt-4 pb-2">
            <View className="flex-row flex-1">
             <Text className="font-medium text-black w-[40%]">User ID :</Text>
             <Text className="text-black flex-1">{userDetails.user_id}</Text>
            </View>
         </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        className="bg-black py-4 mt-6 rounded-xl items-center justify-center"
        onPress={() =>
          navigation.navigate('UserPermissions', {
            salesmanId: userDetails._id,
          })
        }>
        <Text className="text-white font-semibold text-base">
          Update User Permissions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserDetailsScreen;
