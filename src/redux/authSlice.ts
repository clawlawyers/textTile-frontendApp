import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NODE_API_ENDPOINT} from '../utils/util';

// Define a User interface. Adjust the fields as necessary.
interface User {
  userId: string;
  token: string;
  name: string;
  email: string;
  type: string;
  companies: string[];
  // add other fields as needed
}

// Define the Auth state interface.
interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  // Optional: you can store additional properties from your API
  props?: any;
}

// Set the initial state.
const initialState: AuthState = {
  user: null,
  status: 'loading',
};

// Create an async thunk for retrieving auth information.
export const retrieveAuth = createAsyncThunk<
  {user: User; props?: any} | null, // Returned type when fulfilled
  void, // No argument needed when dispatching
  {rejectValue: string}
>('auth/retrieveAuth', async (_, {rejectWithValue}) => {
  try {
    console.log('thunk is calling');
    // Retrieve stored auth data from AsyncStorage.
    const storedAuth = await AsyncStorage.getItem('clawInverntory_auth_user');
    console.log(storedAuth);
    if (storedAuth) {
      const parsedUser: User = JSON.parse(storedAuth);
      // Call your backend endpoint to validate or fetch additional user properties.
      const response = await fetch(`${NODE_API_ENDPOINT}/auth/getVerify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${parsedUser.token}`,
        },
      });
      if (!response.ok) {
        return rejectWithValue('Failed to fetch user data');
      }
      const parsedProps = await response.json();
      return {user: parsedUser, props: parsedProps};
    } else {
      return null;
    }
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error retrieving authentication');
  }
});

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    // Login reducer: sets user and saves auth info to AsyncStorage.
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      console.log(action.payload);
      // Save the user data as a JSON string.
      AsyncStorage.setItem(
        'clawInverntory_auth_user',
        JSON.stringify(action.payload),
      );
    },
    // Logout reducer: clears user data and removes auth from AsyncStorage.
    logout: state => {
      state.user = null;
      AsyncStorage.removeItem('clawInverntory_auth_user');
      console.log('User Logged Out');
    },
  },
  extraReducers: builder => {
    builder.addCase(retrieveAuth.pending, state => {
      state.status = 'loading';
    });
    builder.addCase(retrieveAuth.fulfilled, (state, action) => {
      if (action.payload && action.payload.user) {
        state.props = action.payload.props;
        state.user = action.payload.user;
      }
      state.status = 'succeeded';
    });
    builder.addCase(retrieveAuth.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload
        ? action.payload
        : 'Authentication retrieval failed';
    });
  },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;
