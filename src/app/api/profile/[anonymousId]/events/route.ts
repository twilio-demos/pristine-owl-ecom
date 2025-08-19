import { NextRequest, NextResponse } from 'next/server';

// Mock events data for demo purposes
const getMockEvents = (anonymousId: string) => {
  const baseDate = new Date();
  return {
    events: [
      {
        event: 'Page Viewed',
        event_name: 'Page Viewed',
        timestamp: new Date(baseDate.getTime() - 300000).toISOString(), // 5 minutes ago
        properties: {
          page: '/account',
          url: 'https://lawsonreinhardt.com/account',
          referrer: 'https://lawsonreinhardt.com/',
          title: 'My Account - Lawson Reinhardt'
        },
        event_properties: {
          page: '/account',
          url: 'https://lawsonreinhardt.com/account',
          referrer: 'https://lawsonreinhardt.com/',
          title: 'My Account - Lawson Reinhardt'
        }
      },
      {
        event: 'Product Viewed',
        event_name: 'Product Viewed',
        timestamp: new Date(baseDate.getTime() - 900000).toISOString(), // 15 minutes ago
        properties: {
          product_id: 'premium-sneaker-001',
          product_name: 'Premium Leather Sneakers',
          category: 'Shoes',
          price: 189.99,
          brand: 'Lawson Reinhardt'
        },
        event_properties: {
          product_id: 'premium-sneaker-001',
          product_name: 'Premium Leather Sneakers',
          category: 'Shoes',
          price: 189.99,
          brand: 'Lawson Reinhardt'
        }
      },
      {
        event: 'Product Added to Cart',
        event_name: 'Product Added to Cart',
        timestamp: new Date(baseDate.getTime() - 1800000).toISOString(), // 30 minutes ago
        properties: {
          product_id: 'premium-sneaker-001',
          product_name: 'Premium Leather Sneakers',
          category: 'Shoes',
          price: 189.99,
          quantity: 1,
          cart_total: 189.99
        },
        event_properties: {
          product_id: 'premium-sneaker-001',
          product_name: 'Premium Leather Sneakers',
          category: 'Shoes',
          price: 189.99,
          quantity: 1,
          cart_total: 189.99
        }
      },
      {
        event: 'Checkout Started',
        event_name: 'Checkout Started',
        timestamp: new Date(baseDate.getTime() - 2700000).toISOString(), // 45 minutes ago
        properties: {
          cart_total: 189.99,
          num_items: 1,
          step: 'shipping'
        },
        event_properties: {
          cart_total: 189.99,
          num_items: 1,
          step: 'shipping'
        }
      },
      {
        event: 'Form Submitted',
        event_name: 'Form Submitted',
        timestamp: new Date(baseDate.getTime() - 3600000).toISOString(), // 1 hour ago
        properties: {
          form_type: 'shipping_info',
          page: '/checkout/shipping',
          success: true
        },
        event_properties: {
          form_type: 'shipping_info',
          page: '/checkout/shipping',
          success: true
        }
      },
      {
        event: 'Page Viewed',
        event_name: 'Page Viewed',
        timestamp: new Date(baseDate.getTime() - 7200000).toISOString(), // 2 hours ago
        properties: {
          page: '/collections/shoes',
          url: 'https://lawsonreinhardt.com/collections/shoes',
          referrer: 'https://lawsonreinhardt.com/',
          title: 'Premium Shoes - Lawson Reinhardt'
        },
        event_properties: {
          page: '/collections/shoes',
          url: 'https://lawsonreinhardt.com/collections/shoes',
          referrer: 'https://lawsonreinhardt.com/',
          title: 'Premium Shoes - Lawson Reinhardt'
        }
      },
      {
        event: 'User Registered',
        event_name: 'User Registered',
        timestamp: new Date(baseDate.getTime() - 86400000).toISOString(), // 1 day ago
        properties: {
          method: 'email',
          plan: 'premium',
          source: 'website'
        },
        event_properties: {
          method: 'email',
          plan: 'premium',
          source: 'website'
        }
      },
      {
        event: 'Email Opened',
        event_name: 'Email Opened',
        timestamp: new Date(baseDate.getTime() - 172800000).toISOString(), // 2 days ago
        properties: {
          campaign: 'welcome_series',
          subject: 'Welcome to Lawson Reinhardt',
          email_id: 'welcome_001'
        },
        event_properties: {
          campaign: 'welcome_series',
          subject: 'Welcome to Lawson Reinhardt',
          email_id: 'welcome_001'
        }
      }
    ],
    cursor: baseDate.toISOString(),
    total: 8,
    demo: true
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anonymousId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const segmentSpaceId = process.env.SEGMENT_SPACE_ID;
    const profileApiKey = process.env.PROFILE_API_KEY;
    const segmentBaseUrl = process.env.SEGMENT_BASE_URL || 'https://profiles.segment.com';

    const resolvedParams = await params;

    // If Segment credentials are not configured, return mock data
    if (!segmentSpaceId || !profileApiKey || segmentSpaceId === 'your_segment_space_id') {
      const mockData = getMockEvents(resolvedParams.anonymousId);
      return NextResponse.json({
        ...mockData,
        events: mockData.events.slice(0, limit)
      });
    }

    // Try to fetch from Segment API
    const auth = Buffer.from(`${profileApiKey}:`).toString('base64');
    const url = `${segmentBaseUrl}/v1/spaces/${segmentSpaceId}/collections/users/profiles/anonymous_id:${resolvedParams.anonymousId}/events?limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Segment Profile API error:', response.status, errorText);
      
      // Fall back to mock data on API error
      const mockData = getMockEvents(resolvedParams.anonymousId);
      return NextResponse.json({
        ...mockData,
        events: mockData.events.slice(0, limit),
        note: 'Using demo data - Segment API unavailable'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Fall back to mock data on any error
    const resolvedParams = await params;
    const mockData = getMockEvents(resolvedParams.anonymousId);
    return NextResponse.json({
      ...mockData,
      note: 'Using demo data - API error occurred'
    });
  }
}