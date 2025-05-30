import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {company} from './authSlice';

// Define the Auth state interface.
interface AuthState {
  activeFirm: company | null;
  selectedFileData: any | null;
  inventoryName: string | null;
  currentClient: any | null;
  paymentDetails: any | null;
  error?: string;
  // Optional: you can store additional properties from your API
  props?: any;
}

// Set the initial state.
const initialState: AuthState = {
  activeFirm: null,
  selectedFileData: null,
  inventoryName: null,
  currentClient: null,
  paymentDetails: null,
};

const authSlice = createSlice({
  name: 'commonSlice',
  initialState,
  reducers: {
    // Login reducer: sets user and saves auth info to AsyncStorage.
    setActiveFirm: (state, action: PayloadAction<company>) => {
      state.activeFirm = action.payload;
      console.log(action.payload);
    },
    setSelectedFileData: (state, action: PayloadAction<any>) => {
      state.selectedFileData = action.payload;
    },
    setInventoryName: (state, action: PayloadAction<string>) => {
      state.inventoryName = action.payload;
    },
    setCurrentClient: (state, action: PayloadAction<any>) => {
      state.currentClient = action.payload;
    },
    setPaymentDetails: (state, action: PayloadAction<any>) => {
      state.paymentDetails = action.payload;
    },
  },
});

export const {
  setActiveFirm,
  setSelectedFileData,
  setInventoryName,
  setCurrentClient,
  setPaymentDetails,
} = authSlice.actions;
export default authSlice.reducer;
