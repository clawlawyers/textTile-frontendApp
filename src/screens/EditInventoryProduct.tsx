import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {launchImageLibrary} from 'react-native-image-picker';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'EditInventoryProduct'
>;

const EditInventoryProduct = ({navigation, route}: AddNewUserProps) => {
  const [productDetails, setProductDetails] = useState(
    route.params.productDetails,
  );
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const inventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );
  const [imageFile, setImageFile] = useState<any>(null);
  const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes

  // Track if image was edited
  const initialImageUri = useRef(productDetails.image || null);
  const [imageEdited, setImageEdited] = useState(false);

  // Create a form state object with the correct field names
  const [form, setForm] = useState({
    bail_number: productDetails.bail_number || '',
    category_code: productDetails.category_code || '',
    design_code: productDetails.design_code || '',
    lot_number: productDetails.lot_number || '',
    stock_amount: productDetails.stock_amount?.toString() || '0',
  });

  const [imageUri, setImageUri] = useState<string | null>(
    productDetails.image || null,
  );

  // Add keyboard listeners
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

        setImageUri(selectedAsset.uri || null);
        setImageFile(selectedAsset);
        setImageEdited(true); // Mark image as edited
      }
    });
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageFile(null);
    setImageEdited(true); // Mark image as edited (removed)
  };

  const handleUpdateProduct = async () => {
    setLoading(true);
    try {
      // Check if image was edited
      if (imageEdited) {
        console.log('Image was edited, using update-with-image API');
        const formData = new FormData();

        // Add image file if we have one
        if (imageFile && imageUri) {
          formData.append('image', {
            uri:
              Platform.OS === 'ios'
                ? imageUri.replace('file://', '')
                : imageUri,
            type: imageFile.type || 'image/jpeg',
            name: imageFile.fileName || 'product_image.jpg',
          } as any);

          const getImageURI = await fetch(
            `${NODE_API_ENDPOINT}/upload/upload-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${currentUser?.token}`,
              },
              body: formData,
            },
          );
          if (!getImageURI.ok) {
            const errorText = await getImageURI.text();
            console.error('API error response:', errorText);
            throw new Error(
              `Failed to upload image: ${getImageURI.status} ${errorText}`,
            );
          }
          const imageURIData = await getImageURI.json();
          formData.append('image', imageURIData.url);
          form.image = imageURIData.url;
        } else {
          // If image was removed, send a flag to remove it
          formData.append('image', '');
          form.image = '';
        }

        // Add product data
        formData.append('bail_number', form.bail_number);
        formData.append('category_code', form.category_code);
        formData.append('design_code', form.design_code);
        formData.append('lot_number', form.lot_number);
        formData.append('stock_amount', form.stock_amount);

        // Make API request with multipart/form-data
        const response = await fetch(
          `${NODE_API_ENDPOINT}/inventory/product/${productDetails._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
            body: JSON.stringify(form),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(
            `Failed to update product: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        console.log('Product updated with image change:', data);

        Alert.alert('Success', 'Product updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Pop back to the product details screen with updated data
              navigation.goBack();
              // Update the product details in the previous screen
              navigation.navigate('InventoryProductDetails', {
                productDetails: data.product,
              });
            },
          },
        ]);
      } else {
        console.log('Image was not edited, using regular update API');
        // Regular update without image change
        const response = await fetch(
          `${NODE_API_ENDPOINT}/inventory/product/${productDetails._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser?.token}`,
            },
            body: JSON.stringify({
              ...form,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(
            `Failed to update product: ${response.status} ${errorText}`,
          );
        }

        const data = await response.json();
        console.log('Product updated without image change:', data);

        Alert.alert('Success', 'Product updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Pop back to the product details screen with updated data
              navigation.goBack();
              // Update the product details in the previous screen
              navigation.navigate('InventoryProductDetails', {
                productDetails: data.product,
              });
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD9B3]">
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{paddingBottom: keyboardVisible ? 200 : 20}}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
            <Icon name="arrow-left" size={20} color="#292C33" />
          </TouchableOpacity>
          <View className="flex-1 items-end -ml-4">
            <Text className="text-sm text-black">Inventory Name</Text>
            <Text className="text-base font-bold text-black">
              {inventoryName}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text className="text-lg font-bold text-black mb-1 text-center">
          Edit Inventory Product
        </Text>
        <Text className="text-xs text-black mb-4 text-center">
          Please Update Inventory Product & Upload Relevant{'\n'}
          Product Images to Keep Inventory Updated
        </Text>

        {/* Input Fields */}
        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Full Bale Number
            </Text>
          </View>
          <TextInput
            placeholder="Enter Bail Number"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
            value={form.bail_number}
            onChangeText={text => setForm({...form, bail_number: text})}
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Item Name
            </Text>
          </View>
          <TextInput
            placeholder="Enter Item Name"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
            value={form.category_code}
            onChangeText={text => setForm({...form, category_code: text})}
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Design Code
            </Text>
          </View>
          <TextInput
            placeholder="Enter Design Code"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
            value={form.design_code}
            onChangeText={text => setForm({...form, design_code: text})}
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Lot Number
            </Text>
          </View>
          <TextInput
            placeholder="Enter Lot Number"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
            value={form.lot_number}
            onChangeText={text => setForm({...form, lot_number: text})}
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Stock Amount
            </Text>
          </View>
          <TextInput
            placeholder="Enter Stock Amount"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
            value={form.stock_amount}
            onChangeText={text => setForm({...form, stock_amount: text})}
            keyboardType="numeric"
          />
        </View>

        {/* Image Upload Field */}
        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white text-base">Product Image</Text>
          </View>
          <TouchableOpacity
            className="flex-1 flex-row justify-center items-center py-3"
            onPress={handleImageUpload}>
            <Icon name="upload" size={16} color="#D6872A" />
            <Text className="ml-2 text-[#D6872A] text-sm">Click To Upload</Text>
          </TouchableOpacity>
        </View>
        <View className="relative mb-4">
          <Image
            source={{uri: imageUri}}
            className="w-full h-40 rounded-md"
            resizeMode="cover"
          />
          {imageUri && (
            <TouchableOpacity
              onPress={handleRemoveImage}
              className="absolute top-2 right-2 bg-black p-1 rounded-full">
              <Icon name="trash" size={18} color="#D6872A" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Fixed Update Button at bottom */}
      <View className="px-4 pb-6 pt-2 bg-[#FAD9B3]">
        <TouchableOpacity
          className="bg-[#D6872A] py-4 rounded-xl items-center justify-center"
          onPress={handleUpdateProduct}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Update Product
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditInventoryProduct;
