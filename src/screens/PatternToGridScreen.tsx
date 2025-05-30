/* eslint-disable react-native/no-inline-styles */
import {NativeStackScreenProps} from '@react-navigation/native-stack';
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
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeStackParamList} from '../stacks/Home';
import {launchImageLibrary} from 'react-native-image-picker';
import {NODE_API_ENDPOINT} from '../utils/util';

type PatternToGridScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'PatternToGridScreen'
>;

const PatternToGridScreen = ({navigation}: PatternToGridScreenProps) => {
  const [rows, setRows] = useState(4);
  const [columns, setColumns] = useState(4);
  const [imageUri, setImageUri] = useState('');
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file' | null>(null);
  const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const {width} = Dimensions.get('window');
  const isSmallScreen = width < 400;

  const handleImageUpload = () => {
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

        setImageUri(selectedAsset.uri || '');
        setImageFile(selectedAsset);
        setImageSource('file');
      }
    });
  };

  const handleTileImage = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'Please provide an image URL or upload an image');
      return;
    }

    setLoading(true);
    try {
      let requestBody;
      let headers;

      if (imageFile) {
        // Using uploaded file
        const formData = new FormData();
        formData.append('image', {
          uri:
            Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'pattern_image.jpg',
        } as any);
        formData.append('grid_rows', rows.toString());
        formData.append('grid_cols', columns.toString());

        requestBody = formData;
        headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        // Using image URL
        requestBody = JSON.stringify({
          image: imageUri,
          grid_rows: rows.toString(),
          grid_cols: columns.toString(),
        });
        headers = {
          'Content-Type': 'application/json',
        };
      }

      // Make API request
      const response = await fetch(
        `${NODE_API_ENDPOINT}/genImg/tile-image-grid`,
        {
          method: 'POST',
          headers,
          body: requestBody,
        },
      );

      if (!response.ok) {
        throw new Error('Failed to tile image');
      }

      const data = await response.json();
      console.log('Tiled image data:', data);

      // Navigate to results screen with the generated image
      navigation.navigate('GeneratedImageScreen', {
        imageUrl: data.data.filename,
      });
    } catch (error) {
      console.error('Error tiling image:', error);
      Alert.alert('Error', 'Failed to tile image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUriChange = (text: string) => {
    setImageUri(text);
    if (text.trim()) {
      setImageSource('url');
      // Clear imageFile when manually entering a URL
      if (imageFile) {
        setImageFile(null);
      }
    } else {
      setImageSource(null);
    }
  };

  const clearImage = () => {
    setImageUri('');
    setImageFile(null);
    setImageSource(null);
  };

  const incrementRows = () => setRows(prev => prev + 1);
  const decrementRows = () => setRows(prev => (prev > 1 ? prev - 1 : 1));
  const incrementColumns = () => setColumns(prev => prev + 1);
  const decrementColumns = () => setColumns(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD9B3]">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{
          paddingBottom: keyboardVisible ? 200 : 20,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
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

        {/* Illustration - Hide when keyboard is visible on small screens */}
        {(!keyboardVisible || width > 400) && (
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
        )}

        {/* Heading - Smaller when keyboard is visible */}
        <Text
          className={`text-center text-[#DB9245] ${
            keyboardVisible ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-2xl'
          } font-bold`}>
          Convert Designs To Grid
        </Text>
        {!keyboardVisible && (
          <Text
            className={`text-center text-black ${
              isSmallScreen ? 'text-sm' : 'text-base'
            } mb-5`}>
            Pattern To Grid
          </Text>
        )}

        {/* Advanced Settings Container */}
        <View className="bg-[#EEBE88] p-4 rounded-2xl border border-[#DB9245] mt-auto mb-10">
          <Text className="text-black font-semibold mb-3">
            Advanced Design Settings
          </Text>

          {/* Rows and Columns */}
          <View className="flex-row justify-between items-center mb-3">
            {/* Rows */}
            <View className="flex-1 flex-row items-center bg-[#DB9245] rounded-md mr-2 overflow-hidden">
              <Text className="text-white px-2 py-2 text-sm">Rows</Text>
              <View className="flex-row bg-[#FBDBB5] my-2 mr-2 rounded-md">
                <TouchableOpacity
                  className="px-3 py-1 border-r border-gray-200"
                  onPress={decrementRows}>
                  <Text className="text-black text-lg">-</Text>
                </TouchableOpacity>
                <Text className="text-black px-3 mt-1 py-1 min-w-[30px] text-center">
                  {rows}
                </Text>
                <TouchableOpacity
                  className="px-3 py-1 border-l border-gray-200"
                  onPress={incrementRows}>
                  <Text className="text-black text-lg">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Columns */}
            <View className="flex-1 flex-row items-center bg-[#DB9245] rounded-md ml-2 overflow-hidden">
              <Text className="text-white px-2 py-2 text-sm">Columns</Text>
              <View className="flex-row bg-[#FBDBB5] my-2 mr-2 rounded-md">
                <TouchableOpacity
                  className="px-3 py-1 border-r border-gray-200"
                  onPress={decrementColumns}>
                  <Text className="text-black text-lg">-</Text>
                </TouchableOpacity>
                <Text className="text-black px-3 mt-1 py-1 min-w-[30px] text-center">
                  {columns}
                </Text>
                <TouchableOpacity
                  className="px-3 py-1 border-l border-gray-200"
                  onPress={incrementColumns}>
                  <Text className="text-black text-lg">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Reference Image Upload */}
          <View className="mb-3">
            <Text className="text-black font-semibold mb-1 text-sm">
              Reference Image{' '}
              {imageSource === 'file'
                ? '(From Gallery)'
                : imageSource === 'url'
                ? '(From URL)'
                : ''}
            </Text>
            <View className="flex-row items-center bg-[#DB9245] rounded-md overflow-hidden mb-2">
              <Text className="text-white px-2 py-2 text-sm">
                Reference Image
              </Text>
              <TextInput
                value={imageUri}
                onChangeText={handleImageUriChange}
                placeholder={
                  imageSource === 'file'
                    ? 'Image selected from gallery'
                    : 'Paste Image URL'
                }
                placeholderTextColor="#666666"
                className="flex-1 py-2 bg-[#FBDBB5] text-[#666666] text-xs px-2"
                editable={imageSource !== 'file'} // Disable editing if image is from gallery
              />
              <TouchableOpacity
                className={`p-2 ${
                  imageSource === 'url' && imageUri
                    ? 'bg-red-500'
                    : 'bg-[#292C33]'
                }`}
                onPress={
                  imageSource === 'url' && imageUri
                    ? clearImage
                    : handleImageUpload
                }>
                <Icon
                  name={imageSource === 'url' && imageUri ? 'close' : 'upload'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {imageSource === 'file' && imageUri && (
              <View className="relative mb-4">
                <Image
                  source={{uri: imageUri}}
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={clearImage}
                  className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full">
                  <Icon name="close-circle" size={20} color="#DB9245" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            className="bg-[#292C33] py-4 rounded-xl mt-6"
            onPress={handleTileImage}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Start Image Generation
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View className="absolute inset-0 bg-black/30 justify-center items-center">
          <ActivityIndicator size="large" color="#DB9245" />
          <Text className="text-white mt-2 font-medium">Processing...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default PatternToGridScreen;
