/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {NODE_API_ENDPOINT} from '../utils/util';

type GeneratedImageGridProps = NativeStackScreenProps<
  HomeStackParamList,
  'GeneratedImageGrid'
>;

const {width} = Dimensions.get('window');
const imageSize = (width - 32 - 12) / 2; // 16px padding on both sides + 12px gap between columns

const images = [
  require('../assets/cactus.png'),
  require('../assets/cactus.png'),
  require('../assets/cactus.png'),
  require('../assets/cactus.png'),
  require('../assets/cactus.png'),
  require('../assets/cactus.png'),
];

const GeneratedImageGrid = ({navigation, route}: GeneratedImageGridProps) => {
  const [imageUrls, setImageUrls] = useState(route.params.imageUrls);

  // const dispatch = useDispatch();

  const createImagePayload = useSelector(
    (state: RootState) => state?.imageGen?.createImagePayload,
  );

  console.log(createImagePayload);

  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!createImagePayload) {
      Alert.alert('Error', 'Please enter a design prompt');
      return;
    }

    setLoading(true);
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

      setLoading(false);
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('GeneratedImageScreen', {imageUrl: item})
      }>
      <Image
        source={{uri: item}}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: 12,
          marginBottom: 12,
        }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#FAD9B3] px-4 pt-2 flex justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAD9B3] px-4 pt-2">
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
          <Icon name="wallet" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>

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
    </View>
  );
};

export default GeneratedImageGrid;
