'use client';

import { Layout } from '@/components/Layout';
import CheckoutProgress from '@/components/CheckoutProgress';
import CheckoutSummary from '@/components/CheckoutSummary';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Helper to get cart from localStorage
function getCartFromStorage() {
  try {
    const saved = localStorage.getItem('fashionstore_cart');
    if (saved) {
      const items = JSON.parse(saved);
      const total = items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
      return { items, total };
    }
  } catch {}
  return { items: [], total: 0 };
}

// Helper to get checkout data from localStorage
function getCheckoutData() {
  try {
    const saved = localStorage.getItem('fashionstore_checkout_data');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    email: '',
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    shippingMethod: 'standard'
  };
}

export default function CheckoutShipping() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [formData, setFormData] = useState(getCheckoutData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        if (data.isAuthenticated) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();

    // Prefill from user info if available
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('fashionstore_user') : null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const currentData = getCheckoutData();
      setFormData(prev => ({
        ...prev,
        name: currentData.name || user.name || '',
        email: currentData.email || user.email || '',
        phone: currentData.phone || user.phone || '',
        address: {
          ...prev.address,
          ...(currentData.address.street ? currentData.address : user.address || {})
        }
      }));
    }

    // Load cart
    const cartData = getCartFromStorage();
    setCart(cartData);
    if (cartData.items.length === 0) {
      router.push('/');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address.street) newErrors.street = 'Street address is required';
    if (!formData.address.city) newErrors.city = 'City is required';
    if (!formData.address.state) newErrors.state = 'State is required';
    if (!formData.address.zip) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Save data to localStorage
    localStorage.setItem('fashionstore_checkout_data', JSON.stringify(formData));
    
    // Navigate to payment step
    router.push('/checkout/payment');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev] as any,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name.split('.').pop() || name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name.split('.').pop() || name];
        return newErrors;
      });
    }
  };

  const getShippingCost = () => {
    switch (formData.shippingMethod) {
      case 'express': return 15.99;
      case 'overnight': return 29.99;
      default: return 5.99;
    }
  };

  return (
    <Layout currentUser={currentUser}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutProgress currentStep={1} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="John Smith"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.street ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123 Main Street"
                      />
                      {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.city ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="New York"
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.state ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="NY"
                        />
                        {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="address.zip"
                          value={formData.address.zip}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.zip ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="10001"
                        />
                        {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', price: 5.99 },
                      { id: 'express', name: 'Express Shipping', time: '2-3 business days', price: 15.99 },
                      { id: 'overnight', name: 'Overnight Shipping', time: '1 business day', price: 29.99 }
                    ].map((method) => (
                      <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.id}
                          checked={formData.shippingMethod === method.id}
                          onChange={handleChange}
                          className="h-4 w-4 text-black focus:ring-black"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{method.name}</p>
                              <p className="text-sm text-gray-500">{method.time}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">${method.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Continue Shopping
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                  >
                    Continue to Payment
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary - Takes up 1 column */}
          <div className="lg:col-span-1">
            <CheckoutSummary 
              items={cart.items} 
              total={cart.total} 
              shipping={getShippingCost()}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}