import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const options = [
  {icon: 'image-plus', label: 'Generate'},
  {icon: 'image-edit', label: 'Edit'},
  {icon: 'palette', label: 'Colourify'},
  {icon: 'grid', label: 'Tile To Grid'},
];

type TextileImageGeneratorProps = NativeStackScreenProps<
  HomeStackParamList,
  'TextileImageGenerator'
>;

const TextileImageGenerator = ({navigation}: TextileImageGeneratorProps) => {
  const [selected, setSelected] = useState('');
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAD8B0]">
    <View className="flex-1 bg-[#f8dfc5] relative">
      {/* Background image (not full screen) */}
      <Image
        source={require('../assets/background.png')} // Update to your actual path
        resizeMode="cover"
        className="h-[75%] w-full"
      />

      {/* Header icons (top-left & top-right) */}
      <SafeAreaView className="absolute top-10 left-0 right-0 px-4 flex-row justify-between items-center z-10">
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('Home')}>
          <Icon name="exit-to-app" size={24} color="#DB9245" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/20 p-2 rounded-full"
          onPress={() => navigation.navigate('Wallet')}>
          <Icon name="wallet" size={24} color="#DB9245" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Title text over background */}
      <View className="absolute bottom-[45%] left-0 right-0 px-4">
        <Text className="text-white text-2xl font-extrabold mb-1 text-center">
          TEXTILE IMAGE GENERATION
        </Text>
        <Text className="text-white text-base text-center">
          Generate Textile Design On The Go
        </Text>
      </View>

      {/* Content card */}
      <View className="absolute bottom-24 w-full px-6">
        <View className="bg-[#DB9245] p-5 rounded-2xl shadow-lg">
          <Text className="text-center font-semibold text-[#FBDBB5] text-base mb-8">
            Bring Your Idea To Life
          </Text>

          {/* Feature icons */}
          <View className="flex-row justify-between mb-8">
            {options.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {setSelected(item.label);
                  if(item.label=='Generate'){
                  navigation.navigate('GenerateImageScreen')}
                  if(item.label=='Edit'){
                    navigation.navigate('EditImageScreen', {imageUrl: null})}
                    if(item.label=='Tile To Grid'){
                      navigation.navigate('PatternToGridScreen', {
                        imageUrl: null})}
                      if(item.label==='Colourify'){
                        ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
                      }}
                }
                className={`items-center flex-1 py-3 px-1 mx-1 ${
                  selected === item.label && 'bg-[#FBDBB5] rounded-md'
                } `}>
                <Icon
                  name={item.icon}
                  size={28}
                  color={selected === item.label ? 'black' : '#FBDBB5'}
                />
                <Text
                  className={`text-xs mt-1 text-center text-[#FBDBB5] ${
                    selected === item.label && 'text-black'
                  }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Button */}
          {/* <TouchableOpacity
            className="bg-[#292C33] py-5 rounded-xl"
            onPress={() => {
              if (selected === 'Generate') {
                navigation.navigate('GenerateImageScreen');
              } else if (selected === 'Edit') {
                navigation.navigate('EditImageScreen', {imageUrl: null});
              } else if (selected === 'Colourify') {
                ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
                return;
                // navigation.navigate('ImagePaletteScreen', {imageUrl: null});
              } else if (selected === 'Tile To Grid') {
                // ToastAndroid.show('Feature Coming Soon', ToastAndroid.SHORT);
                // return;
                navigation.navigate('PatternToGridScreen', {
                  imageUrl: null,
                });
              }
            }}>
            <Text className="text-white text-center font-bold text-base">
              Start Image Generation
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
};

export default TextileImageGenerator;
