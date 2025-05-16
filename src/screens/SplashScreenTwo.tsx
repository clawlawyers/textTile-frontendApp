// import React from 'react';
// import {View, Image, Text} from 'react-native';

// const SplashScreenTwo = () => {
//   return (
//     <View className="flex-1 items-center justify-between bg-[#F5D3AC] pt-32 pb-6">
//       <View className="items-center ">
//         <Image
//           source={require('../assets/logo.png')} // Adjust path as needed
//           className="w-32 h-32 mb-4"
//           resizeMode="contain"
//         />
//         <Text className="text-base font-semibold text-black tracking-widest">
//           INVENTORY AUTOMATION
//         </Text>
//       </View>

//       <View className="w-full items-center">
//         <View className="w-[90%] h-px bg-black mb-2" />
//         <Text className="text-xs text-black">
//           Powered By <Text className="font-bold italic">Claw Legal Tech</Text>
//         </Text>
//       </View>
//     </View>
//   );
// };

// export default SplashScreenTwo;

import React from 'react';
import {View, Image, Text} from 'react-native';

const SplashScreenTwo = () => {
  return (
    <View className="flex-1 bg-[#F5D3AC]">
      {/* Centered Logo + Title */}
      <View className="flex-1 justify-center items-center ">
        <Image
          source={require('../assets/logo.png')} // Update path as needed
          className="w-60 h-60 mb-4"
          resizeMode="contain"
        />
        <Text className="text-base font-semibold text-black tracking-widest">
          INVENTORY AUTOMATION
        </Text>
      </View>

      {/* Bottom Footer */}
      <View className="items-center mb-6">
        <View className="w-[90%] h-px bg-black mb-2" />
        <Text className="text-xs text-black">
          Powered By <Text className="font-bold italic">Claw Legal Tech</Text>
        </Text>
      </View>
    </View>
  );
};

export default SplashScreenTwo;
