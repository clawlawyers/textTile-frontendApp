/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';

const MagicLoadingScreen = () => {
  return (
    
    <SafeAreaView className="flex-1 bg-[#FAD9B3]">
      {/* Top Icons */}
      <View className="flex-row justify-between px-5 pt-3">
        <TouchableOpacity className="bg-white/20 p-2 rounded-full">
          <Icon name="home" size={20} color="#DB9245" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/20 p-2 rounded-full">
          <Icon name="restart" size={20} color="#DB9245" />
        </TouchableOpacity>
      </View>

      {/* Video Animation Centered */}
      <View className="flex-1 justify-center items-center">
        <View className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-300">
          <Video
            source={require('../assets/loading.mpg')}
            style={{width: 200, height: 200, borderRadius: 20}}
            resizeMode="cover"
            repeat
            muted
            paused={false}
            ignoreSilentSwitch="obey"
            useTextureView={false} // <-- important fix on Android
          />
        </View>

        {/* Text Section */}
        <Text className="text-[#C2743C] text-lg font-bold mt-8">
          Creating Magic
        </Text>
        <Text className="text-center text-sm text-black mt-1 px-4">
          Giving Life To Your Ideas Might{'\n'}Take Few Minutes
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MagicLoadingScreen;
