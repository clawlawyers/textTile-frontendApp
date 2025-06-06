

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  UIManager,
  ScrollView,
  ToastAndroid,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../stacks/Home';
import PermissionDeniedDialog from '../components/PermissionDeniedDialog'; // adjust path
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setActiveFirm, setInventoryName } from '../redux/commonSlice';
import { logout } from '../redux/authSlice';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { scale, verticalScale, moderateScale, fontSize } from '../utils/scaling';
import { NODE_API_ENDPOINT } from '../utils/util';
import { KeyboardAvoidingView } from 'react-native';

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
    //checking permission
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );

    if (hasPermission) {
      return true;
    }
  
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

const TestHomeScreen = ({ navigation }: HomeProps) => {
  const [expanded, setExpanded] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const dispatch = useDispatch();
  const screenHeight = Dimensions.get('window').height;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [inventoryHeight, setInventoryHeight] = useState(0);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const loading = useSelector((state: RootState) => state.auth.status);
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  const toggleAccordion = () => {
    setExpanded((prev) => !prev);
  };

  const showToastOfAlert = () => {
    ToastAndroid.show(
      'Only One Inventory can be added per firm',
      ToastAndroid.LONG,
    );
  };

  useEffect(() => {
    const requestPermission = async () => {
      await checkStoragePermission();
    };

    requestPermission();

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

  const handleAddNewFirm = () => {
    // Check firm limit
    const firmCount = currentUser?.companies?.length || 0;
    if (firmCount >= 3) {
      Alert.alert(
        'Firm Limit Exceeded',
        'More than three firms cannot be created.',
        [{ text: 'OK' }],
      );
      return;
    }

    // Check permissions
    if (!currentUser?.permissions?.addFirm && currentUser?.type !== 'manager') {
      setShowPermissionDialog(true);
      return;
    }

    // Navigate to AddNewFirmScreen if checks pass
    navigation.navigate('AddNewFirmScreen');
  };
 
  // Calculate ScrollView height when expanded
  const scrollViewHeight = expanded
    ? screenHeight -
    (2*headerHeight +
     inventoryHeight +
     verticalScale(18) + // Gap between Header and Accordion
     verticalScale(18) + // Gap between Accordion and Inventory
     2*tabBarHeight +
     4*verticalScale(20)) : 
     verticalScale(180)// Gap to bottom tab bar

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAD9B3' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#FAD9B3',
            paddingHorizontal: scale(16),
            paddingTop: verticalScale(22),
            paddingBottom: verticalScale(20),
            gap: verticalScale(18),
          }}
        >
          {/* Header Section */}
          <View
            style={{
              backgroundColor: '#FAD9B3',
              paddingVertical: verticalScale(12),
            }}
            onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: moderateScale(50),
                    padding: moderateScale(6),
                    borderColor: '#292C33',
                  }}
                >
                  <Icon name="person-outline" size={moderateScale(24)} color="#292C33" />
                </View>
                <View style={{ marginLeft: scale(12) }}>
                  <Text style={{ fontSize: fontSize.sm, color: '#292C33' }}>
                    {currentUser?.type === 'manager' ? 'Admin' : 'User'}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: '600',
                      color: '#292C33',
                    }}
                  >
                    {currentUser?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FAD9B3',
                  borderWidth: 1,
                  borderColor: '#DB9245',
                  borderRadius: moderateScale(50),
                  paddingHorizontal: scale(12),
                  paddingVertical: verticalScale(8),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.navigate('TextileImageGenerator')}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={moderateScale(20)}
                  color="#DB9245"
                />
                <Text
                  style={{
                    color: '#DB9245',
                    fontSize: fontSize.xs,
                    fontWeight: '500',
                    marginLeft: scale(8),
                  }}
                >
                  AI Labs
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accordion Section */}
          <View
            style={{
              backgroundColor: '#DB9245',
              borderRadius: moderateScale(12),
              padding: moderateScale(16),
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: fontSize.base,
                marginBottom: verticalScale(8),
              }}
            >
              Currently Viewing
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: verticalScale(8),
              }}
            >
              <Text
                style={{
                  fontSize: fontSize['2xl'],
                  fontWeight: '600',
                  color: '#fff',
                }}
              >
                {currentUser?.companies?.length === 0 ? 'No Firms Added' : activeFirm?.name}
              </Text>
              {currentUser?.companies?.length !== 0 && currentUser?.companies?.length !== 1 && (
                <TouchableOpacity
                  onPress={toggleAccordion}
                  style={{
                    borderWidth: 2,
                    borderColor: '#fff',
                    borderRadius: moderateScale(50),
                    width: moderateScale(28),
                    height: moderateScale(28),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={expanded ? 'expand-less' : 'expand-more'}
                    size={moderateScale(20)}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}
            </View>

            {expanded && (
              <Animated.View
                style={{
                  backgroundColor: '#DB9245',
                  borderBottomLeftRadius: moderateScale(12),
                  borderBottomRightRadius: moderateScale(12),
                  opacity: opacityAnim,
                  marginTop: verticalScale(8),
                }}
              >
                <View style={{ height: scrollViewHeight }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {currentUser?.companies?.map((firm: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => {
                          dispatch(setActiveFirm(firm));
                          setExpanded(false);
                        }}
                      >
                        <Text
                          style={{
                            borderTopWidth: 1,
                            borderColor: '#fff',
                            paddingHorizontal: scale(16),
                            paddingVertical: verticalScale(12),
                            color: '#fff',
                            fontSize: fontSize.lg,
                            fontWeight: '600',
                          }}
                        >
                          {firm.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <TouchableOpacity
                  style={{
                    marginTop: verticalScale(12),
                    backgroundColor: '#FAD9B3',
                    paddingVertical: verticalScale(8),
                    borderRadius: moderateScale(8),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: scale(12),
                  }}
                  // onPress={() => {
                  //   if (!currentUser?.permissions?.addFirm && currentUser?.type !== 'manager') {
                  //     setShowPermissionDialog(true);
                  //     return;
                  //   }
                  //   navigation.navigate('AddNewFirmScreen');
                  // }}
                  onPress={handleAddNewFirm}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#292C33',
                      borderRadius: moderateScale(50),
                      width: moderateScale(24),
                      height: moderateScale(24),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: fontSize.xs, color: '#292C33' }}>+</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: '400',
                      color: '#292C33',
                    }}
                  >
                    Add New Firm
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {!expanded && (
              <TouchableOpacity
                style={{
                  marginTop: verticalScale(12),
                  backgroundColor: '#FAD9B3',
                  paddingVertical: verticalScale(8),
                  borderRadius: moderateScale(8),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: scale(12),
                }}
                onPress={handleAddNewFirm}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#292C33',
                    borderRadius: moderateScale(50),
                    width: moderateScale(24),
                    height: moderateScale(24),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: fontSize.xs, color: '#292C33' }}>+</Text>
                </View>
                <Text
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: '400',
                    color: '#292C33',
                  }}
                >
                  Add New Firm
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Orders Section */}
          {!expanded && (
            <View
              style={{
                backgroundColor: '#DB9245',
                borderRadius: moderateScale(12),
                padding: moderateScale(16),
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xl,
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: verticalScale(12),
                }}
              >
                Orders
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: scale(12),
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: moderateScale(16),
                    backgroundColor: '#FAD9B3',
                    borderRadius: moderateScale(8),
                  }}
                  onPress={() => {
                    if (!currentUser?.permissions?.createOrder && currentUser?.type !== 'manager') {
                      setShowPermissionDialog(true);
                      return;
                    }
                    navigation.navigate('SetUpClientScreen');
                  }}
                >
                  <Icon name="add-shopping-cart" size={moderateScale(30)} color="#292C33" />
                  <Text
                    style={{
                      color: '#292C33',
                      marginTop: verticalScale(8),
                      fontSize: fontSize.sm,
                    }}
                  >
                    Create Order
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: moderateScale(16),
                    backgroundColor: '#FAD9B3',
                    borderRadius: moderateScale(8),
                  }}
                  onPress={() => navigation.navigate('ActiveOrdersScreen')}
                >
                  <Icon name="shopping-cart" size={moderateScale(30)} color="#292C33" />
                  <Text
                    style={{
                      color: '#292C33',
                      marginTop: verticalScale(8),
                      fontSize: fontSize.sm,
                    }}
                  >
                    Active Order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Inventory Management Section */}
          <View
            style={{
              backgroundColor: '#DB9245',
              borderRadius: moderateScale(12),
              padding: moderateScale(16),
            }}
            onLayout={(event) => setInventoryHeight(event.nativeEvent.layout.height)}
          >
            <Text
              style={{
                fontSize: fontSize.xl,
                fontWeight: '600',
                color: '#fff',
                marginBottom: verticalScale(12),
              }}
            >
              Inventory Management
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: scale(12),
                marginBottom: verticalScale(12),
                flexWrap: 'nowrap',
                alignItems: 'stretch',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'center',
                  padding: moderateScale(12),
                  backgroundColor: '#FAD9B3',
                  borderRadius: moderateScale(8),
                }}
                onPress={() => {
                  if (!currentUser?.permissions?.viewInventory && currentUser?.type !== 'manager') {
                    setShowPermissionDialog(true);
                    return;
                  }
                  if (activeFirm?.inventory) {
                    navigation.navigate('InventoryProductList', {
                      companyId: activeFirm?._id || '',
                    });
                  } else {
                    ToastAndroid.show('Need to setup Inventory', ToastAndroid.SHORT);
                    navigation.navigate('SetUpInventoryScreen');
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="text-search"
                  size={moderateScale(40)}
                  color="#292C33"
                />
                <Text
                  style={{
                    color: '#292C33',
                    marginTop: verticalScale(8),
                    fontSize: moderateScale(11),
                    textAlign: 'center',
                  }}
                >
                  View Inventory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'center',
                  padding: moderateScale(12),
                  backgroundColor: '#FAD9B3',
                  borderRadius: moderateScale(8),
                }}
                onPress={handleEditInventory}
              >
                <Feather name="edit" size={moderateScale(40)} color="#292C33" />
                <Text
                  style={{
                    color: '#292C33',
                    marginTop: verticalScale(8),
                    fontSize: moderateScale(11),
                    textAlign: 'center',
                  }}
                >
                  Edit Inventory
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  minWidth: 0,
                  alignItems: 'center',
                  padding: moderateScale(12),
                  backgroundColor: '#FAD9B3',
                  borderRadius: moderateScale(8),
                }}
                onPress={() => navigation.navigate('AlertSendScreen')}
              >
                <Feather name="alert-triangle" size={moderateScale(40)} color="#292C33" />
                <Text
                  style={{
                    color: '#292C33',
                    marginTop: verticalScale(8),
                    fontSize: moderateScale(11),
                    textAlign: 'center',
                  }}
                >
                  Alert Invoice
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: '#292C33',
                paddingVertical: verticalScale(10),
                borderRadius: moderateScale(8),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scale(12),
              }}
              onPress={() => {
                if (!currentUser?.permissions?.addInventory && currentUser?.type !== 'manager') {
                  setShowPermissionDialog(true);
                  return;
                }
                activeFirm?.inventory
                  ? showToastOfAlert()
                  : navigation.navigate('SetUpInventoryScreen');
              }}
            >
              <SimpleLineIcons name="cloud-upload" size={moderateScale(20)} color="#FBDBB5" />
              <Text
                style={{
                  color: '#FBDBB5',
                  fontSize: fontSize.base,
                  fontWeight: '600',
                }}
              >
                Upload New Inventory
              </Text>
            </TouchableOpacity>
          </View>

          <PermissionDeniedDialog
            visible={showPermissionDialog}
            onClose={() => setShowPermissionDialog(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TestHomeScreen;
