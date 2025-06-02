/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Dropdown} from 'react-native-element-dropdown';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {setSelectedFileData} from '../redux/commonSlice';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryMappingScreen'
>;

const InventoryMappingScreen = ({navigation, route}: AddNewUserProps) => {
  const [mapping, setMapping] = useState({
    baleNumberField: '',
    dateField: '',
    categoryField: '',
    lotNumberField: '',
    stockAmountField: '',
    designCodeField: '',
  });

  const [dropdownData, setDropdownData] = useState<
    {label: string; value: string}[]
  >([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);
  const selectedFileData = useSelector(
    (state: RootState) => state.common.selectedFileData,
  );

  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );

  // Extract column headers from route params and format for dropdown
  useEffect(() => {
    if (route.params?.mapping && Array.isArray(route.params.mapping)) {
      // Format headers for dropdown component
      const formattedHeaders = route.params.mapping.map(header => ({
        label: header,
        value: header,
      }));
      setDropdownData(formattedHeaders);
      console.log('Available columns:', formattedHeaders);
    }
  }, [route.params?.mapping]);

  const handleStartMapping = async () => {
    // Validate that all fields are mapped
    const requiredFields = [
      'baleNumberField',
      'dateField',
      'categoryField',
      'lotNumberField',
      'stockAmountField',
    ];

    // Check if any field is empty or undefined
    const missingFields = requiredFields.filter(
      field => !mapping[field] || mapping[field] === '',
    );

    console.log('Current mapping:', mapping);
    console.log('Missing fields:', missingFields);

    if (missingFields.length > 0) {
      Alert.alert(
        'Incomplete Mapping',
        `Please map all required fields before proceeding. Missing: ${missingFields.join(
          ', ',
        )}`,
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Append the file to form data
      formData.append('excelFile', {
        uri:
          Platform.OS === 'ios'
            ? selectedFileData.uri.replace('file://', '')
            : selectedFileData.uri,
        type: selectedFileData.type || 'application/vnd.ms-excel',
        name: selectedFileData.name || 'inventory.xlsx',
      } as any);

      formData.append(
        'columnMappings',
        JSON.stringify({
          baleNumberField: mapping.baleNumberField,
          dateField: mapping.dateField,
          categoryField: mapping.categoryField,
          lotNumberField: mapping.lotNumberField,
          stockAmountField: mapping.stockAmountField,
          designCodeField: mapping.designCodeField,
        }),
      );

      console.log(
        'Sending request to:',
        `${NODE_API_ENDPOINT}/companies/${activeFirm?._id}/map-inventory`,
      );
      console.log('With form data:', JSON.stringify(formData));

      // Send mapping configuration to the server
      const response = await fetch(
        `${NODE_API_ENDPOINT}/companies/${activeFirm?._id}/map-inventory`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentUser?.token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapping failed:', errorText);
        throw new Error('Failed to process inventory mapping');
      }

      const result = await response.json();
      console.log('Mapping successful:', result);

      // Navigate to inventory product list on success
      navigation.replace('InventoryProductList', {
        companyId: activeFirm?._id || '',
      });
      dispatch(setSelectedFileData(null));
    } catch (error) {
      console.error('Error processing mapping:', error);
      Alert.alert(
        'Mapping Failed',
        error.message ||
          'Failed to process inventory mapping. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Title */}
        <Text className="text-center text-lg font-semibold text-black mb-1">
          Uploaded Inventory Mapping
        </Text>
        <Text className="text-center text-xs text-[#292C33] mb-6">
          Please Map The Inventory Document to The Below Listed Items
        </Text>

        {/* Mapping Fields */}
        {[
          {label: 'Bale Number', key: 'baleNumberField'},
          {label: 'Date', key: 'dateField'},
          {label: 'Category', key: 'categoryField'},
          {label: 'Lot Number', key: 'lotNumberField'},
          {label: 'Stock Amount', key: 'stockAmountField'},
          {label: 'Design Code', key: 'designCodeField'},
        ].map(field => (
          <View
            key={field.key}
            className="flex-row items-center border border-[#D6872A] rounded-md mb-2 overflow-hidden">
            <View className="bg-[#D6872A] px-2 py-3 rounded-l-md w-[45%]">
              <Text className="text-white font-medium text-sm">
                {field.label}
              </Text>
            </View>
            <View className="flex-1">
              <Dropdown
                style={{
                  height: 38,
                  backgroundColor: 'white',
                  borderTopRightRadius: 6,
                  borderBottomRightRadius: 6,
                  margin: 0,
                  padding: 0,
                }}
                containerStyle={{
                  backgroundColor: '#FAD9B3',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#D6872A',
                  margin: 0,
                  padding: 0,
                }}
                itemContainerStyle={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#D6872A',
                  padding: 0,
                }}
                placeholderStyle={{
                  color: '#888',
                  fontSize: 14,
                  marginLeft: 12,
                }}
                selectedTextStyle={{
                  color: '#000',
                  fontSize: 14,
                  fontWeight: '500',
                  marginLeft: 12,
                }}
                inputSearchStyle={{
                  height: 38,
                  borderColor: '#D6872A',
                  borderWidth: 1,
                  borderRadius: 6,
                }}
                iconStyle={{
                  width: 20,
                  height: 20,
                  marginRight: 12,
                }}
                itemTextStyle={{
                  color: '#000',
                  fontSize: 14,
                  padding: 0,
                }}
                activeColor="#F1D3A7"
                data={dropdownData}
                search={dropdownData.length > 10}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Column"
                searchPlaceholder="Search..."
                value={mapping[field.key]}
                onChange={item => {
                  setMapping(prev => ({
                    ...prev,
                    [field.key]: item.value,
                  }));
                }}
                renderRightIcon={() => (
                  <Icon
                    name="chevron-down"
                    size={18}
                    color="#D6872A"
                    style={{marginRight: 12}}
                  />
                )}
                renderItem={(item, selected) => (
                  <View
                    style={{
                      padding: 12,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: selected ? '#F1D3A7' : 'transparent',
                    }}>
                    <Text
                      style={{
                        color: selected ? '#D6872A' : '#000',
                        fontWeight: selected ? 'bold' : 'normal',
                        fontSize: 14,
                      }}>
                      {item.label}
                    </Text>
                    {selected && (
                      <Icon name="check" size={16} color="#D6872A" />
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        ))}

        {/* Note */}
      </ScrollView>
      <Text className="text-[10px] text-[#292C33] mt-2 mb-6 text-center">
        <Text className="font-semibold">Please Note: </Text>
        Images of Each Product Needs to be manually uploaded in Inventory
        Section after Mapping
      </Text>

      {/* Start Mapping Button */}
      <TouchableOpacity
        className="bg-[#DB9245] py-3 rounded-lg items-center mb-10"
        onPress={handleStartMapping}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text className="text-white font-semibold">Start Mapping</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default InventoryMappingScreen;
