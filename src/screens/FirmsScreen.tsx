import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {retrieveAuth} from '../redux/authSlice';

type AddNewUserProps = NativeStackScreenProps<
  AccountStackParamList,
  'FirmScreens'
>;

// const firms = new Array(5).fill({
//   company: 'CLAW Design Enterprise (Company Name)',
//   firm: 'SSB Textiles (Firm Name)',
// });

const FirmsScreen = ({navigation}: AddNewUserProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const [firmId, setFirmId] = useState('');

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const [firms, setFirms] = useState([]);
  const [getLoading, setGetLoading] = useState(true);

  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      const getAllFirms = async () => {
        setGetLoading(true);
        const response = await fetch(
          `${NODE_API_ENDPOINT}/managers/${currentUser?.userId}/companies`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          },
        );
        console.log(response);
        if (!response.ok) {
          setGetLoading(false);
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch firms: ${response.status} ${errorText}`,
          );
        }
        setGetLoading(false);
        const data = await response.json();
        console.log(data);
        setFirms(data);
      };
      if (currentUser?.type === 'manager') {
        console.log('Calling api');
        getAllFirms();
      }
    }, [currentUser?.token, currentUser?.type, currentUser?.userId]),
  );

  const handleDeleteFirm = async () => {
    // Prevent deletion of the currently active firm
    if (activeFirm?._id === firmId) {
      ToastAndroid.show(
        'You cannot delete the currently active firm.',
        ToastAndroid.SHORT,
      );
      return;
    }
    const response = await fetch(`${NODE_API_ENDPOINT}/companies/${firmId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete firm: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    console.log(data);
    setFirms(firms.filter(item => item._id !== firmId));

    dispatch(retrieveAuth());
    setShowPermissionDialog(false);
  };

  // if (getLoading) {
  //   return (
  //     <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 flex justify-center items-center">
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

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
        Your Firms
      </Text>

      {getLoading && (
        <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 flex justify-center items-center">
          <Text>Loading...</Text>
        </View>
      )}

      {!getLoading && firms.length === 0 && (
        <View className="flex-1 bg-[#FAD9B3] px-4 pt-14 flex justify-center items-center">
          <Text>No Firms</Text>
        </View>
      )}

      {/* Firms List */}
      <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
        {firms.map((item, index) => (
          <LinearGradient
            key={index}
            colors={['#DB9245', '#FAD9B3']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            className="p-3 rounded-xl mb-3 flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-white mb-1">
                {activeFirm?.name}
              </Text>
              <Text className="text-base font-bold text-white">
                {item.name}
              </Text>
            </View>
            <View className="flex-row space-x-3 mt-2 self-end gap-2">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('FirmDetailsScreens', {
                    firmDetails: item,
                  })
                }
                className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center">
                <Icon name="visibility" size={18} color="#292C33" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setFirmId(item._id);
                  setShowPermissionDialog(true);
                }}
                className="w-7 h-7 mb-4 rounded-full border border-[#292C33] justify-center items-center">
                <Icon name="delete" size={18} color="#292C33" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <DeleteConfirmation
        type={'Firm'}
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        onDelete={handleDeleteFirm}
      />

      {/* Add New Firm Button */}
      <TouchableOpacity
        className="bg-black rounded-xl py-4 items-center mb-6"
        onPress={() => {
          // Check firm limit
          const firmCount = currentUser?.companies?.length || 0;
          if (firmCount >= 3) {
            Alert.alert(
              'Firm Limit Exceeded',
              'More than three firms cannot be created.',
              [{text: 'OK'}],
            );
            return;
          }
          navigation.getParent()?.navigate('Home', {
            screen: 'AddNewFirmScreen', // or whatever that stack/screen name is
          });
        }}>
        <Text className="text-white font-semibold text-base">Add New Firm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FirmsScreen;
