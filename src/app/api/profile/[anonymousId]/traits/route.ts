import { NextRequest, NextResponse } from 'next/server';

// Mock traits data for demo purposes
const getMockTraits = (anonymousId: string) => {
  const baseDate = new Date();
  return {
    traits: [
      {
        key: 'firstName',
        value: 'Demo',
        timestamp: new Date(baseDate.getTime() - 86400000 * 2).toISOString(),
        trait_key: 'firstName',
        trait_value: 'Demo'
      },
      {
        key: 'lastName', 
        value: 'User',
        timestamp: new Date(baseDate.getTime() - 86400000 * 2).toISOString(),
        trait_key: 'lastName',
        trait_value: 'User'
      },
      {
        key: 'email',
        value: 'demo@lawsonreinhardt.com',
        timestamp: new Date(baseDate.getTime() - 86400000 * 1).toISOString(),
        trait_key: 'email',
        trait_value: 'demo@lawsonreinhardt.com'
      },
      {
        key: 'userId',
        value: `user_${anonymousId.split('_').pop()}`,
        timestamp: new Date(baseDate.getTime() - 86400000 * 1).toISOString(),
        trait_key: 'userId',
        trait_value: `user_${anonymousId.split('_').pop()}`
      },
      {
        key: 'plan',
        value: 'premium',
        timestamp: new Date(baseDate.getTime() - 3600000 * 6).toISOString(),
        trait_key: 'plan',
        trait_value: 'premium'
      },
      {
        key: 'location',
        value: {
          city: 'San Francisco',
          state: 'CA',
          country: 'United States'
        },
        timestamp: new Date(baseDate.getTime() - 3600000 * 12).toISOString(),
        trait_key: 'location',
        trait_value: {
          city: 'San Francisco',
          state: 'CA',
          country: 'United States'
        }
      },
      {
        key: 'signupDate',
        value: new Date(baseDate.getTime() - 86400000 * 30).toISOString().split('T')[0],
        timestamp: new Date(baseDate.getTime() - 86400000 * 30).toISOString(),
        trait_key: 'signupDate',
        trait_value: new Date(baseDate.getTime() - 86400000 * 30).toISOString().split('T')[0]
      }
    ],
    cursor: baseDate.toISOString(),
    total: 7,
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
      const mockData = getMockTraits(resolvedParams.anonymousId);
      return NextResponse.json({
        ...mockData,
        traits: mockData.traits.slice(0, limit)
      });
    }

    // Try to fetch from Segment API
    const auth = Buffer.from(`${profileApiKey}:`).toString('base64');
    const url = `${segmentBaseUrl}/v1/spaces/${segmentSpaceId}/collections/users/profiles/anonymous_id:${resolvedParams.anonymousId}/traits?limit=${limit}`;

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
      const mockData = getMockTraits(resolvedParams.anonymousId);
      return NextResponse.json({
        ...mockData,
        traits: mockData.traits.slice(0, limit),
        note: 'Using demo data - Segment API unavailable'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching traits:', error);
    
    // Fall back to mock data on any error
    const resolvedParams = await params;
    const mockData = getMockTraits(resolvedParams.anonymousId);
    return NextResponse.json({
      ...mockData,
      note: 'Using demo data - API error occurred'
    });
  }
}