import React from 'react';
import {View, Image} from 'react-native';

const SplashScreenOne = () => {
  return (
    <View
      className="flex-1 items-center justify-center"
      // eslint-disable-next-line react-native/no-inline-styles
      style={{backgroundColor: '#F5D3AC'}}>
      <Image
        source={require('../assets/logo.png')} // Update the path based on your project
        className="w-60 h-60"
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreenOne;
