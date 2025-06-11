/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ToastAndroid,
  Platform,
  PermissionsAndroid,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFetchBlob from 'rn-fetch-blob';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type GeneratedImageScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'GeneratedImageScreen'
>;

const GeneratedImageScreen = ({
  navigation,
  route,
}: GeneratedImageScreenProps) => {
  const [downloading, setDownloading] = useState(false);

  const checkPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }

    if (+Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } else if (+Platform.Version >= 29) {
      // No need to request permission explicitly for DownloadDir
      // DownloadManager can write without permission in scoped storage
      return true;
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const downloadImage = async () => {
    if (downloading) return;

    // Check if permission is granted
    const isPermissionGranted = await checkPermission();
    if (!isPermissionGranted) {
      ToastAndroid.show('Storage permission denied', ToastAndroid.SHORT);
      return;
    }

    setDownloading(true);

    try {
      // Get the image URL from route params
      const {imageUrl} = route.params;
      if (!imageUrl) {
        throw new Error('Image URL not found');
      }

      // Extract filename from URL or create a unique one
      const timestamp = new Date().getTime();
      const filename = `textile_design_${timestamp}.jpg`;

      // Set download path based on platform
      const {dirs} = RNFetchBlob.fs;
      const dirPath =
        Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

      const filePath = `${dirPath}/${filename}`;

      // Download the image
      const res = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'jpg',
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: 'Textile Design Downloaded',
          description: 'Image has been downloaded successfully',
          mime: 'image/jpeg',
          mediaScannable: true,
          path: filePath,
        },
      }).fetch('GET', imageUrl);

      // Show success message
      if (Platform.OS === 'ios') {
        // For iOS, we need to use the share functionality to save to gallery
        RNFetchBlob.ios.openDocument(res.path());
      } else {
        ToastAndroid.show('Image Downloaded Successfully', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        'Could not download the image. Please try again.',
      );
    } finally {
      setDownloading(false);
    }
  };

  const [imageLoading, setImageLoading] = useState(true);

  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const flickerAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.4,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(flickerAnim, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-2 flex">
      {/* Header */}
      <SafeAreaView className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('TextileImageGenerator')}>
          <Icon name="home" size={24} color="#DB9245" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('Wallet')}>
          <Icon name="wallet" size={24} color="#DB9245" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Title */}
      <Text className="text-center text-black font-semibold text-lg mb-4">
        Image Generated
      </Text>

      {/* Generated Image */}
      <View className="items-center mb-6" style={{width: 330, height: 350}}>
        <Image
          source={{uri: route.params.imageUrl}}
          style={{
            width: 330,
            height: 350,
            borderRadius: 12,
            position: 'absolute',
          }}
          resizeMode="stretch"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {imageLoading && (
          <Animated.View
            style={{
              width: 350,
              height: 350,
              borderRadius: 12,
              backgroundColor: '#E5C59E',
              shadowColor: '#DB9245',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: flickerAnim,
              shadowRadius: 4,
              opacity: pulseAnim,
              elevation: flickerAnim.interpolate({
                inputRange: [0.2, 0.4],
                outputRange: [3, 6],
              }),
            }}
          />
        )}
      </View>

      <View className="mt-auto mb-10">
        {/* Top Buttons */}
        <View className="flex-row justify-center gap-4 mb-6">
          <TouchableOpacity
            className="bg-[#FAD9B3] w-[45%] border border-[#DB9245] px-4 py-2 rounded-xl"
            onPress={() =>
              ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT)
            }>
            <Text className="text-[#DB9245] font-semibold text-sm text-center">
              Colorify
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FAD9B3] w-[45%] border border-[#DB9245] px-4 py-2 rounded-xl"
            onPress={() => {
              navigation.navigate('PatternToGridScreen', {
                imageUrl: route.params.imageUrl,
              });
              // ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
            }}>
            <Text className="text-[#DB9245] font-semibold text-sm text-center">
              Make Grid Pattern
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl mb-3"
          onPress={() =>
            navigation.navigate('EditImageScreen', {
              imageUrl: route.params.imageUrl,
            })
          }>
          <Text className="text-white text-center font-semibold text-base">
            Edit Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#292C33] py-4 rounded-xl"
          onPress={downloadImage}
          disabled={downloading}>
          <Text className="text-white text-center font-semibold text-base">
            {downloading ? 'Downloading...' : 'Download Design'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GeneratedImageScreen;
