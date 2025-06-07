/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
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
  KeyboardAvoidingView,
  Keyboard,
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

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
    <SafeAreaView className="flex-1 bg-[#FAD9B3]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        className="flex-1">
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{
            paddingBottom: keyboardVisible ? 200 : 20,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled">
          {/* Header Icons */}
          <View className="flex-row justify-between items-center mb-2">
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

          {/* Illustration - smaller height */}
          <View className="items-center mt-1 mb-2">
            <Image
              source={require('../assets/illustration.gif')}
              resizeMode="contain"
              style={{
                width: Math.min(300, width * 0.85),
                height: 260,
              }}
            />
          </View>

          {/* Heading - reduced margins */}
          <Text className="text-center text-[#DB9245] text-xl font-bold">
            Bring Your Ideas To Life
          </Text>
          <Text className="text-center text-black text-sm mb-2">
            Generate Image
          </Text>

          <View className="mt-auto mb-4">
            {/* Prompt Input - reduced height */}
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Enter Your Design Generation Prompt Here ....."
              placeholderTextColor="#666666"
              multiline
              textAlignVertical="top"
              className="bg-[#EEBE88] border border-[#DB9245] text-[#666666] rounded-xl p-3 text-base mb-2"
              style={{minHeight: 60, height: 'auto'}}
            />

            {/* Advanced Design Settings - more compact */}
            <View className="bg-[#EEBE88] p-3 rounded-2xl">
              <Text className="text-black font-semibold mb-2 text-sm">
                Advanced Design Settings
              </Text>

              {/* Style Selector */}
              <View className="flex-row justify-between mb-1 bg-[#DB9245] px-2 py-1 rounded-lg">
                <View className="w-auto">
                  <Text className="text-white pt-1 px-2">Style</Text>
                </View>
                <View className="flex-row flex-1 justify-evenly">
                  <TouchableOpacity
                    onPress={() => setStyle('Standalone')}
                    className={`px-3 py-1 rounded-xl mr-2 ${
                      style === 'Standalone' ? 'bg-[#FBDBB5]' : ''
                    }`}>
                    <Text
                      className={
                        style === 'Standalone' ? 'text-black' : 'text-white'
                      }>
                      Standalone
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStyle('Pattern')}
                    className={`px-3 py-1 rounded-xl ${
                      style === 'Pattern' ? 'bg-[#FBDBB5]' : ''
                    }`}>
                    <Text
                      className={
                        style === 'Pattern' ? 'text-black' : 'text-white'
                      }>
                      Pattern
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Colour Input */}
              <View className="flex-row items-center mb-1 bg-[#DB9245] px-2 py-1 rounded-lg">
                <View className="w-[20%]">
                  <Text className="text-white px-2">Colour</Text>
                </View>
                <TextInput
                  value={colorInfo}
                  onChangeText={setColorInfo}
                  placeholder="e.g: 3 Shades Of Reddish Pastel"
                  placeholderTextColor="#666666"
                  className="bg-[#FBDBB5] rounded-xl px-3 py-1 text-[#DB9245] flex-1"
                />
              </View>

              {/* Complexity & Image No */}
              <View className="flex-col items-center gap-2 mb-2">
                <View className="w-full flex-row items-center justify-between rounded-md bg-[#DB9245] px-2 py-1">
                  <Text className="text-white text-sm">Complexity</Text>
                  <View className="flex-row rounded-md bg-[#FBDBB5]">
                    <TouchableOpacity
                      onPress={() => setComplexity(Math.max(1, complexity - 1))}
                      className="px-2 py-1 border-r border-gray-200">
                      <Text className="text-black text-lg">-</Text>
                    </TouchableOpacity>
                    <View className="justify-center items-center px-4">
                      <Text className="text-black text-base">{complexity}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setComplexity(Math.min(10, complexity + 1))
                      }
                      className="px-2 py-1 border-l border-gray-200">
                      <Text className="text-black text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="w-full flex-row items-center justify-between rounded-md bg-[#DB9245] px-2 py-1">
                  <Text className="text-white text-sm">Image Nos.</Text>
                  <View className="flex-row rounded-md bg-[#FBDBB5]">
                    <TouchableOpacity
                      onPress={() => setImageCount(Math.max(1, imageCount - 1))}
                      className="px-2 py-1 border-r border-gray-200">
                      <Text className="text-black text-lg">-</Text>
                    </TouchableOpacity>
                    <View className="justify-center items-center px-4">
                      <Text className="text-black text-base">{imageCount}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setImageCount(Math.min(5, imageCount + 1))}
                      className="px-2 py-1 border-l border-gray-200">
                      <Text className="text-black text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Reference Image Upload */}
              {/* <View className="mb-2 ">
                <Text className="text-black font-semibold mb-1 text-xs">
                  Reference Image
                </Text>
                <View className="flex-row items-center bg-[#DB9245] py-2 rounded-lg">
                  <Text className="text-black font-semibold mb-1 text-sm px-2">
                    Reference Image
                  </Text>
                  <TextInput
                    value={referenceImg}
                    onChangeText={handleReferenceImgChange}
                    editable={!referenceImgFile}
                    placeholder="Paste Image URL or Upload Image"
                    placeholderTextColor="#666666"
                    className="py- px-3 bg-[#FBDBB5] text-[#666666] rounded-l-lg text-xs flex-1"
                  />
                  <TouchableOpacity
                    className="bg-[#292C33] p-2 rounded-r-lg"
                    onPress={handleReferenceImageUpload}>
                    <Icon name="upload" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View> */}

              <View className="mb-2">
                <Text className="text-black font-semibold mb-1 text-sm">
                  Reference Image{' '}
                </Text>
                <View className="flex-row items-center bg-[#DB9245] rounded-md overflow-hidden mb-2">
                  <Text className="text-white px-2 py-2 text-sm">
                    Reference Image
                  </Text>
                  <TextInput
                    value={referenceImg}
                    onChangeText={handleReferenceImgChange}
                    editable={!referenceImgFile}
                    placeholder="Paste Image URL or Upload Image"
                    placeholderTextColor="#666666"
                    className="flex-1 py-2 bg-[#FBDBB5] text-[#666666] text-xs px-2"
                  />
                  <TouchableOpacity
                    className={`p-2 rounded-r-lg bg-[#292C33]`}
                    onPress={handleReferenceImageUpload}>
                    <Icon
                      name="upload"
                      size={isSmallScreen ? 20 : 24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              onPress={generateImage}
              disabled={loading}
              className={`bg-[#292C33] rounded-xl py-3 mt-3 ${
                loading ? 'opacity-70' : ''
              }`}>
              {loading ? (
                <ActivityIndicator color="#FBDBB5" size="small" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Generate Image
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GenerateImageScreen;
