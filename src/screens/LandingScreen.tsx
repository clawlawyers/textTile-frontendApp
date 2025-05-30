import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {View, Image} from 'react-native';
import {HomeStackParamList} from '../stacks/Home';

type SplashProps = NativeStackScreenProps<HomeStackParamList, 'LandingScreen'>;

const LandingScreen = ({navigation}: SplashProps) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home');
      // navigation.replace('TextileImageGenerator');
    }, 500);
  }, [navigation]);
  return (
    <View
      className="flex-1 items-center justify-center"
      // eslint-disable-next-line react-native/no-inline-styles
      style={{backgroundColor: '#F5D3AC'}}>
      <Image
        source={require('../assets/logo.png')} // Update the path based on your project
        className="w-52 h-52"
        resizeMode="contain"
      />
    </View>
  );
};

export default LandingScreen;
