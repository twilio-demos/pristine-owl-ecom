import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Cart API is not used. Cart is stored in localStorage.' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Cart API is not used. Cart is stored in localStorage.' }, { status: 404 });
}