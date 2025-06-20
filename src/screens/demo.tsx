{/* <SafeAreaView className="flex-1 bg-[#FAD8B0]">
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  className="flex-1 bg-[#FAD8B0]">



<View className="bg-[#DB9245] rounded-xl p-4 mt-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-white">
            {currentUser?.type === 'manager' ? 'Admin' : 'User'} Details
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditAccountDetails', {
                userDetails: adminDetails,
              })
            }>
            <Feather name="edit-2" size={16} color="white" />
          </TouchableOpacity>
        </View>
        {userDetailsArray.map((item, idx) => (
          <View
            key={idx}
            style={{backgroundColor: '#FBDBB5'}}
            className=" rounded-lg px-3 py-2 mb-2 flex-row justify-between items-center">
            <Text className="text-xs font-medium text-black">
              {item.label} :
            </Text>
            <Text className="text-sm  text-black">{item.value}</Text>
          </View>
        ))}
      </View> */}