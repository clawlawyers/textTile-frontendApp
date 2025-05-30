import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Define the Auth state interface.
interface AuthState {
  createImagePayload: any;
  error?: string;
  // Optional: you can store additional properties from your API
  props?: any;
}

// Set the initial state.
const initialState: AuthState = {
  createImagePayload: null,
};

const authSlice = createSlice({
  name: 'imageGenSlice',
  initialState,
  reducers: {
    setCreateImagePayload: (state, action: PayloadAction<any>) => {
      state.createImagePayload = action.payload;
    },
    // Login reducer: sets user and saves auth info to AsyncStorage.
  },
});

export const {setCreateImagePayload} = authSlice.actions;
export default authSlice.reducer;
