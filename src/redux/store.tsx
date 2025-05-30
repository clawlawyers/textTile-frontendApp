import {configureStore} from '@reduxjs/toolkit';
import authReducer from './authSlice';
import commonReducer from './commonSlice';
import imageGenReducer from './imgeGenSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    imageGen: imageGenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
