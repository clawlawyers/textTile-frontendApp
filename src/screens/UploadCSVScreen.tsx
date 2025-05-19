import React from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
// import DocumentPicker from 'react-native-document-picker';
import Icon1 from 'react-native-vector-icons/Feather'; // You can change this to Ionicons, FontAwesome, etc.
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'UploadCSVScreen'
>;

const UploadCSVScreen = ({navigation}: AddNewUserProps) => {
  const [fileName, setFileName] = React.useState<string | null>(null);

  // const handleFilePick = async () => {
  //   try {
  //     const res = await DocumentPicker.pickSingle({
  //       type: [DocumentPicker.types.csv],
  //     });
  //     setFileName(res.name);
  //     console.log('File picked:', res);
  //   } catch (err) {
  //     if (DocumentPicker.isCancel(err)) {
  //       console.log('User cancelled file picker');
  //     } else {
  //       console.error('File pick error:', err);
  //     }
  //   }
  // };

  const handleCSVUpload = () => {
    // if (fileName) {
    //   console.log('Uploading file:', fileName);
    //   // Call upload API here
    // } else {
    //   console.log('Please select a CSV file first');
    // }
    navigation.navigate('InventoryUpdatingScreen');
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] px-6 pt-12">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Back and Header */}
      <View className="flex-row justify-between items-start px-1 mb-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon1 name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View className="items-end">
          <Text className="text-xs text-black">Inventory For</Text>
          <Text className="text-base font-bold text-black">
            CLAW Textile Manufacturing
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
        <Text className="text-[#DB9245]">Add Items</Text> to {' \n'} Your
        Inventory
      </Text>

      {/* File Upload Button */}
      <TouchableOpacity
        className="border border-[#DB9245] py-4 rounded-lg items-center flex-row justify-center mb-10"
        // onPress={handleFilePick}
      >
        <Icon name="upload" size={18} color="#DB9245" />
        <Text className="text-[#DB9245] font-semibold ml-2">
          {fileName ? fileName : 'Click Here To Upload File'}
        </Text>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center mt-24"
        onPress={handleCSVUpload}>
        <Text className="text-white font-semibold">Upload CSV</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UploadCSVScreen;
