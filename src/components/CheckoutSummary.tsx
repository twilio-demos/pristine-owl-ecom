'use client';

import React from 'react';
import Image from 'next/image';

interface CartItem {
  id: string;
  product: {
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  size?: string;
  color?: string;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
  shipping?: number;
  tax?: number;
}

export default function CheckoutSummary({ items, total, shipping = 0, tax = 0 }: CheckoutSummaryProps) {
  const subtotal = total;
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <Image 
                src={item.product.image} 
                alt={item.product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
              <div className="text-sm text-gray-500">
                <p>Qty: {item.quantity}</p>
                {item.size && <p>Size: {item.size}</p>}
                {item.color && <p>Color: {item.color}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                ${item.product.price.toFixed(2)} each
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.length} item{items.length > 1 ? 's' : ''})</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">${shipping.toFixed(2)}</span>
          </div>
        )}
        
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-700">
            <span>Have a promo code?</span>
            <i className="fas fa-chevron-down transition-transform group-open:rotate-180"></i>
          </summary>
          <div className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter code"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors">
                Apply
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}