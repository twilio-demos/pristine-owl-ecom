'use client';

import { Layout } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Checkout() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    payment: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status and load cart
    const checkAuthAndLoadCart = async () => {
      try {
        const [authResponse, cartResponse] = await Promise.all([
          fetch('/api/auth/status'),
          fetch('/api/cart')
        ]);

        const authData = await authResponse.json();
        if (authData.isAuthenticated) {
          setCurrentUser(authData.user);
          setFormData(prev => ({
            ...prev,
            email: authData.user.email,
            name: authData.user.name
          }));
        }

        const cartData = await cartResponse.json();
        setCart(cartData);

        if (cartData.items.length === 0) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    checkAuthAndLoadCart();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page or show success message
        alert(`Order placed successfully! Order ID: ${data.orderId}`);
        router.push('/');
      } else {
        setError(data.error || 'Checkout failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <Layout currentUser={currentUser}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-center mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="address.street"
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="address.city"
                      placeholder="City"
                      value={formData.address.city}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      name="address.state"
                      placeholder="State"
                      value={formData.address.state}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="address.zip"
                    placeholder="ZIP Code"
                    value={formData.address.zip}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="payment.cardNumber"
                    placeholder="Card Number (4111 1111 1111 1111)"
                    value={formData.payment.cardNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="payment.expiryDate"
                      placeholder="MM/YY (12/25)"
                      value={formData.payment.expiryDate}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      name="payment.cvv"
                      placeholder="CVV (123)"
                      value={formData.payment.cvv}
                      onChange={handleChange}
                      required
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    name="payment.nameOnCard"
                    placeholder="Name on Card"
                    value={formData.payment.nameOnCard}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Complete Order - $${cart.total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                        {item.size && ` • Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
              <p className="text-sm text-blue-600 font-medium">Demo Payment Info:</p>
              <p className="text-sm text-blue-600">Card: 4111 1111 1111 1111</p>
              <p className="text-sm text-blue-600">Expiry: 12/25 • CVV: 123</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}