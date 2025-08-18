import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieString, getUserCart, setUserCart } from '@/lib/session';

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

    const checkoutData = await request.json();
    const cart = getUserCart();

    if (cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Simulate payment processing
    // In a real application, integrate with Stripe, PayPal, etc.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    // Generate order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Clear cart after successful checkout
    setUserCart([]);

    return NextResponse.json({
      success: true,
      orderId,
      total,
      items: cart.length,
      message: 'Order placed successfully!'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}