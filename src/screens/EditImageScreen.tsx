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
  Platform,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NODE_API_ENDPOINT} from '../utils/util';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {launchImageLibrary} from 'react-native-image-picker';

type EditImageScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'EditImageScreen'
>;

const EditImageScreen = ({navigation, route}: EditImageScreenProps) => {
  // Get screen dimensions
  const {width} = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const [imgUrl, setImgUrl] = useState(route.params.imageUrl);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<any>(null);
  const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes

  const handleImageUpload = () => {
    // Don't allow upload if image already provided via route
    if (route.params.imageUrl) return;

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

        setImgUrl(selectedAsset.uri || '');
        setImageFile(selectedAsset);
      }
    });
  };

  const handleRemoveImage = () => {
    // Don't allow removal if image provided via route
    if (route.params.imageUrl) return;

    setImgUrl('');
    setImageFile(null);
  };

  const editImage = async () => {
    if (!imgUrl) {
      Alert.alert('Error', 'Please provide a reference image');
      return;
    }

    if (!prompt) {
      Alert.alert('Error', 'Please enter an editing prompt');
      return;
    }

    setLoading(true);
    try {
      // If we have a local image file, upload it first
      let imageUrlToUse = imgUrl;

      if (imageFile && !route.params.imageUrl) {
        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'ios' ? imgUrl.replace('file://', '') : imgUrl,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'reference_image.jpg',
        } as any);

        const uploadResponse = await fetch(
          `${NODE_API_ENDPOINT}/upload/upload-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload reference image');
        }

        const uploadData = await uploadResponse.json();
        imageUrlToUse = uploadData.url;
      }

      const response = await fetch(`${NODE_API_ENDPOINT}/genImg/edit-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrlToUse,
          description: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit image');
      }

      const data = await response.json();
      console.log('Edited image data:', data);

      if (data?.error === 'Editing failed') {
        ToastAndroid.show('Editing failed', ToastAndroid.SHORT);
        return;
      }
      // Navigate to results screen with the edited image
      navigation.navigate('GeneratedImageScreen', {
        imageUrl: data.data.filename,
      });
    } catch (error) {
      console.error('Error editing image:', error);
      Alert.alert('Error', 'Failed to edit image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FAD9B3]">
      <View className="px-4 pt-4 flex">
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
            <Icon name="wallet" size={24} color="#DB9245" />
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

        {/* Heading - responsive text size */}
        <Text
          className={`text-center text-[#DB9245] ${
            isSmallScreen ? 'text-xl' : 'text-2xl'
          } font-bold`}>
          Transform Existing Ideas
        </Text>
        <Text
          className={`text-center text-black ${
            isSmallScreen ? 'text-sm' : 'text-base'
          } mb-5`}>
          Edit Image
        </Text>

        <View className="mt-4 mb-10">
          {/* Prompt Input */}
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Enter Your Design Generation Prompt Here ....."
            placeholderTextColor="#666666"
            multiline
            textAlignVertical="top"
            className="bg-[#EEBE88] border border-[#DB9245] text-[#666666] rounded-xl p-4 mb-4"
            style={{
              minHeight: isSmallScreen ? 150 : 200,
              fontSize: isSmallScreen ? 14 : 16,
            }}
          />

          {/* Advanced Design Settings */}
          <View className="bg-[#EEBE88] p-4 rounded-2xl border border-[#DB9245]">
            <Text
              className={`text-black font-semibold mb-3 ${
                isSmallScreen ? 'text-sm' : 'text-base'
              }`}>
              Advanced Design Settings
            </Text>

            {/* Reference Image Upload */}
            {/* <View className="mb-3">
              <Text className="text-black font-semibold mb-1 text-sm">
                Reference Image
              </Text>
              <View className="flex-row items-center">
                <TextInput
                  value={imgUrl}
                  onChangeText={text => {
                    if (!route.params.imageUrl) {
                      setImgUrl(text);
                      setImageFile(null); // Clear file when URL is entered
                    }
                  }}
                  editable={!route.params.imageUrl && !imageFile}
                  placeholder="Paste Image URL or Upload Image"
                  placeholderTextColor="#666666"
                  className={`flex-1 py-2 px-3 bg-[#FBDBB5] text-[#666666] rounded-l-lg ${
                    isSmallScreen ? 'text-xs' : 'text-sm'
                  }`}
                />
                <TouchableOpacity
                  className={`p-2 rounded-r-lg ${
                    route.params.imageUrl ? 'bg-gray-400' : 'bg-[#292C33]'
                  }`}
                  onPress={handleImageUpload}
                  disabled={!!route.params.imageUrl}>
                  <Icon
                    name="upload"
                    size={isSmallScreen ? 20 : 24}
                    color={route.params.imageUrl ? '#999' : 'white'}
                  />
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
                  value={imgUrl}
                  onChangeText={text => {
                    if (!route.params.imageUrl) {
                      setImgUrl(text);
                      setImageFile(null); // Clear file when URL is entered
                    }
                  }}
                  editable={!route.params.imageUrl && !imageFile}
                  placeholder="Paste Image URL or Upload Image"
                  placeholderTextColor="#666666"
                  className="flex-1 py-2 bg-[#FBDBB5] text-[#666666] text-xs px-2"
                />
                <TouchableOpacity
                  className={`p-2 rounded-r-lg ${
                    route.params.imageUrl ? 'bg-gray-400' : 'bg-[#292C33]'
                  }`}
                  onPress={handleImageUpload}
                  disabled={!!route.params.imageUrl}>
                  <Icon
                    name="upload"
                    size={isSmallScreen ? 20 : 24}
                    color={route.params.imageUrl ? '#999' : 'white'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              className={`bg-[#292C33] ${
                isSmallScreen ? 'py-3' : 'py-4'
              } rounded-xl `}
              onPress={editImage}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className={`text-white text-center font-bold ${
                    isSmallScreen ? 'text-sm' : 'text-base'
                  }`}>
                  Start Image Editing
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditImageScreen;
