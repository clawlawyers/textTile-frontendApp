import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import commonReducer from './commonSlice';
import imageGenReducer from './imgeGenSlice';
import customInvoiceReducer from './customInvoiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    common: commonReducer,
    imageGen: imageGenReducer,
    customInvoice: customInvoiceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;