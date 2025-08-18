export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'shoes' | 'apparel';
  subcategory: string[];
  image: string;
  images: string[];
  description: string;
  isNewArrival: boolean;
  isSale: boolean;
  sizes: string[];
  colors: string[];
  brand: string;
  sku: string;
  availability: 'in-stock' | 'out-of-stock' | 'limited';
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface SessionData {
  user_id: string;
  email: string;
  name: string;
  expires: number;
}

export interface CheckoutData {
  email: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  payment: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
  };
}