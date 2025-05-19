import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Icon1 from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import DeleteConfirmation from '../components/DeleteConfirmation';

const clients = [
  {id: '1', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '3', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
  {id: '4', name: 'Ram Enterprice', owner: 'Rameswaram Das'},
];

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'ClientListScreen'
>;
const ClientListScreen = ({navigation}: AddNewUserProps) => {
  const [showPermissionDialog, setShowPermissionDialog] =
    useState<boolean>(false);

  return (
    <View className="flex-1 bg-[#FBD7A2] px-4 pt-14 pb-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Notification')}
          className="relative">
          <FontistoIcon name="bell" size={25} color={'#DB9245'} />
          <View className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-lg font-bold text-black mb-4">Your Clients</Text>

      {/* Client Cards */}
      <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
        {clients.map(client => (
          <View key={client.id} className=" mb-4  overflow-hidden">
            <LinearGradient
              colors={['#D6872A', '#F1B97A']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              className="p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-white text-xs mb-1">
                    {client.owner}
                  </Text>
                  <Text className="text-white font-bold text-base mb-4">
                    {client.name}
                  </Text>
                </View>

                {/* Action Row */}
                <View className="flex-row justify-between items-center ">
                  <View className="flex-row space-x-3 gap-2">
                    <TouchableOpacity
                      className="w-6 h-6 rounded-full border border-[#292C33] justify-center items-center"
                      onPress={() =>
                        navigation.navigate('ClientDetailsScreen')
                      }>
                      <Ionicons name="eye-outline" size={16} color="#292C33" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="w-6 h-6 rounded-full border border-[#292C33] justify-center items-center"
                      onPress={() => setShowPermissionDialog(true)}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#292C33"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="bg-[#1F1F1F] px-4 py-2 rounded-lg mx-3">
                <Text className="text-white text-center font-medium text-sm">
                  Create Order
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <DeleteConfirmation
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        type="Client"
        onDelete={function (): void {
          throw new Error('Function not implemented.');
        }}
      />

      {/* Add New Client */}
      <TouchableOpacity className="bg-[#1F1F1F] py-4 rounded-xl items-center ">
        <Text className="text-white font-semibold text-base">
          Add New Client
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClientListScreen;
