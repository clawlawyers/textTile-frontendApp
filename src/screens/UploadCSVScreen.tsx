import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {pick, types} from '@react-native-documents/picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setSelectedFileData} from '../redux/commonSlice';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'UploadCSVScreen'
>;

const UploadCSVScreen = ({navigation}: AddNewUserProps) => {
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileData, setFileData] = React.useState<any | null>(null);

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleFilePick = async () => {
    try {
      const [res] = await pick({
        type: [types.csv, types.xls, types.xlsx],
      });
      setFileData(res);
      setFileName(res.name);
      console.log('File picked:', res);
    } catch (err) {
      if (err instanceof Error && err.message.includes('cancelled')) {
        console.log('User cancelled file picker');
      } else {
        console.error('File pick error:', err);
      }
    }
  };

  const handleCSVUpload = async () => {
    if (!fileName || !fileData) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setLoading(true);

    try {
      // Create form data for multipart/form-data request
      const formData = new FormData();

      // Append the file to form data
      formData.append('excelFile', {
        uri:
          Platform.OS === 'ios'
            ? fileData.uri.replace('file://', '')
            : fileData.uri,
        type: fileData.type || 'application/vnd.ms-excel',
        name: fileData.name || 'inventory.xlsx',
      } as any);

      // Add company ID if available
      // if (activeFirm?._id) {
      //   formData.append('companyId', activeFirm._id);
      // }
      formData.append('headersOnly', 'true');

      console.log('Uploading file:', fileData.name);
      console.log('To company:', activeFirm?._id);

      // Make API request to upload the file
      const response = await fetch(
        `${NODE_API_ENDPOINT}/companies/${activeFirm?._id}/upload-inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentUser?.token}`,
          },
          body: formData,
        },
      );

      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error('Failed to upload file. Please try again.');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      dispatch(setSelectedFileData(fileData));

      // Navigate to the next screen on success
      navigation.replace('InventoryMappingScreen', {mapping: result.headers});
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Failed to upload file. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] px-6 pt-12">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Back and Header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Logo */}
      <View className="items-start mb-8">
        <Image
          source={require('../assets/logo.png')} // Replace with your actual logo
          className="w-24 h-24"
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text className="text-xl font-bold text-black mb-2">
        Add Items to Inventory
      </Text>
      <Text className="text-sm text-[#292C33] mb-10">
        Please Choose How you want to{' '}
        <Text className="text-[#DB9245]">Add Items</Text> to {'\n'} Your
        Inventory
      </Text>

      {/* File Upload Button */}
      <TouchableOpacity
        className="border border-[#DB9245] py-4 rounded-lg items-center flex-row justify-center mb-10"
        onPress={handleFilePick}>
        <Icon name="upload" size={18} color="#DB9245" />
        <Text className="text-[#DB9245] font-semibold ml-2">
          {fileName ? fileName : 'Click Here To Upload File'}
        </Text>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center mt-auto mb-8"
        onPress={handleCSVUpload}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">
            {fileName ? 'Complate Upload' : 'Upload CSV'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default UploadCSVScreen;
