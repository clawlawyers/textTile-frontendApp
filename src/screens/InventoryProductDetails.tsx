import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, Image, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../stacks/Home';
import {NODE_API_ENDPOINT} from '../utils/util';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import DeleteConfirmation from '../components/DeleteConfirmation';

type AddNewUserProps = NativeStackScreenProps<
  HomeStackParamList,
  'InventoryProductDetails'
>;

const InventoryProductDetails = ({navigation, route}: AddNewUserProps) => {
  const [prodDetails, setProdDetails] = React.useState({
    category: '',
    title: '',
    designCode: '',
    stock: '',
    image: '',
  });

  const activeFirm = useSelector((state: RootState) => state.common.activeFirm);

  console.log(prodDetails);

  const currentInventoryName = useSelector(
    (state: RootState) => state.common.inventoryName,
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setProdDetails(route.params.productDetails);
  }, [route.params.productDetails]);

  const [showPermissionDialog, setShowPermissionDialog] = React.useState(false);

  const handleDeleteProduct = async () => {
    setShowPermissionDialog(false);
    console.log(activeFirm);
    const deleteProduct = await fetch(
      `${NODE_API_ENDPOINT}/inventory/${activeFirm?.inventory}/products/${prodDetails._id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
      },
    );
    console.log(deleteProduct);

    if (!deleteProduct.ok) {
      const errorText = await deleteProduct.text();
      console.log(errorText);
      throw new Error(
        `Failed to delete product: ${deleteProduct.status} ${errorText}`,
      );
    }
    setShowPermissionDialog(false);
    const data = await deleteProduct.json();
    console.log(data);

    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-[#FAD9B3] pt-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#FAD9B3" />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="arrow-left" size={20} color="#292C33" />
        </TouchableOpacity>

        <View>
          <Text className="text-xs text-[#292C33] text-right">
            Inventory For
          </Text>
          <Text className="text-sm font-semibold text-black text-right">
            {currentInventoryName}
          </Text>
        </View>
      </View>

      {/* Product Image */}
      <View className="items-center mb-4">
        {prodDetails.image ? (
          <Image
            source={{uri: prodDetails.image}}
            className="w-full h-52 bg-white"
            resizeMode="stretch"
          />
        ) : (
          <Image
            source={require('../assets/t-shirt.png')}
            className="w-full h-52 bg-white"
            resizeMode="stretch"
          />
        )}
      </View>

      {/* Action Icons */}
      <View className="flex-row justify-end gap-4 mb-4">
        {/* <TouchableOpacity className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center">
          <Icon name="alert-triangle" size={20} color="#292C33" />
        </TouchableOpacity> */}
        <TouchableOpacity
          className="w-10 h-10 rounded-full border border-[#292C33] justify-center items-center"
          onPress={() => setShowPermissionDialog(true)}>
          <Icon name="trash-2" size={20} color="#292C33" />
        </TouchableOpacity>
      </View>

      <DeleteConfirmation
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        type="Product"
        onDelete={handleDeleteProduct}
      />

      {/* Product Info */}
      <View className=" mb-2 text-black flex-row flex">
        <Text className="text-base font-bold">Item Name:{'  '}</Text>
        <Text className="text-base mb-2 text-black">
          {prodDetails.category_code}
        </Text>
      </View>

      <View className="space-y-1 mb-6">
        <View className="text-sm text-black flex flex-row">
          <Text className="">Full Bale No : </Text>
          {'     '}
          <Text className="font-bold">{prodDetails.bail_number}</Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Entry Date : </Text>
          {'     '}
          <Text className="font-bold">
            {'   '}
            {new Date(prodDetails.bail_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Design No : {'   '}</Text>

          <Text className="font-bold"> {prodDetails.design_code}</Text>
        </View>
        <View className="text-sm text-black flex flex-row">
          <Text className="">Lote No : </Text>
          {'     '}
          <Text className="font-bold">{prodDetails.lot_number}</Text>
        </View>
      </View>

      <View className="flex  gap-2 mt-auto">
        <View className="flex-row items-center justify-end mt-auto mb-0">
          <View className="flex-row items-center gap-2">
            <Icon name="download" size={14} color="#292C33" />
            <Text className="text-xs text-[#292C33]">
              Download Product Details
            </Text>
          </View>
        </View>

        <View className=" flex border flex-row justify-center rounded-md py-2 mt-auto">
          <Text className="text-base text-black mb-1">
            Available Stock ( Bail Quantity ) :
          </Text>
          <Text className="text-sm text-black">{prodDetails.stock_amount}</Text>
        </View>

        {/* Footer Buttons */}
        <View className="flex-row justify-between gap-4 mt-auto mb-10">
          <TouchableOpacity
            className="flex-1 border border-[#292C33] py-3 rounded-lg items-center"
            onPress={() =>
              navigation.navigate('StockManagement', {
                productDetails: prodDetails,
              })
            }>
            <Text className="text-black font-semibold">Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#DB9245] py-3 rounded-lg items-center"
            onPress={() => {
              navigation.navigate('EditInventoryProduct', {
                productDetails: prodDetails,
              });
            }}>
            <Text className="text-white font-semibold">Edit Product</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default InventoryProductDetails;
