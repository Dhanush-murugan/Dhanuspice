// Application constants

export const APP_NAME = "Dhanuspice";
export const APP_DESCRIPTION = "Luxury & Gourmet Food Delivery";
export const APP_LOGO = "/brand/logo.png";
export const APP_LOGO_MARK = "/brand/logo-mark.png";
export const APP_TAGLINE = "Royal Gourmet Dining";

// Colors
export const COLORS = {
  primary: "#ff9f00",
  secondary: "#ff8c00",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
};

// Order Status
export const ORDER_STATUS = {
  PLACED: "placed",
  ACCEPTED: "accepted",
  PREPARING: "preparing",
  READY: "ready",
  OUT_FOR_DELIVERY: "out_for_delivery",
  NEAR_YOU: "near_you",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PLACED]: "Order Placed",
  [ORDER_STATUS.ACCEPTED]: "Restaurant Accepted",
  [ORDER_STATUS.PREPARING]: "Preparing Food",
  [ORDER_STATUS.READY]: "Ready for Pickup",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.NEAR_YOU]: "Near You",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  UPI: "upi",
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  NET_BANKING: "net_banking",
  WALLET: "wallet",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PAYMENT_METHODS.CASH]: "Cash on Delivery",
  [PAYMENT_METHODS.UPI]: "UPI",
  [PAYMENT_METHODS.CREDIT_CARD]: "Credit Card",
  [PAYMENT_METHODS.DEBIT_CARD]: "Debit Card",
  [PAYMENT_METHODS.NET_BANKING]: "Net Banking",
  [PAYMENT_METHODS.WALLET]: "Wallet",
};

// Delivery Charges
export const DELIVERY_CHARGES = {
  STANDARD: 40,
  EXPRESS: 60,
  SCHEDULED: 30,
} as const;

// GST Rate
export const GST_RATE = 5; // 5%

// Minimum Order Amount
export const MIN_ORDER_AMOUNT = 100;

// Delivery Time Ranges (in minutes)
export const DELIVERY_TIME = {
  FAST: { min: 15, max: 25 },
  NORMAL: { min: 25, max: 40 },
  SCHEDULED: { min: 30, max: 60 },
} as const;

// Address Types
export const ADDRESS_TYPES = ["Home", "Work", "Other"] as const;

// Food Categories
export const FOOD_CATEGORIES = [
  "Biryani",
  "Pizza",
  "Burgers",
  "Dosa",
  "Cakes",
  "Drinks",
  "Desserts",
  "Chinese",
  "Italian",
  "Indian",
  "Continental",
  "South Indian",
] as const;

// Cuisines
export const CUISINES = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Continental",
  "Street Food",
  "Fast Food",
  "Biryani",
  "Mughlai",
  "Hyderabadi",
] as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  EMAIL_INVALID: "Please enter a valid email address",
  PHONE_INVALID: "Please enter a valid 10-digit phone number",
  PINCODE_INVALID: "Please enter a valid 6-digit pincode",
  PASSWORD_SHORT: "Password must be at least 6 characters",
  PASSWORD_MISMATCH: "Passwords do not match",
  FIELD_REQUIRED: "This field is required",
  ADDRESS_REQUIRED: "Please enter your delivery address",
  PHONE_REQUIRED: "Please enter your phone number",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/signup",
    LOGOUT: "/api/auth/logout",
  },
  ORDERS: {
    CREATE: "/api/orders",
    GET: (id: string) => `/api/orders/${id}`,
    LIST: "/api/orders",
    SEND_EMAIL: "/api/send-order-email",
  },
  PAYMENT: {
    CREATE_RAZORPAY_ORDER: "/api/create-razorpay-order",
    VERIFY_PAYMENT: "/api/verify-razorpay-payment",
  },
  RESTAURANTS: {
    LIST: "/api/restaurants",
    GET: (id: string) => `/api/restaurants/${id}`,
  },
  FOODS: {
    LIST: "/api/foods",
    GET: (id: string) => `/api/foods/${id}`,
  },
} as const;

// Pages
export const PAGES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  PROFILE: "/profile",
  ADMIN: "/admin",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_RESTAURANTS: "/admin/restaurants",
} as const;

// Feature Flags
export const FEATURES = {
  PAYMENT_ENABLED: true,
  LIVE_TRACKING_ENABLED: true,
  REVIEWS_ENABLED: true,
  WISHLIST_ENABLED: false,
  REFERRAL_ENABLED: false,
  MULTI_LANGUAGE_ENABLED: false,
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  ADD_TO_CART_SUCCESS: "Added to cart!",
  REMOVE_FROM_CART_SUCCESS: "Removed from cart",
  ORDER_PLACED_SUCCESS: "Order placed successfully!",
  LOGIN_SUCCESS: "Logged in successfully!",
  LOGOUT_SUCCESS: "Logged out successfully!",
  SIGNUP_SUCCESS: "Account created successfully!",
  ERROR_GENERIC: "Something went wrong. Please try again.",
} as const;
