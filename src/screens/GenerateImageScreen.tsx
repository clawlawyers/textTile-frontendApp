/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NODE_API_ENDPOINT} from '../utils/util';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import MagicLoadingScreen from './MagicLoadingScreen';
import {useDispatch} from 'react-redux';
import {setCreateImagePayload} from '../redux/imgeGenSlice';
import {launchImageLibrary} from 'react-native-image-picker';
import {Platform} from 'react-native';

type GenerateImageScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'GenerateImageScreen'
>;

const GenerateImageScreen = ({navigation}: GenerateImageScreenProps) => {
  // Add screen dimensions
  const {width} = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const [prompt, setPrompt] = useState('');
  const [colorInfo, setColorInfo] = useState('');
  const [complexity, setComplexity] = useState(4);
  const [imageCount, setImageCount] = useState(1); // Default to 1 image
  const [style, setStyle] = useState('Pattern'); // 'Standalone' or 'Pattern'
  const [loading, setLoading] = useState(false);
  const [referenceImg, setReferenceImg] = useState('');
  const [referenceImgFile, setReferenceImgFile] = useState<any>(null);
  const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes

  const dispatch = useDispatch();

  const generateImage = async () => {
    if (!prompt) {
      Alert.alert('Error', 'Please enter a design prompt');
      return;
    }

    setLoading(true);
    try {
      console.log(referenceImgFile);
      if (referenceImgFile) {
        const formData = new FormData();

        formData.append('image', {
          uri:
            Platform.OS === 'ios'
              ? referenceImgFile.uri.replace('file://', '')
              : referenceImgFile.uri,
          type: referenceImgFile.type || 'image/jpeg',
          name: referenceImgFile.fileName || 'reference_image.jpg',
        } as any);

        const responseUrl = await fetch(
          `${NODE_API_ENDPOINT}/upload/upload-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          },
        );
        if (!responseUrl.ok) {
          const errorText = await responseUrl.text();
          console.log(errorText);
          throw new Error('Failed to upload reference image');
        }

        const dataUrl = await responseUrl.json();
        console.log(dataUrl);
        setReferenceImg(dataUrl.url);
      }

      const payload = {
        description: prompt,
        style:
          style.toLowerCase() === 'pattern'
            ? 'repetitive pattern'
            : 'standalone',
        color_info: colorInfo || 'vibrant colors',
        simplicity: complexity,
        n_options: imageCount,
        reference_urls: referenceImg,
      };

      dispatch(setCreateImagePayload(payload));

      const response = await fetch(`${NODE_API_ENDPOINT}/genImg/create-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      console.log('Generated image data:', data);

      // Navigate to results screen with the generated images
      navigation.navigate('GeneratedImageGrid', {
        imageUrls: data.data.cloudinary_urls,
      });
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert('Error', 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add image upload handler
  const handleReferenceImageUpload = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.5,
      maxWidth: 800,
      maxHeight: 600,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('Image Picker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];

        // Check file size
        if (selectedAsset.fileSize && selectedAsset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert(
            'Image Too Large',
            `Please select an image smaller than 200KB. This image is ${(
              selectedAsset.fileSize / 1024
            ).toFixed(1)}KB.`,
            [{text: 'OK'}],
          );
          return;
        }

        setReferenceImg(selectedAsset.uri || '');
        setReferenceImgFile(selectedAsset);
      }
    });
  };

  // Add function to handle URL input
  const handleReferenceImgChange = (text: string) => {
    setReferenceImg(text);
    setReferenceImgFile(null); // Clear file when URL is entered
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAD9B3]"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}>
      {/* Header Icons */}
      <SafeAreaView className="flex-row justify-between items-center mb-2">
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

      {/* Illustration - responsive height */}
      <View className="items-center mt-2 mb-3">
        <Image
          source={require('../assets/illustration.gif')}
          resizeMode="contain"
          style={{
            width: Math.min(300, width * 0.85),
            height: isSmallScreen ? 180 : 250,
          }}
        />
      </View>

      {/* Heading */}
      <Text className="text-center text-[#DB9245] text-xl font-bold">
        Bring Your Ideas To Life
      </Text>
      <Text className="text-center text-black text-sm mb-5">
        Generate Image
      </Text>

      {/* Prompt Input */}
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter Your Design Generation Prompt Here ....."
        placeholderTextColor="#666666"
        multiline
        textAlignVertical="top"
        className="bg-[#EEBE88] border border-[#DB9245] text-[#666666] rounded-xl p-4 text-base mb-4"
        style={{minHeight: 150}}
      />
      {/* Advanced Design Settings */}
      <View className="bg-[#EEBE88] p-4 rounded-2xl">
        <Text className="text-black font-semibold mb-3">
          Advanced Design Settings
        </Text>

        {/* Style Selector - Responsive */}
        <View
          className={`flex-row justify-between mb-3 bg-[#DB9245] px-2 py-1 rounded-lg ${
            isSmallScreen ? 'flex-wrap' : ''
          }`}>
          <View className={isSmallScreen ? 'w-full mb-1' : 'w-auto'}>
            <Text className="text-white pt-1 px-2">Style</Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setStyle('Standalone')}
              className={`px-3 py-1.5 rounded-xl mr-2 ${
                style === 'Standalone' ? 'bg-[#FBDBB5]' : ''
              }`}>
              <Text
                className={`${
                  style === 'Standalone' ? 'text-black' : 'text-white'
                } ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                Standalone
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStyle('Pattern')}
              className={`px-3 py-1.5 rounded-xl ${
                style === 'Pattern' ? 'bg-[#FBDBB5]' : ''
              }`}>
              <Text
                className={`${
                  style === 'Pattern' ? 'text-black' : 'text-white'
                } ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                Pattern
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Colour Input - Responsive */}
        <View
          className={`flex-row items-center mb-3 bg-[#DB9245] px-2 py-1 rounded-lg ${
            isSmallScreen ? 'flex-wrap' : ''
          }`}>
          <View className={isSmallScreen ? 'w-full mb-1' : 'w-[20%]'}>
            <Text className="text-white px-2">Colour</Text>
          </View>
          <TextInput
            value={colorInfo}
            onChangeText={setColorInfo}
            placeholder="e.g: 3 Shades Of Reddish Pastel"
            placeholderTextColor="#666666"
            className={`bg-[#FBDBB5] rounded-xl px-3 py-1.5 text-[#DB9245] ${
              isSmallScreen ? 'text-xs w-full' : 'text-sm flex-1'
            }`}
          />
        </View>
        {/* Complexity & Image No */}
        <View className="flex-row items-center gap-2 mb-3">
          <View className="flex-1 flex-row items-center rounded-md bg-[#DB9245] overflow-hidden">
            <Text className="text-white px-2 py-2">Complexity</Text>
            <View className="flex-row rounded-md bg-[#FBDBB5] my-2 mr-3">
              <TouchableOpacity
                onPress={() => setComplexity(Math.max(1, complexity - 1))}
                className="px-3 py-1 border-r border-gray-200">
                <Text className="text-black text-lg">-</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-black px-3 mt-1 py-1 min-w-[30px] text-center">
                  {complexity}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setComplexity(Math.min(10, complexity + 1))}
                className="px-3 py-1 border-l border-gray-200">
                <Text className="text-black text-lg">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-1 flex-row items-center rounded-md bg-[#DB9245] overflow-hidden">
            <Text className="text-white px-2 py-2">Image Nos.</Text>
            <View className="flex-row rounded-md bg-[#FBDBB5] my-2 mr-3">
              <TouchableOpacity
                onPress={() => setImageCount(Math.max(1, imageCount - 1))}
                className="px-3 py-1 border-r border-gray-200">
                <Text className="text-black text-lg">-</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-black px-3 mt-1 py-1 min-w-[30px] text-center">
                  {imageCount}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setImageCount(Math.min(2, imageCount + 1))}
                className="px-3 py-1 border-l border-gray-200">
                <Text className="text-black text-lg">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reference Image Upload - Responsive Layout */}
        <View className="mb-3">
          <Text className="text-black font-semibold mb-1 text-sm">
            Reference Image
          </Text>
          <View className="flex-row items-center">
            <TextInput
              value={referenceImg}
              onChangeText={handleReferenceImgChange}
              editable={!referenceImgFile}
              placeholder="Paste Image URL or Upload Image"
              placeholderTextColor="#666666"
              className={`flex-1 py-2 px-3 bg-[#FBDBB5] text-[#666666] rounded-l-lg ${
                isSmallScreen ? 'text-xs' : 'text-sm'
              }`}
            />
            <TouchableOpacity
              className="bg-[#292C33] p-2 rounded-r-lg"
              onPress={handleReferenceImageUpload}>
              <Icon
                name="upload"
                size={isSmallScreen ? 20 : 24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Display selected reference image if available - Responsive */}
        {referenceImg && (
          <View className="relative mb-4">
            <Image
              source={{uri: referenceImg}}
              style={{
                width: '100%',
                height: width * 0.4, // Responsive height based on screen width
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => {
                setReferenceImg('');
                setReferenceImgFile(null);
              }}
              className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full">
              <Icon
                name="close-circle"
                size={isSmallScreen ? 16 : 20}
                color="#DB9245"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Generate Button - Responsive */}
      <TouchableOpacity
        onPress={generateImage}
        disabled={loading}
        className={`bg-[#292C33] rounded-xl py-3 mt-4 ${
          loading ? 'opacity-70' : ''
        }`}>
        {loading ? (
          <ActivityIndicator color="#FBDBB5" size="small" />
        ) : (
          <Text
            className={`text-white text-center font-semibold ${
              isSmallScreen ? 'text-sm' : 'text-base'
            }`}>
            Generate Image
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default GenerateImageScreen;
