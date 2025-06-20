import React, {useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import DeleteConfirmation from '../components/DeleteConfirmation';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setCurrentClient} from '../redux/commonSlice';
import PermissionDeniedDialog from '../components/PermissionDeniedDialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

const clients = [
  {id: '1', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '3', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ClientListScreen'
>;
const ClientListScreen = ({navigation}: AddNewUserProps) => {
  const [showPermissionDialog, setShowPermissionDialog] =
    useState<boolean>(false);
  const [showPermissionDeleteDialog, setShowPermissionDeleteDialog] =
    useState<boolean>(false);
  const [clients, setClients] = useState([]);
  const [selectedClientToDelete, setSelectedClientToDelete] = useState(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();

  const [getLoading, setGetLoading] = useState(true);

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete client: ${response.status} ${errorText}`,
        );
      }

      const data = await response.json();
      console.log(data);

      // Refresh client list after deletion
      setClients(prev => prev.filter(client => client._id !== clientId));
    } catch (error) {
      console.error('Delete client failed:', error);
    } finally {
      setShowPermissionDeleteDialog(false);
      setSelectedClientToDelete(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const getClients = async () => {
        setGetLoading(true);
        const endPoints =
          currentUser?.type === 'manager'
            ? `${NODE_API_ENDPOINT}/clients`
            : `${NODE_API_ENDPOINT}/clients/SalesmanClients/${currentUser?.userId}`;
        try {
          const response = await fetch(endPoints, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
          });

          if (!response.ok) {
            setGetLoading(false);
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch clients: ${response.status} ${errorText}`,
            );
          }

          setGetLoading(false);

          const data = await response.json();
          console.log(data);
          setClients(data);
        } catch (error) {
          console.error('Error fetching clients:', error);
        } finally {
          setGetLoading(false);
        }
      };

      getClients();

      // Optional cleanup can go here
      return () => {};
    }, [currentUser?.token, currentUser?.type, currentUser?.userId]),
  );

  if (getLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAD9B3]">
        <LottieView
          source={require('../assets/lottieanimation1.json')} // Your downloaded .json file
          autoPlay
          loop
          style={{ width: 180, height: 130 }}
         />
        <Text className="fobt-semibold text-black">Loading Client List...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#FAD9B3] px-4 ">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
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
      <Text className="text-lg font-bold text-black mb-4">Your Clients</Text>

      {clients.length === 0 && !getLoading && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-bold text-black mb-4">
            No Clients Found
          </Text>
        </View>
      )}

      {/* Client Cards */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {clients.length > 0 &&
          !getLoading &&
          clients.map(client => (
            <View key={client._id} className=" mb-4  overflow-hidden">
              <LinearGradient
                colors={['#D6872A', '#F1B97A']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View>
                    <Text className="text-white text-xs mb-1">
                      {client.name}
                    </Text>
                    <Text className="text-white font-bold text-base mb-4">
                      {client.firmName}
                    </Text>
                  </View>

                  {/* Action Row */}
                  <View className="flex-row justify-between items-center ">
                    <View className="flex-row space-x-3 gap-2">
                      <TouchableOpacity
                        className="w-6 h-6 rounded-full border border-[#292C33] justify-center items-center"
                        onPress={() => {
                          dispatch(setCurrentClient(client));
                          navigation.navigate('ClientDetailsScreen', {
                            clientId: client._id,
                          });
                        }}>
                        <Ionicons
                          name="eye-outline"
                          size={16}
                          color="#292C33"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="w-6 h-6 rounded-full border border-[#292C33] justify-center items-center"
                        onPress={() => {
                          if (
                            !currentUser?.permissions?.deleteClient &&
                            currentUser?.type !== 'manager'
                          ) {
                            setShowPermissionDialog(true);
                            return;
                          }
                          setSelectedClientToDelete(client);
                          setShowPermissionDeleteDialog(true);
                        }}>
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#292C33"
                        />
                        <DeleteConfirmation
                          visible={showPermissionDeleteDialog}
                          onClose={() => {
                            setSelectedClientToDelete(null);
                            setShowPermissionDeleteDialog(false);
                          }}
                          type="Client"
                          onDelete={() =>
                            selectedClientToDelete &&
                            handleDeleteClient(selectedClientToDelete._id)
                          }
                        />

                        <PermissionDeniedDialog
                          visible={showPermissionDialog}
                          onClose={() => setShowPermissionDialog(false)}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-[#1F1F1F] px-4 py-2 rounded-lg mx-3"
                  onPress={() => {
                    if (
                      !currentUser?.permissions?.createOrder &&
                      currentUser?.type !== 'manager'
                    ) {
                      setShowPermissionDialog(true);
                      return;
                    }
                    dispatch(setCurrentClient(client));
                    navigation.navigate('OrderProductSelectionScreen', {
                      clientName: client.name,
                    });
                  }}>
                  <Text className="text-white text-center font-medium text-sm">
                    Create Order
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))}
      </ScrollView>

      {/* <DeleteConfirmation
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        type="Client"
        onDelete={function (): void {
          throw new Error('Function not implemented.');
        }}
      /> */}

      {/* Add New Client */}
      <TouchableOpacity
        className="bg-[#1F1F1F] py-4 rounded-xl items-center my-2"
        onPress={() => {
          if (
            !currentUser?.permissions?.addClient &&
            currentUser?.type !== 'manager'
          ) {
            setShowPermissionDialog(true);
            return;
          }
          navigation.navigate('AddClientScreen');
        }}>
        <Text className="text-white font-semibold text-base">
          Add New Client
        </Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ClientListScreen;
