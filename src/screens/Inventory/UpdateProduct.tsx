/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react'; // Import useState
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput, // Import TextInput
  Image, // Import Image
  Alert, // Import Alert for error handling
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather'; // Using Feather for arrow-left and upload
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'; // For delete icon

import {HomeStackParamList} from '../../stacks/Home';
import {launchImageLibrary} from 'react-native-image-picker'; // Import image picker

type UpdateProductScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'UpdateProductScreen'
>;

const UpdateProductScreen = ({navigation}: UpdateProductScreenProps) => {
  // State variables for input fields
  const [productName, setProductName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [designCode, setDesignCode] = useState('');
  const [productID, setProductID] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null); // State for image URI

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo', // Allow only photos
        quality: 1, // High quality image
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
      } else if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorCode);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      } else if (result.assets && result.assets.length > 0) {
        setProductImage(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('Error launching image library:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while picking the image.',
      );
    }
  };

  const handleDeleteImage = () => {
    setProductImage(null);
  };

  const handleUpdateProduct = () => {
    // Here you would typically gather all the state values
    // (productName, categoryName, designCode, productID, lotNumber, productImage)
    // and send them to your backend API.

    console.log('Product Name:', productName);
    console.log('Category Name:', categoryName);
    console.log('Design Code:', designCode);
    console.log('Product ID:', productID);
    console.log('Lot Number:', lotNumber);
    console.log('Product Image URI:', productImage);

    // Example of a simple alert for now
    Alert.alert('Update Product', 'Product update logic would go here!');
    // In a real application, you'd likely navigate back or show a success message
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4D5B2] px-4 pt-4 pb-6">
      <View className="flex-1 justify-between">
        {/* Top Section */}
        <View>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
              <Icon name="arrow-left" size={20} color="#292C33" />
            </TouchableOpacity>
            <View className="flex-1 items-end -ml-4">
              <Text className="text-sm text-black">Inventory For</Text>
              <Text className="text-base font-bold text-black">
                CLAW Textile Manufacturing
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="space-y-4 pt-4">
          <Text className="text-center text-black text-xl font-bold mb-2">
            Edit Inventory Product
          </Text>
          <Text className="text-center mb-6 text-black text-sm mx-10 mb-2">
            Please Update Inventory Product & Upload Relevant Product Images to
            Keep Inventory Updated
          </Text>

          {/* Input Fields */}
          {[
            {
              label: 'Product Name',
              value: productName,
              onChange: setProductName,
            },
            {
              label: 'Category Name',
              value: categoryName,
              onChange: setCategoryName,
            },
            {label: 'Design Code', value: designCode, onChange: setDesignCode},
            {label: 'Product ID', value: productID, onChange: setProductID},
            {label: 'Lot Number', value: lotNumber, onChange: setLotNumber},
          ].map((field, index) => (
            <View
              key={index}
              className="flex-row rounded-lg overflow-hidden mb-3">
              <View className="w-1/3 bg-[#DB9245] p-2 justify-center items-center">
                <Text className="text-white font-semibold text-base">
                  {field.label}
                </Text>
              </View>
              <TextInput
                style={{
                  fontSize: 12,
                  borderWidth: 1, // Apply a border width
                  borderColor: '#DB9245', // Apply the border color
                }}
                className="flex-1 bg-[#F4D5B2] p-2 text-black text-base rounded-r-lg"
                // placeholder={`Enter ${field.label}`}
                placeholderTextColor="#A9A9A9"
                value={field.value}
                onChangeText={field.onChange}
              />
            </View>
          ))}

          {/* Product Image Section */}
          <View className="flex-row rounded-lg overflow-hidden mb-4">
            <View className="w-1/3 bg-[#DB9245] p-2 justify-center items-center">
              <Text className="text-white font-semibold text-base">
                Product Image
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleImagePick}
              className="flex-1 bg-white border border border-gray-400 rounded-r-lg justify-center items-center px-4"
              style={{
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderRightWidth: 1,
              }}>
              <View style={{flexDirection: 'row'}}>
                <Icon
                  name="upload"
                  style={{
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}
                  size={10}
                  color="#D29C63"
                />
                <Text style={{fontSize: 10}} className="text-[#D29C63] px-2 ">
                  Click To Upload
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Display Uploaded Image */}
          {productImage && (
            <View className="relative w-full aspect-square rounded-xl overflow-hidden mb-4">
              <Image
                source={{uri: productImage}}
                className="w-full h-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleDeleteImage}
                className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                <MaterialCommunityIcon
                  name="delete-outline"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          )}

          <View className="  relative rounded-xl overflow-hidden mb-4">
            <Image
              source={require('../../assets/Sari.png')}
              style={{
                width: '100%',
                height: 200,
                marginBottom: 20,
                borderRadius: 10,
              }}
              //   resizeMode="contain"
            />
            <TouchableOpacity
              onPress={handleDeleteImage}
              className="absolute top-2 right-4 bg-black/50 p-2 rounded-full">
              <MaterialCommunityIcon
                name="delete-outline"
                size={15}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdateProduct} // Add onPress handler
          className="bg-[#DB9245] py-4 rounded-xl items-center justify-center ">
          <Text className="text-white font-semibold text-base">
            Update Product
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default UpdateProductScreen;
