import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Item {
  id: string;
  itemName: string;
  quantity: number;
  rate: number;
}

interface Payment {
  amount: number;
  paymentMethod: string; // Changed from modeOfPayment
  paymentReference?: string; // Optional, as per API
  paymentDate?: string; // Optional, as per API
  notes?: string; // Optional, as per API
}

interface PaymentDetails {
  totalAmount: number; // Changed to number for consistency
  dueAmount: number; // Changed to number for consistency
  payments: Payment[];
}

interface FirmDetails {
  firmName: string;
  firmAddress: string;
  firmGstNumber: string | undefined;
}

interface FirmDetailsWithPhone extends FirmDetails {
  mobileNumber: number;
}

interface BillingDetails {
  billingDate: string;
  billingDueDate: string;
}

interface CustomInvoiceState {
  orderId: string | null;
  invoiceNumber: string | null;
  billingFrom: FirmDetails | null;
  billingTo: FirmDetailsWithPhone | null;
  billingDetails: BillingDetails | null;
  items: Item[];
  discountPercentage: number;
  discountAmount: number;
  discountMode: 'percent' | 'rupees';
  gstPercentage: number;
  paymentDetails: PaymentDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomInvoiceState = {
  orderId: null,
  invoiceNumber: null,
  billingFrom: null,
  billingTo: null,
  billingDetails: null,
  items: [],
  discountPercentage: 0,
  discountAmount: 0,
  discountMode: 'percent',
  gstPercentage: 0,
  paymentDetails: { totalAmount: 0, dueAmount: 0, payments: [] },
  loading: false,
  error: null,
};

const customInvoiceSlice = createSlice({
  name: 'customInvoice',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<Item[]>) {
      state.items = action.payload;
    },
    setOrderId(state, action: PayloadAction<string | null>) {
      state.orderId = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setDiscountPercentage(state, action: PayloadAction<number>) {
      state.discountPercentage = action.payload;
    },
    setDiscountAmount(state, action: PayloadAction<number>) {
      state.discountAmount = action.payload;
    },
    setDiscountMode(state, action: PayloadAction<'percent' | 'rupees'>) {
      state.discountMode = action.payload;
    },
    setGstPercentage(state, action: PayloadAction<number>) {
      state.gstPercentage = action.payload;
    },
    setPaymentDetails(state, action: PayloadAction<PaymentDetails | null>) {
      state.paymentDetails = action.payload || { totalAmount: 0, dueAmount: 0, payments: [] };
    },
    setBillingFrom(state, action: PayloadAction<FirmDetails | null>) {
      state.billingFrom = action.payload;
    },
    setBillingTo(state, action: PayloadAction<FirmDetailsWithPhone | null>) {
      state.billingTo = action.payload;
    },
    setBillingDetails(state, action: PayloadAction<BillingDetails | null>) {
      state.billingDetails = action.payload;
    },
    setInvoiceNumber(state, action: PayloadAction<string | null>) {
      state.invoiceNumber = action.payload;
    },
    resetInvoice(state) {
      state.orderId = null;
      state.invoiceNumber = null;
      state.billingFrom = null;
      state.billingTo = null;
      state.billingDetails = null;
      state.items = [];
      state.discountPercentage = 0;
      state.discountAmount = 0;
      state.discountMode = 'percent';
      state.gstPercentage = 0;
      state.paymentDetails = { totalAmount: 0, dueAmount: 0, payments: [] };
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setItems,
  setOrderId,
  setLoading,
  setError,
  setDiscountPercentage,
  setDiscountAmount,
  setDiscountMode,
  setGstPercentage,
  setPaymentDetails,
  setBillingFrom,
  setBillingTo,
  setBillingDetails,
  setInvoiceNumber,
  resetInvoice,
} = customInvoiceSlice.actions;

export default customInvoiceSlice.reducer;