import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieString, getUserCart, setUserCart } from '@/lib/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieString = request.headers.get('Cookie');
    const session = getSessionFromCookieString(cookieString);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.productId);
    const { quantity } = await request.json();

    const cart = getUserCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const cookieString = request.headers.get('Cookie');
    const session = getSessionFromCookieString(cookieString);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.productId);
    const cart = getUserCart();
    const filteredCart = cart.filter(item => item.productId !== productId);

    setUserCart(filteredCart);
    
    return NextResponse.json({ success: true, cart: filteredCart });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}