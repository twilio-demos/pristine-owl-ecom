'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fashionstore_last_order');
      if (saved) {
        setOrder(JSON.parse(saved));
        // Optionally clear the cart after order
        localStorage.removeItem('fashionstore_cart');
      }
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-4">We couldn't find your order details. Please check your email for confirmation or contact support.</p>
          <button className="mt-4 px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors" onClick={() => router.push('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-green-600 text-center">Thank You for Your Order!</h1>
        <p className="text-lg mb-6 text-center">Your order has been placed successfully.</p>
        <div className="mb-6 text-center">
          <span className="text-gray-700">Order ID:</span> <span className="font-mono">{order.orderId}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Info */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Shipping Information</h2>
            <div className="text-gray-700 text-sm space-y-1">
              <div><span className="font-medium">Name:</span> {order.shipping.name}</div>
              <div><span className="font-medium">Email:</span> {order.shipping.email}</div>
              <div><span className="font-medium">Phone:</span> {order.shipping.phone}</div>
              <div><span className="font-medium">Address:</span> {order.shipping.address.street}, {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zip}</div>
            </div>
          </div>
          {/* Order Items */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Order Items</h2>
            <div className="divide-y divide-gray-200">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="py-2 flex items-center">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded mr-3 border" />
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-xs text-gray-500">{item.size && `Size: ${item.size} `}{item.color && `Color: ${item.color}`}</div>
                  </div>
                  <div className="text-sm">Qty: {item.quantity}</div>
                  <div className="text-sm font-medium ml-4">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Totals */}
        <div className="border-t pt-4 flex justify-end">
          <div className="text-lg font-bold">Total: <span className="text-green-700">${Number(order.total).toFixed(2)}</span></div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors" onClick={() => router.push('/')}>Return to Home</button>
        </div>
      </div>
    </div>
  );
}
