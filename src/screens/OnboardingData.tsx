import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {HomeStackParamList} from '../stacks/Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const {width} = Dimensions.get('window');

type OnboardingProps = NativeStackScreenProps<HomeStackParamList, 'Onboarding'>;

const onboardingData = [
  {
    id: '1',
    image: require('../assets/onBoard1.png'),
    title: 'Smart Inventory\nZero Waste',
    description:
      'Track your stock in real-time and eliminate manual errors with AI-driven precision',
  },
  {
    id: '2',
    image: require('../assets/onBoard2.png'),
    title: 'Automate What\nSlows You Down',
    description:
      'From order tracking to restocking alerts — streamline textile operations effortlessly',
  },
  {
    id: '3',
    image: require('../assets/onBoard3.png'),
    title: 'Insights That Work\nAs Hard as You Do',
    description:
      'Get actionable analytics to reduce costs, boost output, and grow your textile business',
  },
];

const OnboardingScreen = ({navigation}: OnboardingProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({index: currentIndex + 1});
    } else {
      // Navigate to the login screen when the last item is reached
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    // Handle skip navigation here
    navigation.replace('Login');
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View className="flex-1 bg-[#F5D3AC]">
      <FlatList
        data={onboardingData}
        ref={flatListRef}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({item}) => (
          <View className="w-screen h-full items-center justify-center pb-48">
            <Image
              source={item.image}
              className="w-52 h-52 mb-4"
              resizeMode="contain"
            />

            {/* Bottom Section absolutely positioned */}
            <View className="absolute bottom-0 left-0 right-0 bg-[#222] rounded-t-3xl px-6 pt-8 pb-10 items-start">
              <View className="flex-row mb-4 gap-2">
                <Image
                  source={require('../assets/logo.png')}
                  className="w-20 h-20 "
                  resizeMode="contain"
                />
                <Text className="text-[#DB9245] font-semibold text-xl leading-5 mb-3 mt-5">
                  {item.title}
                </Text>
              </View>
              <Text className="text-white text-base opacity-80 mb-20">
                {item.description}
              </Text>

              {/* Indicator Dots */}
              <View className=" w-full">
                <View className="flex-row space-x-2 gap-5 mb-6 mx-auto">
                  {onboardingData.map((_, i) => (
                    <View
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${
                        i === currentIndex ? 'bg-[#F5D3AC]' : 'bg-gray-500'
                      }`}
                    />
                  ))}
                </View>
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between w-full px-4">
                <TouchableOpacity
                  onPress={handleSkip}
                  className="border border-[#F5D3AC] px-6 py-2 rounded-lg">
                  <Text className="text-white text-sm">Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleNext}
                  className="bg-[#F5D3AC] px-6 py-2 rounded-lg">
                  <Text className="text-black font-semibold text-sm">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default OnboardingScreen;
