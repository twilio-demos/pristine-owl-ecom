export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'men' | 'women' | 'shoes' | 'apparel';
  subcategory: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  sizes: string[];
  colors: string[];
  description: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  phone?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  shipping: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  payment: {
    method: string;
    cardLast4?: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

// Mock product data
export const products: Product[] = [
  // New Arrivals - Men's Shoes
  {
    id: 1,
    name: "Air Max Pro Runner",
    price: 159.99,
    originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    category: "shoes",
    subcategory: "Men's Running",
    isNewArrival: true,
    isFeatured: true,
    sizes: ["7", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
    colors: ["Black", "White", "Navy"],
    description: "Premium running shoes with advanced cushioning technology."
  },
  {
    id: 2,
    name: "Classic Leather Sneakers",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop",
    category: "shoes",
    subcategory: "Men's Casual",
    isNewArrival: true,
    isFeatured: false,
    sizes: ["7", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["White", "Black", "Brown"],
    description: "Timeless leather sneakers perfect for everyday wear."
  },
  
  // Women's Shoes
  {
    id: 3,
    name: "Elegant Heeled Boots",
    price: 189.99,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop",
    category: "shoes",
    subcategory: "Women's Boots",
    isNewArrival: true,
    isFeatured: true,
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"],
    colors: ["Black", "Brown", "Tan"],
    description: "Sophisticated boots with comfortable heels for professional wear."
  },
  {
    id: 4,
    name: "Women's Athletic Trainers",
    price: 119.99,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop",
    category: "shoes",
    subcategory: "Women's Athletic",
    isNewArrival: false,
    isFeatured: true,
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9"],
    colors: ["Pink", "White", "Purple"],
    description: "Lightweight trainers designed for optimal performance."
  },

  // Men's Apparel
  {
    id: 5,
    name: "Premium Cotton T-Shirt",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Men's T-Shirts",
    isNewArrival: true,
    isFeatured: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy", "Gray"],
    description: "Soft, breathable cotton t-shirt with perfect fit."
  },
  {
    id: 6,
    name: "Casual Denim Jacket",
    price: 89.99,
    originalPrice: 109.99,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Men's Jackets",
    isNewArrival: false,
    isFeatured: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "Light Blue"],
    description: "Classic denim jacket with modern fit and styling."
  },

  // Women's Apparel
  {
    id: 7,
    name: "Floral Summer Dress",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Women's Dresses",
    isNewArrival: true,
    isFeatured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Blue", "Floral Pink", "Floral Yellow"],
    description: "Beautiful floral dress perfect for summer occasions."
  },
  {
    id: 8,
    name: "Cozy Knit Sweater",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Women's Sweaters",
    isNewArrival: false,
    isFeatured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Gray", "Pink", "Black"],
    description: "Warm and comfortable knit sweater for cooler weather."
  },

  // Additional Men's Items
  {
    id: 9,
    name: "Athletic Performance Shorts",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1506629905607-53e103a0265d?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Men's Shorts",
    isNewArrival: true,
    isFeatured: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Gray", "Blue"],
    description: "High-performance shorts for training and sports."
  },
  {
    id: 10,
    name: "Business Casual Chinos",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Men's Pants",
    isNewArrival: false,
    isFeatured: true,
    sizes: ["30", "32", "34", "36", "38", "40"],
    colors: ["Khaki", "Navy", "Black", "Olive"],
    description: "Versatile chinos suitable for work or casual wear."
  },

  // Additional Women's Items
  {
    id: 11,
    name: "Yoga Leggings",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1506629905607-53e103a0265d?w=500&h=500&fit=crop",
    category: "apparel",
    subcategory: "Women's Activewear",
    isNewArrival: true,
    isFeatured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Purple", "Teal", "Pink"],
    description: "High-quality leggings perfect for yoga and workouts."
  },
  {
    id: 12,
    name: "Casual Canvas Shoes",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop",
    category: "shoes",
    subcategory: "Women's Casual",
    isNewArrival: false,
    isFeatured: false,
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5"],
    colors: ["White", "Pink", "Blue", "Yellow"],
    description: "Comfortable canvas shoes for everyday casual wear."
  }
];

// Mock users (for authentication simulation)
export const users: User[] = [
  {
    id: 1,
    email: "demo@example.com",
    name: "Demo User",
    password: "password123",
    phone: "(555) 123-4567"
  }
];