/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Modal, View, Text, TouchableWithoutFeedback} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PermissionDeniedDialogProps {
  visible: boolean;
  onClose: () => void;
}

const PermissionDeniedDialog: React.FC<PermissionDeniedDialogProps> = ({
  visible,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}>
    {/* Dismiss on outside tap */}
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="flex-1 justify-center items-center bg-black/10 px-6">
        {/* Dialog container */}
        <View
          className="w-full max-w-[360px] bg-[#292C33] px-6 py-5 pb-12 items-center"
          style={{borderRadius: 12, overflow: 'hidden'}}>
          <Ionicons name="alert-circle" size={40} color="#CA6800" />
          <Text className="text-white text-xl font-bold mt-4">
            Permission Denied
          </Text>
          <Text className="text-white text-center mt-3 text-sm leading-relaxed">
            Please contact your administrator to request an update to your
            access rights.
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export default PermissionDeniedDialog;
