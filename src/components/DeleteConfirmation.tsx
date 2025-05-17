// /* eslint-disable react-native/no-inline-styles */
// import React from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableWithoutFeedback,
//   TouchableOpacity,
// } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// interface PermissionDeniedDialogProps {
//   visible: boolean;
//   onClose: () => void;
// }

// const DeleteConfirmation: React.FC<PermissionDeniedDialogProps> = ({
//   visible,
//   onClose,
// }) => (
//   <Modal
//     visible={visible}
//     transparent
//     animationType="fade"
//     onRequestClose={onClose}>
//     {/* Dismiss on outside tap */}
//     <TouchableWithoutFeedback onPress={onClose}>
//       <View className="flex-1 justify-center items-center bg-black/10 px-6">
//         {/* Dialog container */}
//         <View
//           className="w-full max-w-[360px] bg-[#292C33] px-6 py-5 pb-12 items-center"
//           style={{borderRadius: 12, overflow: 'hidden'}}>
//           <Ionicons name="alert-circle" size={40} color="#CA6800" />
//           <Text className="text-white text-xl font-bold mt-4">
//             Are You Sure To Delete Firm ?{' '}
//           </Text>
//           <View>
//             <TouchableOpacity>
//               <Text>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <Text>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
//   </Modal>
// );

// export default DeleteConfirmation;

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface DeleteConfirmationProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  type: String;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  visible,
  type,
  onClose,
  onDelete,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="flex-1 justify-center items-center bg-black/40 px-6">
        <TouchableWithoutFeedback>
          <View className="w-full max-w-[340px] bg-[#1F1F1F] rounded-xl p-6 items-center">
            {/* Alert Icon */}
            <Ionicons name="alert-circle" size={42} color="#D6872A" />

            {/* Text */}
            <Text className="text-[#FBD7A2] text-lg font-semibold mt-4 text-center">
              Are You Sure To Delete {type} ?
            </Text>

            {/* Buttons */}
            <View className="flex-row mt-6 space-x-4 gap-5">
              <TouchableOpacity
                onPress={onClose}
                className="border border-[#D6872A] px-6 py-2 rounded-md">
                <Text className="text-[#FBD7A2] font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDelete}
                className="bg-[#D6872A] px-6 py-2 rounded-md">
                <Text className="text-black font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export default DeleteConfirmation;
