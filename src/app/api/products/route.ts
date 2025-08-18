import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory } from '@/lib/products';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      const filteredProducts = getProductsByCategory(category);
      return NextResponse.json(filteredProducts);
    }

    const allProducts = getProductsByCategory('all');
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}