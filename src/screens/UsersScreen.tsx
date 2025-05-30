import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AccountStackParamList} from '../stacks/Account';

import LinearGradient from 'react-native-linear-gradient';

import Icon1 from 'react-native-vector-icons/Feather';
import DeleteConfirmation from '../components/DeleteConfirmation';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'UsersScreen'
>;

const firms = new Array(3).fill({
  date: 'Date Added : 02/05/2025',
  permission: 'Partial Permission',
  name: 'Rajarshi Das',
});

const UsersScreen = ({navigation}: AddNewUserProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const [users, setUsers] = useState([]);

  const [userId, setUserId] = useState('');

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [getLoading, setGetLoading] = useState(true);

  console.log(users);

  useFocusEffect(
    useCallback(() => {
      console.log('Users Screen');

      const getAllUsers = async () => {
        setGetLoading(true);
        try {
          const response = await fetch(
            `${NODE_API_ENDPOINT}/salesmen/manager/${currentUser?.userId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser?.token}`,
              },
            },
          );
          if (!response.ok) {
            setGetLoading(false);
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch users: ${response.status} ${errorText}`,
            );
          }
          setGetLoading(false);
          const data = await response.json();
          console.log(data);
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      if (currentUser?.type === 'manager') {
        getAllUsers();
      }
    }, [currentUser?.token, currentUser?.type, currentUser?.userId]),
  );

  const handleDeleteSalesMan = async () => {
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/salesmen/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch users: ${response.status} ${errorText}`,
        );
      }
      const data = await response.json();
      ToastAndroid.show('User Deleted', ToastAndroid.SHORT);
      setUsers(users.filter(item => item._id !== userId));
      setShowPermissionDialog(false);
    } catch (error) {}
  };

  if (getLoading) {
    return (
      <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 flex justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity> */}
      </View>
      {/* Title */}
      <Text className="text-lg font-bold text-black mb-4 mt-10">
        Your Salesmans
      </Text>

      {!getLoading && users.length === 0 && (
        <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 flex justify-center items-center">
          <Text>No Users</Text>
        </View>
      )}
      <DeleteConfirmation
        type={'User'}
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onDelete={handleDeleteSalesMan}
      />
      {/* Firms List */}
      <ScrollView className="flex-1 mb-4">
        {users.map((item, index) => (
          <LinearGradient
            key={index}
            colors={['#DB9245', '#FAD9B3']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            className="p-3 rounded-xl mb-3 flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-white mb-1">
                {item.permissions.description}
              </Text>
              <Text className="text-lg font-bold text-white">{item.name}</Text>
              <Text className="text-xs text-white mb-1">
                {new Date(item.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View className="flex-row space-x-3 mt-2 self-end gap-2">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UserDetailsScreen', {
                    userDetails: item,
                  })
                }
                className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center">
                <Icon name="visibility" size={18} color="#292C33" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setUserId(item._id);
                  setShowPermissionDialog(true);
                }}
                className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center">
                <Icon name="delete" size={18} color="#292C33" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
      {/* Add New Firm Button */}
      <TouchableOpacity
        className="bg-black rounded-xl py-4 items-center mb-6"
        onPress={() => navigation.navigate('AddNewUser')}>
        <Text className="text-white font-semibold text-base">Add New User</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UsersScreen;
