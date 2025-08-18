import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Accept checkoutData from the request body
    const checkoutData = await request.json();
    // Accept cart data from the request body (sent from client)
    const cart = checkoutData.cart || [];

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total
    const total = cart.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    // Generate order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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