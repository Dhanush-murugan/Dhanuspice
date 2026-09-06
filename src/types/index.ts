export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  photoURL?: string;
  addresses: Address[];
  savedRestaurants: string[];
  createdAt: Date;
}

export interface Address {
  id: string;
  label: string; // Home, Work, Others
  fullAddress: string;
  landmark?: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  banner: string;
  rating: number;
  reviews: number;
  deliveryTime: number; // minutes
  deliveryCharge: number;
  minOrderAmount: number;
  cuisines: string[];
  isOpen: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
  description: string;
}

export interface Food {
  id: string;
  restaurantId: string;
  name: string;
  image: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
  foodType?: string;
  rating: number;
  reviews: number;
  vegetarian: boolean;
  spicy: boolean;
  bestseller: boolean;
  featuredOnHome?: boolean;
}

export interface CartItem {
  id: string;
  foodId: string;
  restaurantId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryAddress: Address;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  estimatedDeliveryTime: number; // minutes
  actualDeliveryTime?: number;
  riderId?: string;
  riderLocation?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethod =
  | "cash"
  | "upi"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "wallet";
export type PaymentStatus = "pending" | "completed" | "failed";
export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "near_you"
  | "delivered"
  | "cancelled";

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  maxDiscount: number;
  minOrderAmount: number;
  expiryDate: Date;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

export interface Review {
  id: string;
  restaurantId?: string;
  foodId?: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
