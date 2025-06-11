/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';
import LottieView from 'lottie-react-native';
import {scale, verticalScale} from '../utils/scaling';

type GeneratedImageGridProps = NativeStackScreenProps<
  HomeStackParamList,
  'GeneratedImageGrid'
>;

const {width} = Dimensions.get('window');
const imageSize = (width - 32 - 12) / 2; // 16px padding on both sides + 12px gap between columns

const GeneratedImageGrid = ({navigation, route}: GeneratedImageGridProps) => {
  const [imageUrls, setImageUrls] = useState(route.params.imageUrls);
  const [imageLoadingStates, setImageLoadingStates] = useState(
    Array(route.params.imageUrls.length).fill(true),
  );

  const createImagePayload = useSelector(
    (state: RootState) => state?.imageGen?.createImagePayload,
  );

  console.log(createImagePayload);

  const [loading, setLoading] = useState(false);

  // Animation for pulsing opacity effect
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  // Animation for flickering shadow effect
  const flickerAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Pulse animation for opacity
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Flicker animation for shadow
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
  }, [pulseAnim, flickerAnim]);

  const generateImage = async () => {
    if (!createImagePayload) {
      Alert.alert('Error', 'Please enter a design prompt');
      return;
    }

    setLoading(true);
    // Reset image loading states for new images
    setImageLoadingStates(Array(imageUrls.length).fill(true));
    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/genImg/create-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createImagePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Generated image data:', data);

      setImageUrls(data.data.cloudinary_urls);
      // Initialize loading states for new images
      setImageLoadingStates(Array(data.data.cloudinary_urls.length).fill(true));

      setLoading(false);
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item, index}: {item: string; index: number}) => {
    const handleImageLoadStart = () => {
      const newLoadingStates = [...imageLoadingStates];
      newLoadingStates[index] = true;
      setImageLoadingStates(newLoadingStates);
    };

    const handleImageLoadEnd = () => {
      const newLoadingStates = [...imageLoadingStates];
      newLoadingStates[index] = false;
      setImageLoadingStates(newLoadingStates);
    };

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('GeneratedImageScreen', {imageUrl: item})
        }
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: 12,
          marginBottom: 12,
          position: 'relative',
        }}>
        <Image
          source={{uri: item}}
          style={{
            width: imageSize,
            height: imageSize,
            borderRadius: 12,
          }}
          resizeMode="cover"
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
        />
        {imageLoadingStates[index] && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: pulseAnim, // Opacity animation with native driver
            }}>
            <Animated.View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#E5C59E', // Slightly darker than background for contrast
                borderRadius: 12,
                shadowColor: '#DB9245',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: flickerAnim, // Flickering shadow for iOS
                shadowRadius: 4,
                elevation: flickerAnim.interpolate({
                  inputRange: [0.2, 0.4],
                  outputRange: [3, 6], // Flickering elevation for Android
                }),
              }}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAD9B3] px-4 pt-2">
      {loading ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FAD9B3',
          }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: scale(100),
            }}>
            <LottieView
              source={require('../assets/lottieanimation.json')}
              autoPlay
              loop
              style={{
                width: scale(200),
                height: verticalScale(200),
              }}
            />
            <Text
              className="text-[#DB9245] text-2xl font-extrabold mt-2"
              style={{textAlign: 'center'}}>
              Generating Magic...
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
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
          </View>

          {/* Title */}
          <Text className="text-center text-black font-semibold text-lg mb-4">
            Image Generated
          </Text>

          {/* 2-Column Grid */}
          <FlatList
            data={imageUrls}
            numColumns={2}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
          />

          {/* Button */}
          <TouchableOpacity
            className="bg-[#292C33] mt-auto mb-8 py-4 rounded-xl"
            onPress={generateImage}>
            <Text className="text-white text-center font-semibold text-base">
              Generate Again
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

export default GeneratedImageGrid;
