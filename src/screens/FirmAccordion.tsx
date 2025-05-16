/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import PermissionDeniedDialog from '../components/PermissionDeniedDialog'; // adjust path

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HomeProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const FIRM_LIST = [
  'Firm Name 1',
  'Firm Name 2',
  'Firm Name 3',
  'Firm Name 1',
  'Firm Name 2',
  'Firm Name 3',
  'Firm Name 1',
  'Firm Name 2',
  'Firm Name 3',
  'Firm Name 1',
  'Firm Name 2',
  'Firm Name 3',
];

const HomeScreen = ({navigation}: HomeProps) => {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Orders fade
  const opacityAnim = useRef(new Animated.Value(0)).current; // Firm list fade
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const toggleAccordion = () => {
    setExpanded(prev => !prev);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: expanded ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: expanded ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [expanded, fadeAnim, opacityAnim]);

  return (
    <View style={{flex: 1, position: 'relative'}}>
      {/* Scrollable content */}
      <ScrollView className="flex-1 bg-[#FAD9B3] px-4 pt-6 pb-16">
        {/* Header */}
        <View className="flex flex-row justify-between px-2">
          <View>
            <View className="flex-row items-center mb-4">
              <View className="border rounded-full p-1">
                <Icon name="person-outline" size={25} />
              </View>
              <View className="mt-4 px-4">
                <Text className="text-black">Admin</Text>
                <Text className="text-base font-bold mb-4">
                  Soumya Snigdha Banik
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="mt-4"
            onPress={() => {
              navigation.navigate('Notification');
            }}>
            <View className="relative">
              <FontistoIcon name="bell" size={25} color={'#DB9245'} />
              <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
            </View>{' '}
          </TouchableOpacity>
        </View>

        {/* Accordion */}
        <View className="bg-[#DB9245] rounded-xl p-4 mb-4 relative z-10">
          <Text className="text-white text-base mb-1">Currently Viewing</Text>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-semibold text-white">Firm Name</Text>
            <TouchableOpacity
              onPress={toggleAccordion}
              className="border-[#ffff] border-2 rounded-full w-7 h-7 items-center justify-center">
              <Icon
                name={expanded ? 'expand-less' : 'expand-more'}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {expanded && (
            <Animated.View
              style={{
                backgroundColor: '#DB9245',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
                zIndex: 20,
                opacity: opacityAnim,
              }}
              className="mt-2 ">
              {/* Firm list with scrollable height */}
              <View style={{maxHeight: 140}}>
                <ScrollView
                  horizontal={false}
                  showsVerticalScrollIndicator={false}>
                  {FIRM_LIST.map((firm, idx) => (
                    <Text
                      key={idx}
                      className="border-t-[1px] border-[#ffff] px-4 py-3 text-white font-semibold text-xl">
                      {firm}
                    </Text>
                  ))}
                </ScrollView>
              </View>

              {/* Add New Firm Button */}
              <TouchableOpacity
                className="mt-4 bg-[#FAD9B3] py-2 rounded-lg items-center flex-row justify-center gap-4 z-0"
                onPress={() => navigation.navigate('AddNewFirmScreen')}>
                <View className="border border-[#292C33] rounded-full w-6 h-6 flex justify-center items-center ">
                  <Text className="text-xs text-[#292C33]">+</Text>
                </View>
                <Text className="text-lg font-light text-[#292C33]">
                  Add New Firm
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {!expanded && (
            <TouchableOpacity
              className="mt-4 bg-[#FAD9B3] py-2 rounded-lg items-center flex-row justify-center gap-4 z-0"
              onPress={() => navigation.navigate('AddNewFirmScreen')}>
              <View className="border border-[#292C33] rounded-full w-6 h-6 flex justify-center items-center ">
                <Text className="text-xs text-[#292C33]">+</Text>
              </View>
              <Text className="text-lg font-light text-[#292C33]">
                Add New Firm
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Orders Section */}
        <Animated.View style={{opacity: fadeAnim}}>
          <View className="bg-[#DB9245] rounded-xl p-4 mb-4">
            <Text className="text-white font-bold text-xl mb-3">Orders</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity className="items-center p-4 bg-[#FAD9B3] rounded-lg">
                <Icon name="add-shopping-cart" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Create Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center p-4 bg-[#FAD9B3] rounded-lg">
                <Icon name="shopping-cart" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Update Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center p-4 bg-[#FAD9B3] rounded-lg">
                <Icon name="list" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Active Orders
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <PermissionDeniedDialog
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      />

      {/* Fixed Inventory Management - stays at the bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 20,
        }}
        className="bg-[#DB9245] rounded-xl px-4 py-6 m-4 mb-6">
        <Text className="text-white font-bold text-xl mb-3">
          Inventory Management
        </Text>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="items-center py-6 px-3 bg-[#FAD9B3] rounded-lg"
            onPress={() => setShowPermissionDialog(true)}>
            <MaterialCommunityIcons
              name="text-search"
              size={25}
              color="#292C33"
            />
            <Text className="text-[#292C33] mt-1 text-xs">View Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-6 px-4 bg-[#FAD9B3] rounded-lg">
            <Feather name="edit" size={24} color="#292C33" />
            <Text className="text-[#292C33] mt-1 text-xs">Edit Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-6 px-5 bg-[#FAD9B3] rounded-lg">
            <Feather name="alert-triangle" size={24} color="#292C33" />
            <Text className="text-[#292C33] mt-1 text-xs">Alert Set Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-[#292C33] py-3 rounded-lg items-center flex-row justify-center gap-4">
          <SimpleLineIcons name="cloud-upload" size={20} color="#FBDBB5" />
          <Text className="text-[#FBDBB5] font-semibold">
            Upload New Inventory
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
