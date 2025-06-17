// ================== Type Definitions ==================
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import AdminDetailsScreen, {adminInfo} from '../screens/AdminDetailsScreen';
import FirmsScreen from '../screens/FirmsScreen';
import FirmDetailsScreen from '../screens/FirmDetailsScreen';
import UsersScreen from '../screens/UsersScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import EditAccountDetails from '../screens/EditAccountDetails';
import InventoryProductList from '../screens/InventoryProductList';
import AddNewFirmScreen from '../screens/AddNewFirmScreen';
import NotificationScreen from '../screens/NotificationScreen';
import UserPermissionScreen from '../screens/UserPermissionScreen';
import AddNewUserScreen from '../screens/AddNewUserScreen';
import LoginScreen from '../screens/LoginScreen';
import AddNewUserAdded from '../screens/NewUserAddedScreen';
import InsightScreen from '../Insights/InsightsEmpty';
import LeftoverstockDesignwiseScreen from '../Insights/LeftOverStockDesignwise';
import LeftoverstockproductwiseScreen from '../Insights/LeftOverStockProductwise';
import MonthlyAdvanceVsDuesProductwiseScreen from '../Insights/MonthlyAdvanceVsDuesProductwise';
import MonthlyDesignwiseOrdersScreen from '../Insights/MonthlyDesignwiseOrders';
import MonthlyOrderPlacementAnalyticsScreen from '../Insights/MonthlyOrderPlacementAnaytics';
import MonthlyProductwiseOrdersScreen from '../Insights/MonthlyProductwiseOrders';
import GenerateInvoiceScreen from '../screens/GenerateInvoiceScreen';
import PreviousInvoiceScreen from '../screens/PreviousInvoiceScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import InvoiceUpdated from '../screens/InvoiceUpdated';
import InvoiceItemsScreen from '../screens/InvoiceItemsScreen';
import InvoicePaymentScreen from '../screens/InvoicePaymentScreen';
import ActiveInvoiceScreen from '../screens/ActiveInvoiceScreen';
import ActiveInvoiceItems from '../screens/ActiveInvoiceItems'
import ActiveInvoicePaymentScreen from '../screens/ActiveInvoicePaymentScreen';
// import AccountScreen from '../screens/AccountScreen';
// import OrderScreen from '../screens/OrdersScreen';
// import OrderDetailsScreen from '../screens/OrderDetailsScreen';
// import PaymentMethods from '../screens/PaymentMethodsScreen';
// import ShippingAddress from '../screens/AddressScreen';
// import HomeScreen from '../screens/Home';

interface BillingDetails {
  billTo: string;
  firmName: string;
  address: string;
  firmGSTNumber: string;
  billingFromAddress: string;
  billingFromGSTIN: string;
  billingFrom: string;
  billToAddress: string;
  billToGSTIN: string;
  date: string;
  duedate: string;
}

interface PaymentDetails {
  totalAmount: string;
  dueAmount: string;
  payments: Array<{
    amount: number;
    modeOfPayment: string;
  }>;
}

// Params for Home Stack
export type AccountStackParamList = {
  Account: undefined; // No parameters expected
  FirmScreens: undefined; // No parameters expected
  FirmDetailsScreens: {firmDetails: {}};
  UserDetailsScreen: {userDetails: {}};
  UsersScreen: undefined;
  MyOrder: undefined;
  OrderDetails: {orderId: string};
  ShippingAddress: undefined;
  PaymentMethod: undefined;
  MyReviews: undefined;
  Setting: undefined;
  Home: undefined;
  EditAccountDetails: {userDetails: adminInfo};
  InventoryProductList: {companyId: string};
  AddNewFirmScreen: undefined;
  Notification: undefined;
  UserPermissions: {salesmanId: string};
  AddNewUser: undefined;
  LoginScreen: undefined;
  AddNewUserAdded: undefined;
  InsightsEmpty: undefined;
  LeftoverstockDesignwiseScreen: undefined;
  LeftoverstockproductwiseScreen: undefined;
  MonthlyAdvanceVsDuesProductwiseScreen: undefined;
  MonthlyDesignwiseOrdersScreen: undefined;
  MonthlyOrderPlacementAnalyticsScreen: undefined;
  MonthlyProductwiseOrdersScreen: undefined;
  GenerateInvoiceScreen:{ invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    paymentDetails?: any;
    paymentHistory?: any[];
    cartProducts?: Item[];
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
  };
  PreviousInvoiceScreen:{status:string;};
  InvoicesScreen:undefined;
  InvoiceItemsScreen: {
    invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    paymentDetails?: any;
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
    paymentHistory?: any[];
    cartProducts?: Item[];
  };
  InvoiceUpdated:{
    invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
    paymentDetails?: any;
    paymentHistory?: any[];
    cartProducts?: Item[];
  }
  TestInvoicesScreen:undefined;
  InvoicePaymentScreen: {
    invoiceStatus?: string;
    orderId?: string;
    testOrderId?: string;
    invoiceNumber?: string;
    billingDetails?: any;
    discountValue?: string;
    discountMode?: 'percent' | 'rupees';
    gstValue?: string;
    paymentDetails?: any;
    paymentHistory?: any[];
    cartProducts?: Item[];
  };
  ActiveInvoiceScreen: {
    invoice: {
      _id: string;
      billingFrom: { firmName: string; firmAddress: string; firmGstNumber: string };
      billingTo: { firmName: string; firmAddress: string; firmGstNumber: string };
      billingDetails: { billingDate: string; billingDueDate: string };
      dueAmount: number;
      totalAmount: number;
      items: Array<{ id: string; name: string; quantity: number; price: number }>;
      payments: Array<{ amount: number; date: string; mode: string }>;
      discountAmount: number;
      discountPercentage: number;
    };
    status:string;
  };
  ActiveInvoiceItems: {
    invoice: {
      _id: string;
      billingFrom: { firmName: string; firmAddress: string; firmGstNumber: string };
      billingTo: { firmName: string; firmAddress: string; firmGstNumber: string };
      billingDetails: { billingDate: string; billingDueDate: string };
      dueAmount: number;
      totalAmount: number;
      items: Array<{ id: string; name: string; quantity: number; price: number }>;
      payments: Array<{ amount: number; date: string; mode: string }>;
      discountAmount: number;
      discountPercentage: number;
    };
  }
  ActiveInvoicePaymentScreen: {
    invoice: Invoice;
    invoiceStatus: string;
    orderId: string;
    testOrderId: string;
    invoiceNumber: string;
    billingDetails: any;
    paymentDetails: { totalAmount: string; dueAmount: string; payments: any[] };
    paymentHistory: any[];
    cartProducts: Item[];
    discountValue: string;
    discountMode: 'percent' | 'rupees';
    gstValue: string;
  };
}

const AccountStack = createNativeStackNavigator<AccountStackParamList>();

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator initialRouteName="Account">
      <AccountStack.Screen
        name="Account"
        component={AdminDetailsScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="AddNewFirmScreen"
        component={AddNewFirmScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="InventoryProductList"
        component={InventoryProductList}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="AddNewUserAdded"
        component={AddNewUserAdded}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="FirmScreens"
        component={FirmsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="FirmDetailsScreens"
        component={FirmDetailsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="AddNewUser"
        component={AddNewUserScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="UserPermissions"
        component={UserPermissionScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="UserDetailsScreen"
        component={UserDetailsScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="EditAccountDetails"
        component={EditAccountDetails}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="InsightsEmpty"
        component={InsightScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="LeftoverstockDesignwiseScreen"
        component={LeftoverstockDesignwiseScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="LeftoverstockproductwiseScreen"
        component={LeftoverstockproductwiseScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="MonthlyAdvanceVsDuesProductwiseScreen"
        component={MonthlyAdvanceVsDuesProductwiseScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="MonthlyDesignwiseOrdersScreen"
        component={MonthlyDesignwiseOrdersScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="MonthlyOrderPlacementAnalyticsScreen"
        component={MonthlyOrderPlacementAnalyticsScreen}
        options={{headerShown: false}}
      />

      <AccountStack.Screen
        name="MonthlyProductwiseOrdersScreen"
        component={MonthlyProductwiseOrdersScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="ActiveInvoiceScreen"
        component={ActiveInvoiceScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="ActiveInvoiceItems"
        component={ActiveInvoiceItems}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="GenerateInvoiceScreen"
        component={GenerateInvoiceScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="PreviousInvoiceScreen"
        component={PreviousInvoiceScreen}
        options={{headerShown: false}}
      />
      <AccountStack.Screen
        name="InvoicesScreen"
        component={InvoicesScreen}
        options={{headerShown: false}}
      />
       <AccountStack.Screen
        name="InvoiceUpdated"
        component={InvoiceUpdated}
        options={{headerShown: false}}
      />
       <AccountStack.Screen
        name="InvoiceItemsScreen"
        component={InvoiceItemsScreen}
        options={{headerShown: false,
        }}
      />
      <AccountStack.Screen
        name="InvoicePaymentScreen"
        component={InvoicePaymentScreen}
        options={{headerShown: false,
        }}
      />
      <AccountStack.Screen
        name="ActiveInvoicePaymentScreen"
        component={ActiveInvoicePaymentScreen}
        options={{headerShown: false,
        }}
      />
    </AccountStack.Navigator>
  );
}

export default AccountStackNavigator;
