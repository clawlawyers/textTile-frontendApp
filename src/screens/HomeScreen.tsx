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
  ToastAndroid,
  Image,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import PermissionDeniedDialog from '../components/PermissionDeniedDialog'; // adjust path
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setActiveFirm, setInventoryName} from '../redux/commonSlice';
import {logout} from '../redux/authSlice';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import {NODE_API_ENDPOINT} from '../utils/util';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HomeProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const checkStoragePermission = async () => {
  if (Platform.OS === 'ios') {
    return true;
  }

  try {
    // First check if we already have the permission
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    if (hasPermission) {
      return true;
    }

    // If we don't have permission, request it
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission Required',
        message: 'App needs access to your storage to download files',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      // Only show alert if permission was actually denied by user
      Alert.alert(
        'Permission Denied',
        'Storage permission is required for downloading files',
      );
      return false;
    }
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
};

const HomeScreen = ({navigation}: HomeProps) => {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Orders fade
  const opacityAnim = useRef(new Animated.Value(0)).current; // Firm list fade
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.status);
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  console.log(activeFirm);

  console.log(currentUser);

  const toggleAccordion = () => {
    setExpanded(prev => !prev);
  };

  const showToastOfAlert = () => {
    // Alert.alert(
    //   'Inventory Already Set Up',
    //   'Please go to Inventory Management to view and edit inventory.',
    // );
    ToastAndroid.show(
      'Only One Inventory can be added per firm',
      ToastAndroid.LONG,
    );
  };

  useEffect(() => {
    // Request storage permission when component mounts
    const requestPermission = async () => {
      if (Platform.OS === 'ios') {
        return true;
      }

      try {
        // First check if we already have the permission
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (hasPermission) {
          return true;
        }

        // If we don't have permission, request it
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to your storage to download files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          // Only show alert if permission was actually denied by user
          Alert.alert(
            'Permission Denied',
            'Storage permission is required for downloading files',
          );
          return false;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    };

    requestPermission();

    // dispatch(logout());
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

  if (!currentUser && loading !== 'loading') {
    navigation.replace('Login');
  }

  const handleEditInventory = async () => {
    if (
      !currentUser?.permissions?.editInventory &&
      currentUser?.type !== 'manager'
    ) {
      setShowPermissionDialog(true);
      return;
    }
    if (!activeFirm?.inventory) {
      ToastAndroid.show('Need to setup Inventory', ToastAndroid.SHORT);
      navigation.navigate('SetUpInventoryScreen');
      return;
    }

    const getInventoryName = await fetch(
      `${NODE_API_ENDPOINT}/inventory/getInventoryName/${activeFirm?.inventory}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      },
    );

    if (!getInventoryName.ok) {
      const errorText = await getInventoryName.text();
      throw new Error(
        `Failed to fetch inventory name: ${getInventoryName.status} ${errorText}`,
      );
    }

    const inventoryName = await getInventoryName.json();
    dispatch(setInventoryName(inventoryName));
    navigation.navigate('AddInventoryScreen');
  };

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <ScrollView className="flex-1 bg-[#FAD9B3] px-4 pt-6">
        {/* Header */}
        <View className="flex flex-row justify-between px-2">
          <View>
            <View className="flex-row items-center mb-4">
              <View className="border rounded-full p-1">
                <Icon name="person-outline" size={25} />
              </View>
              <View className="mt-4 px-4">
                <Text className="text-black">
                  {currentUser?.type === 'manager' ? 'Admin' : 'User'}
                </Text>
                <Text className="text-base font-bold mb-4">
                  {currentUser?.name}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            className="bg-[#FAD9B3] border border-[#DB9245] rounded-full px-3 flex-row items-center justify-center my-6"
            onPress={() => {
              navigation.navigate('TextileImageGenerator');
            }}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={20}
              color="#DB9245"
            />
            <Text className="text-[#DB9245] font-medium ml-2">AI Labs</Text>
          </TouchableOpacity>
        </View>

        {/* Accordion */}
        <View className="bg-[#DB9245] rounded-xl p-4 mb-4 relative z-10">
          <Text className="text-white text-base mb-1">Currently Viewing</Text>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-3xl font-semibold text-white">
              {currentUser?.companies?.length === 0
                ? 'No Firms Added'
                : activeFirm?.name}
            </Text>
            {currentUser?.companies?.length !== 0 &&
              currentUser?.companies?.length !== 1 && (
                <TouchableOpacity
                  onPress={toggleAccordion}
                  className="border-[#ffff] border-2 rounded-full w-7 h-7 items-center justify-center">
                  <Icon
                    name={expanded ? 'expand-less' : 'expand-more'}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              )}
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
                  {currentUser?.companies?.map((firm, idx) => (
                    <TouchableOpacity
                      onPress={() => {
                        console.log(firm);
                        dispatch(setActiveFirm(firm));
                        setExpanded(false);
                      }}>
                      <Text
                        key={idx}
                        className="border-t-[1px] border-[#ffff] px-4 py-3 text-white font-semibold text-xl">
                        {firm.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Add New Firm Button */}
              <TouchableOpacity
                className="mt-4 bg-[#FAD9B3] py-2 rounded-lg items-center flex-row justify-center gap-4 z-0"
                onPress={() => {
                  if (currentUser?.type !== 'manager') {
                    setShowPermissionDialog(true);
                    return;
                  }
                  navigation.navigate('AddNewFirmScreen');
                }}>
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
              onPress={() => {
                if (currentUser?.type !== 'manager') {
                  setShowPermissionDialog(true);
                  return;
                }
                navigation.navigate('AddNewFirmScreen');
              }}>
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
            <View className="flex-row justify-between items-center gap-3 pr-3">
              <TouchableOpacity
                className="items-center p-4 bg-[#FAD9B3] rounded-lg w-[50%]"
                onPress={() => {
                  if (
                    !currentUser?.permissions?.createOrder &&
                    currentUser?.type !== 'manager'
                  ) {
                    setShowPermissionDialog(true);
                    return;
                  }
                  navigation.navigate('SetUpClientScreen');
                }}>
                <Icon name="add-shopping-cart" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Create Order
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center p-4 bg-[#FAD9B3] rounded-lg w-[50%] "
                onPress={() => navigation.navigate('ActiveOrdersScreen')}>
                <Icon name="shopping-cart" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Active Order
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                className="items-center p-4 bg-[#FAD9B3] rounded-lg"
                onPress={() => navigation.navigate('ActiveOrdersScreen')}>
                <Icon name="list" size={30} color="#292C33" />
                <Text className="text-[#292C33] mt-1 text-xs">
                  Active Orders
                </Text>
              </TouchableOpacity> */}
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
            // onPress={() => setShowPermissionDialog(true)}
            onPress={() => {
              if (
                !currentUser?.permissions?.viewInventory &&
                currentUser?.type !== 'manager'
              ) {
                setShowPermissionDialog(true);
                return;
              }
              if (activeFirm?.inventory) {
                navigation.navigate('InventoryProductList', {
                  companyId: activeFirm?._id || '',
                });
              } else {
                ToastAndroid.show(
                  'Need to setup Inventory',
                  ToastAndroid.SHORT,
                );
                navigation.navigate('SetUpInventoryScreen');
              }
            }}>
            <MaterialCommunityIcons
              name="text-search"
              size={25}
              color="#292C33"
            />
            <Text className="text-[#292C33] mt-1 text-xs">View Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-6 px-4 bg-[#FAD9B3] rounded-lg"
            onPress={handleEditInventory}>
            <Feather name="edit" size={24} color="#292C33" />
            <Text className="text-[#292C33] mt-1 text-xs">Edit Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center py-6 px-5 bg-[#FAD9B3] rounded-lg"
            onPress={() => navigation.navigate('AlertSendScreen')}>
            <Feather name="alert-triangle" size={24} color="#292C33" />
            <Text className="text-[#292C33] mt-1 text-xs">Alert Invoice</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-[#292C33] py-3 rounded-lg items-center flex-row justify-center gap-4"
          onPress={() => {
            if (
              !currentUser?.permissions?.addInvetory &&
              currentUser?.type !== 'manager'
            ) {
              setShowPermissionDialog(true);
              return;
            }
            activeFirm?.inventory
              ? showToastOfAlert()
              : navigation.navigate('SetUpInventoryScreen');
          }}>
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

// /* eslint-disable react-native/no-inline-styles */
// import React, {useState, useRef, useEffect, useCallback} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Animated,
//   Platform,
//   UIManager,
//   ScrollView,
//   ToastAndroid,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import {NativeStackScreenProps} from '@react-navigation/native-stack';
// import {HomeStackParamList} from '../stacks/Home';
// import PermissionDeniedDialog from '../components/PermissionDeniedDialog'; // adjust path
// import {useDispatch, useSelector} from 'react-redux';
// import {RootState} from '../redux/store';
// import {setActiveFirm} from '../redux/commonSlice';
// import {logout} from '../redux/authSlice';

// if (Platform.OS === 'android') {
//   UIManager.setLayoutAnimationEnabledExperimental &&
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// type HomeProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

// const HomeScreen = ({navigation}: HomeProps) => {
//   const [expanded, setExpanded] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(1)).current; // Orders fade
//   const opacityAnim = useRef(new Animated.Value(0)).current; // Firm list fade
//   const [showPermissionDialog, setShowPermissionDialog] = useState(false);
//   const dispatch = useDispatch();
//   const {width, height} = Dimensions.get('window');

//   const currentUser = useSelector((state: RootState) => state.auth.user);
//   const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

//   console.log(activeFirm);

//   console.log(currentUser);

//   const toggleAccordion = () => {
//     setExpanded(prev => !prev);
//   };

//   const showToastOfAlert = () => {
//     // Alert.alert(
//     //   'Inventory Already Set Up',
//     //   'Please go to Inventory Management to view and edit inventory.',
//     // );
//     ToastAndroid.show(
//       'Only One Inventory can be added per firm',
//       ToastAndroid.LONG,
//     );
//   };

//   useEffect(() => {
//     // dispatch(logout());
//     Animated.timing(fadeAnim, {
//       toValue: expanded ? 0 : 1,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();

//     Animated.timing(opacityAnim, {
//       toValue: expanded ? 1 : 0,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();
//   }, [expanded, fadeAnim, opacityAnim]);

//   return (
//     // <View style={{flex: 1, position: 'relative'}}>
//     <View style={{flex: 1, position: 'relative'}}>
//       <ScrollView className="flex-1 bg-[#FAD9B3] px-4 pt-6">
//         {/* Header */}
//         <View className="flex flex-row justify-between px-2">
//           <View>
//             <View className="flex-row items-center mb-4">
//               <View className="border rounded-full p-1">
//                 <Icon name="person-outline" size={25} />
//               </View>
//               <View className="mt-4 px-4">
//                 <Text className="text-black">
//                   {currentUser?.type === 'manager' ? 'Admin' : 'User'}
//                 </Text>
//                 <Text className="text-base font-bold mb-4">
//                   {currentUser?.name}
//                 </Text>
//               </View>
//             </View>
//           </View>
//           {/* <TouchableOpacity
//             className="mt-4"
//             onPress={() => {
//               navigation.navigate('Notification');
//             }}>
//             <View className="relative">
//               <FontistoIcon name="bell" size={25} color={'#DB9245'} />
//               <View className="absolute top-0 left-6 right-0 w-2 h-2 rounded-full bg-green-500" />
//             </View>{' '}
//           </TouchableOpacity> */}
//         </View>

//         {/* Accordion */}
//         <View className="bg-[#DB9245] rounded-xl p-4 mb-6 relative z-10">
//           <Text className="text-white text-lg mb-1">Currently Viewing</Text>

//           <View className="flex-row justify-between items-center mb-2 h-[60]">
//             <Text className="text-4xl font-semibold text-white mt-3">
//               {currentUser?.companies?.length === 0
//                 ? 'No Firms Added'
//                 : activeFirm?.name}
//             </Text>
//             {currentUser?.companies?.length !== 0 &&
//               currentUser?.companies?.length !== 1 && (
//                 <TouchableOpacity
//                   onPress={toggleAccordion}
//                   className="border-[#ffff] border-2 rounded-full w-8 h-8 items-center justify-center">
//                   <Icon
//                     name={expanded ? 'expand-less' : 'expand-more'}
//                     size={22}
//                     color="white"
//                   />
//                 </TouchableOpacity>
//               )}
//           </View>

//           {expanded && (
//             <Animated.View
//               style={{
//                 backgroundColor: '#DB9245',
//                 borderBottomLeftRadius: 12,
//                 borderBottomRightRadius: 12,
//                 zIndex: 20,
//                 opacity: opacityAnim,
//               }}
//               className="mt-2 ">
//               {/* Firm list with scrollable height */}
//               <View style={{maxHeight: 210}}>
//                 <ScrollView
//                   horizontal={false}
//                   showsVerticalScrollIndicator={false}>
//                   {currentUser?.companies?.map((firm, idx) => (
//                     <TouchableOpacity
//                       onPress={() => {
//                         console.log(firm);
//                         dispatch(setActiveFirm(firm));
//                         setExpanded(false);
//                       }}>
//                       <Text
//                         key={idx}
//                         className="border-t-[1px] border-[#ffff] px-4 py-3 text-white font-semibold text-2xl">
//                         {firm.name}
//                       </Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>

//               {/* Add New Firm Button */}
//               <TouchableOpacity
//                 className="mt-4 bg-[#FAD9B3] py-4 rounded-lg items-center flex-row justify-center gap-4 z-0"
//                 onPress={() => {
//                   if (
//                     !currentUser?.permissions?.addFirm &&
//                     currentUser?.type !== 'manager'
//                   ) {
//                     return;
//                   }
//                   navigation.navigate('AddNewFirmScreen');
//                 }}>
//                 <View className="border border-[#292C33] rounded-full w-7 h-7 flex justify-center items-center ">
//                   <Text className="text-base text-[#292C33]">+</Text>
//                 </View>
//                 <Text className="text-xl font-light text-[#292C33]">
//                   Add New Firm
//                 </Text>
//               </TouchableOpacity>
//             </Animated.View>
//           )}

//           {!expanded && (
//             <TouchableOpacity
//               className="mt-4 bg-[#FAD9B3] py-4 rounded-lg items-center flex-row justify-center gap-4 z-0"
//               onPress={() => {
//                 if (
//                   !currentUser?.permissions?.addFirm &&
//                   currentUser?.type !== 'manager'
//                 ) {
//                   setShowPermissionDialog(true);
//                   return;
//                 }
//                 navigation.navigate('AddNewFirmScreen');
//               }}>
//               <View className="border border-[#292C33] rounded-full w-7 h-7 flex justify-center items-center ">
//                 <Text className="text-base text-[#292C33]">+</Text>
//               </View>
//               <Text className="text-xl font-light text-[#292C33]">
//                 Add New Firm
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Orders Section */}
//         <Animated.View
//           style={{
//             opacity: fadeAnim,
//             height: '40%', // Fixed height in pixels
//             marginBottom: 20,
//           }}>
//           <View
//             className="bg-[#DB9245] rounded-xl p-4"
//             style={{height: '100%'}}>
//             <Text className="text-white font-bold text-2xl mb-5">Orders</Text>
//             <View className="flex-row justify-between items-center gap-3">
//               <TouchableOpacity
//                 className="items-center p-7  bg-[#FAD9B3] rounded-lg w-[50%]"
//                 onPress={() => {
//                   if (
//                     !currentUser?.permissions?.createOrder &&
//                     currentUser?.type !== 'manager'
//                   ) {
//                     setShowPermissionDialog(true);
//                     return;
//                   }
//                   navigation.navigate('SetUpClientScreen');
//                 }}>
//                 <Icon name="add-shopping-cart" size={40} color="#292C33" />
//                 <Text className="text-[#292C33] mt-1 text-xs">
//                   Create Order
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="items-center p-7 bg-[#FAD9B3] rounded-lg w-[48%]"
//                 onPress={() => navigation.navigate('ActiveOrdersScreen')}>
//                 <Icon name="shopping-cart" size={40} color="#292C33" />
//                 <Text className="text-[#292C33] mt-1 text-xs">
//                   Complete Order
//                 </Text>
//               </TouchableOpacity>
//               {/* <TouchableOpacity
//                 className="items-center p-4 bg-[#FAD9B3] rounded-lg"
//                 onPress={() => navigation.navigate('ActiveOrdersScreen')}>
//                 <Icon name="list" size={30} color="#292C33" />
//                 <Text className="text-[#292C33] mt-1 text-xs">
//                   Active Orders
//                 </Text>
//               </TouchableOpacity> */}
//             </View>
//           </View>
//         </Animated.View>
//       </ScrollView>

//       <PermissionDeniedDialog
//         visible={showPermissionDialog}
//         onClose={() => setShowPermissionDialog(false)}
//       />

//       {/* Fixed Inventory Management - stays at the bottom */}
//       <View
//         style={{
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           paddingBottom: 20,
//           height: 280,
//         }}
//         className="bg-[#DB9245] rounded-xl px-4 py-6 m-4 mb-8">
//         <Text className="text-white font-bold text-2xl mb-4">
//           Inventory Management
//         </Text>
//         <View className="flex-row justify-between mb-4 ">
//           <TouchableOpacity
//             className="items-center py-9 px-7 bg-[#FAD9B3] rounded-lg"
//             // onPress={() => setShowPermissionDialog(true)}
//             onPress={() => {
//               if (
//                 !currentUser?.permissions?.viewInventory &&
//                 currentUser?.type !== 'manager'
//               ) {
//                 setShowPermissionDialog(true);
//                 return;
//               }
//               if (activeFirm?.inventory) {
//                 navigation.navigate('InventoryProductList', {
//                   companyId: activeFirm?._id || '',
//                 });
//               } else {
//                 ToastAndroid.show(
//                   'Need to setup Inventory',
//                   ToastAndroid.SHORT,
//                 );
//                 navigation.navigate('SetUpInventoryScreen');
//               }
//             }}>
//             <MaterialCommunityIcons
//               name="text-search"
//               size={40}
//               color="#292C33"
//             />
//             <Text className="text-[#292C33] mt-1 text-xs">View Inventory</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="items-center py-9 px-7 bg-[#FAD9B3] rounded-lg"
//             onPress={() => {
//               if (
//                 !currentUser?.permissions?.editInventory &&
//                 currentUser?.type !== 'manager'
//               ) {
//                 setShowPermissionDialog(true);
//                 return;
//               }
//               navigation.navigate('AddInventoryScreen');
//             }}>
//             <Feather name="edit" size={40} color="#292C33" />
//             <Text className="text-[#292C33] mt-1 text-xs">Edit Inventory</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="items-center py-9 px-7 bg-[#FAD9B3] rounded-lg"
//             onPress={() => navigation.navigate('AlertSendScreen')}>
//             <Feather name="alert-triangle" size={40} color="#292C33" />
//             <Text className="text-[#292C33] mt-1 text-xs">Alert Invoice</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           className="bg-[#292C33] py-4 rounded-lg items-center flex-row justify-center gap-4 mt-auto"
//           onPress={() => {
//             if (
//               !currentUser?.permissions?.addInvetory &&
//               currentUser?.type !== 'manager'
//             ) {
//               setShowPermissionDialog(true);
//               return;
//             }
//             activeFirm?.inventory
//               ? showToastOfAlert()
//               : navigation.navigate('SetUpInventoryScreen');
//           }}>
//           <SimpleLineIcons name="cloud-upload" size={28} color="#FBDBB5" />
//           <Text className="text-[#FBDBB5] text-xl">Upload New Inventory</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default HomeScreen;
