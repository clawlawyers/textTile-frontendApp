import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {HomeStackParamList} from '../stacks/Home';
import {launchImageLibrary} from 'react-native-image-picker';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import InventoryProductList from './InventoryProductList';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'AddInventoryProduct'
>;

const AddInventoryProduct = ({navigation, route}: AddNewUserProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const MAX_IMAGE_SIZE = 200 * 1024; // 200KB in bytes

  // Form state
  const [productName, setProductName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [designCode, setDesignCode] = useState('');
  const [productId, setProductId] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [stockAmount, setStockAmount] = useState('');

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );

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
      }
    });
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageFile(null);
  };

  const validateForm = () => {
    // if (!productName.trim()) {
    //   Alert.alert('Error', 'Product Name is required');
    //   return false;
    // }
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category Name is required');
      return false;
    }
    if (!designCode.trim()) {
      Alert.alert('Error', 'Design Code is required');
      return false;
    }
    if (!lotNumber.trim()) {
      Alert.alert('Error', 'Lot Number is required');
      return false;
    }
    // if (!imageUri) {
    //   Alert.alert('Error', 'Product Image is required');
    //   return false;
    // }
    return true;
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create form data for multipart/form-data request
      const formData = new FormData();

      // Add image file
      if (imageFile && imageUri) {
        formData.append('image', {
          uri:
            Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type: imageFile.type || 'image/jpeg',
          name: imageFile.fileName || 'product_image.jpg',
        } as any);
      }

      // Map form fields to API expected fields
      formData.append('bail_number', productId);
      formData.append('category_code', categoryName);
      formData.append('lot_number', lotNumber);
      formData.append('design_code', designCode);
      formData.append('stock_amount', stockAmount); // Default stock amount
      formData.append('bail_date', new Date().toISOString());

      // Get inventory ID from route params
      const inventoryId = activeFirm?.inventory;
      if (inventoryId) {
        formData.append('inventoryId', inventoryId);
      }

      console.log('Uploading product with data:', {
        bail_number: productId,
        category_code: categoryName,
        lot_number: lotNumber,
        inventoryId,
      });

      // Make API request to the upload endpoint
      const response = await fetch(`${NODE_API_ENDPOINT}/upload/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('API response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
      }

      if (!response.ok) {
        throw new Error(
          (result && result.error) ||
            'Failed to upload product. Please try again.',
        );
      }

      // Alert.alert('Success', 'Product added successfully', [
      //   {
      //     text: 'OK',
      //     onPress: () => navigation.goBack(),
      //   },
      // ]);
      ToastAndroid.show('Product added successfully', ToastAndroid.SHORT);
      navigation.replace('InventoryProductList', {
        companyId: activeFirm?._id || '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
      <ScrollView
        className="flex-1 px-4 py-6"
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
              {currentInventoryName}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text className="text-lg font-bold text-black mb-1 text-center">
          Add Inventory Product
        </Text>
        <Text className="text-xs text-black mb-4 text-center">
          Please Update Inventory Product & Upload Relevant{'\n'}
          Product Images to Keep Inventory Updated
        </Text>

        {/* Input Fields */}

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Item Name
            </Text>
          </View>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Enter Item Name"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Design Code
            </Text>
          </View>
          <TextInput
            value={designCode}
            onChangeText={setDesignCode}
            placeholder="Enter Design Code"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Full Bale No
            </Text>
          </View>
          <TextInput
            value={productId}
            onChangeText={setProductId}
            placeholder="Enter Full Bale No"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Lot Number
            </Text>
          </View>
          <TextInput
            value={lotNumber}
            onChangeText={setLotNumber}
            placeholder="Enter Lot Number"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
          />
        </View>

        <View className="flex-row items-center border border-[#D6872A] rounded-md mb-2">
          <View className="bg-[#D6872A] w-[40%] rounded-l-md px-2 py-4">
            <Text className="text-white font-semibold text-base">
              Stock Amount
            </Text>
          </View>
          <TextInput
            keyboardType="numeric"
            value={stockAmount}
            onChangeText={setStockAmount}
            placeholder="Enter Stock Amount"
            placeholderTextColor="#666"
            className="flex-1 px-3 py-3 text-black"
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

        {/* Display Uploaded Image */}
        {imageUri && (
          <View className="relative mb-4">
            <Image
              source={{uri: imageUri}}
              className="w-full h-40 rounded-md"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handleRemoveImage}
              className="absolute top-2 right-2 bg-black p-1 rounded-full">
              <Icon name="trash" size={18} color="#D6872A" />
            </TouchableOpacity>
          </View>
        )}

        {/* Add some padding at the bottom for scrolling space */}
        <View className="h-20" />
      </ScrollView>

      {/* Fixed Update Button at bottom */}
      <View className="px-4 pb-6 pt-2 bg-[#FAD8B0]">
        <TouchableOpacity
          className="bg-[#D6872A] py-4 rounded-xl items-center justify-center"
          onPress={handleAddProduct}
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

export default AddInventoryProduct;
