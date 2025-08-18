import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieString, getUserCart, setUserCart } from '@/lib/session';
import { getProductById } from '@/lib/products';

export async function GET(request: NextRequest) {
  try {
    const cookieString = request.headers.get('Cookie');
    const session = getSessionFromCookieString(cookieString);
    
    if (!session) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cart = getUserCart();
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return NextResponse.json({ items: cart, total });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieString = request.headers.get('Cookie');
    const session = getSessionFromCookieString(cookieString);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId, quantity, size, color } = await request.json();
    const product = getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const cart = getUserCart();
    const existingItemIndex = cart.findIndex(item => 
      item.productId === productId && 
      item.size === size && 
      item.color === color
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        id: Date.now(),
        productId,
        product,
        quantity,
        size,
        color
      };
      cart.push(newItem);
    }

    setUserCart(cart);
    
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}