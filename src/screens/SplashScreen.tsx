import React, {useEffect, useRef} from 'react';
import {View, Image, Text, Animated, ActivityIndicator} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

type SplashProps = NativeStackScreenProps<HomeStackParamList, 'Splash'>;

const SplashScreen = ({navigation}: SplashProps) => {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: -35,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Navigate to Onboarding after animations finish
        // navigation.navigate('InventoryMappingScreen');
        navigation.replace('Onboarding');
      });
    }, 1000);
  }, []);

  return (
    <View className="flex-1 bg-[#F5D3AC] items-center justify-center pb-6 relative">
      {/* Animated Logo */}
      <Animated.View
        className="items-center"
        style={{transform: [{translateY: logoAnim}]}}>
        <Image
          source={require('../assets/logo.png')}
          className="w-60 h-60"
          resizeMode="contain"
        />
      </Animated.View>

      {/* Animated Title */}
      <Animated.Text
        className="text-base font-semibold text-black tracking-widest"
        style={{opacity: textOpacity}}>
        INVENTORY AUTOMATION
      </Animated.Text>

      {/* Animated Footer */}
      <Animated.View
        className="absolute bottom-6 items-center w-[90%]"
        style={{opacity: footerOpacity}}>
        <View className="w-full h-px bg-black mb-1" />
        <Text className="text-xs text-black">
          Powered By <Text className="font-bold italic">Claw Legal Tech</Text>
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
