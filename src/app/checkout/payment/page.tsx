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
  return null;
}

export default function CheckoutPayment() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingDifferent: false,
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zip: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    // Load cart
    const cartData = getCartFromStorage();
    setCart(cartData);
    
    // Load checkout data from step 1
    const savedCheckoutData = getCheckoutData();
    if (!savedCheckoutData) {
      // If no checkout data, redirect back to shipping step
      router.push('/checkout/shipping');
      return;
    }
    setCheckoutData(savedCheckoutData);

    if (cartData.items.length === 0) {
      router.push('/');
    }
  }, [router]);

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (paymentData.cardNumber.length < 16) newErrors.cardNumber = 'Card number must be 16 digits';
    
    if (!paymentData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!paymentData.cvv) newErrors.cvv = 'CVV is required';
    else if (paymentData.cvv.length < 3) newErrors.cvv = 'CVV must be at least 3 digits';
    
    if (!paymentData.nameOnCard) newErrors.nameOnCard = 'Name on card is required';

    if (paymentData.billingDifferent) {
      if (!paymentData.billingAddress.street) newErrors.billingStreet = 'Billing street is required';
      if (!paymentData.billingAddress.city) newErrors.billingCity = 'Billing city is required';
      if (!paymentData.billingAddress.state) newErrors.billingState = 'Billing state is required';
      if (!paymentData.billingAddress.zip) newErrors.billingZip = 'Billing ZIP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPaymentData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name.includes('.')) {
      const [section, field] = name.split('.');
      setPaymentData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev] as any,
          [field]: value
        }
      }));
    } else {
      // Format card number and expiry date
      let formattedValue = value;
      if (name === 'cardNumber') {
        formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      } else if (name === 'expiryDate') {
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
      }
      
      setPaymentData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }

    // Clear error when user starts typing
    const fieldName = name.split('.').pop() || name;
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePayment()) {
      return;
    }

    setLoading(true);
    
    try {
      const shippingCost = getShippingCost();
      const orderData = {
        ...checkoutData,
        payment: paymentData,
        cart: cart.items,
        total: cart.total + shippingCost
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Save order summary to localStorage for thank you page
        localStorage.setItem('fashionstore_last_order', JSON.stringify({
          orderId: data.orderId,
          total: data.total,
          items: cart.items,
          shipping: {
            name: checkoutData.name,
            email: checkoutData.email,
            phone: checkoutData.phone,
            address: checkoutData.address
          }
        }));
        
        // Clear checkout data
        localStorage.removeItem('fashionstore_checkout_data');
        localStorage.removeItem('fashionstore_cart');
        
        // Redirect to thank you page
        router.push(`/checkout/thank-you?orderId=${encodeURIComponent(data.orderId)}&total=${encodeURIComponent(data.total)}`);
      } else {
        setErrors({ general: data.error || 'Payment failed' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getShippingCost = () => {
    if (!checkoutData) return 0;
    switch (checkoutData.shippingMethod) {
      case 'express': return 15.99;
      case 'overnight': return 29.99;
      default: return 5.99;
    }
  };

  if (!checkoutData) {
    return (
      <Layout currentUser={currentUser}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-gray-600 rounded-full mb-4"></div>
            <p className="text-gray-600">Loading checkout information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutProgress currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Shipping Information Review */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                  <button
                    onClick={() => router.push('/checkout/shipping')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p className="font-medium">{checkoutData.name}</p>
                  <p>{checkoutData.email}</p>
                  <p>{checkoutData.phone}</p>
                  <div className="mt-2">
                    <p>{checkoutData.address.street}</p>
                    <p>{checkoutData.address.city}, {checkoutData.address.state} {checkoutData.address.zip}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-medium">
                      {checkoutData.shippingMethod === 'express' ? 'Express Shipping' :
                       checkoutData.shippingMethod === 'overnight' ? 'Overnight Shipping' : 'Standard Shipping'}
                      {' '} - ${getShippingCost().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h1>

                {errors.general && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Credit Card */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Card</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentChange}
                          placeholder="4111 1111 1111 1111"
                          maxLength={19}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                              errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handlePaymentChange}
                            placeholder="123"
                            maxLength={4}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                              errors.cvv ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                        <input
                          type="text"
                          name="nameOnCard"
                          value={paymentData.nameOnCard}
                          onChange={handlePaymentChange}
                          placeholder="John Smith"
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                            errors.nameOnCard ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.nameOnCard && <p className="mt-1 text-sm text-red-600">{errors.nameOnCard}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        name="billingDifferent"
                        checked={paymentData.billingDifferent}
                        onChange={handlePaymentChange}
                        className="h-4 w-4 text-black focus:ring-black rounded"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Billing address is different from shipping address
                      </label>
                    </div>

                    {paymentData.billingDifferent && (
                      <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                          <input
                            type="text"
                            name="billingAddress.street"
                            value={paymentData.billingAddress.street}
                            onChange={handlePaymentChange}
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                              errors.billingStreet ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="123 Main Street"
                          />
                          {errors.billingStreet && <p className="mt-1 text-sm text-red-600">{errors.billingStreet}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="billingAddress.city"
                              value={paymentData.billingAddress.city}
                              onChange={handlePaymentChange}
                              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                errors.billingCity ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="New York"
                            />
                            {errors.billingCity && <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              name="billingAddress.state"
                              value={paymentData.billingAddress.state}
                              onChange={handlePaymentChange}
                              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                errors.billingState ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="NY"
                            />
                            {errors.billingState && <p className="mt-1 text-sm text-red-600">{errors.billingState}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                            <input
                              type="text"
                              name="billingAddress.zip"
                              value={paymentData.billingAddress.zip}
                              onChange={handlePaymentChange}
                              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                                errors.billingZip ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="10001"
                            />
                            {errors.billingZip && <p className="mt-1 text-sm text-red-600">{errors.billingZip}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => router.push('/checkout/shipping')}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Order - ${(cart.total + getShippingCost()).toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Demo Payment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                  <h3 className="text-sm font-medium text-blue-800">Demo Payment Information</h3>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Card Number:</strong> 4111 1111 1111 1111</p>
                  <p><strong>Expiry:</strong> 12/25 • <strong>CVV:</strong> 123</p>
                  <p><strong>Name:</strong> Any name</p>
                </div>
              </div>
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