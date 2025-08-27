import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product: CartProduct;
}

const getCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('fashionstore_cart');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
};

const setCartToStorage = (cart: CartItem[]) => {
  localStorage.setItem('fashionstore_cart', JSON.stringify(cart));
};

const CartSidebar: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(getCartFromStorage());
    const handler = () => setCart(getCartFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      setCartToStorage(updated);
      return updated;
    });
  };

  const removeItem = (productId: string, size: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => !(item.productId === productId && item.size === size));
      setCartToStorage(updated);
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 z-[100] ${open ? '' : 'translate-x-full'}`}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.productId + item.size} className="flex items-center space-x-3 p-3 border-b">
                <Image src={item.product.image} alt={item.product.name} width={64} height={64} className="object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.product.name}</h4>
                  <p className="text-xs text-gray-500">{item.size}, {item.color}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <button onClick={() => updateQuantity(item.productId, item.size, -1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">-</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.size, 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.productId, item.size)} className="text-red-500 hover:text-red-700 text-xs mt-1">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
            disabled={cart.length === 0}
            onClick={() => {
              if (cart.length > 0) router.push('/checkout/shipping');
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
