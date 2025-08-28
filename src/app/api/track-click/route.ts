import { NextRequest, NextResponse } from 'next/server';
import { trackProductClick } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, clickType } = body;

    if (!productId || !clickType) {
      return NextResponse.json(
        { error: 'Product ID and click type are required' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await trackProductClick(productId, clickType, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error tracking click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}