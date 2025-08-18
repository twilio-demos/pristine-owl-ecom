import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anonymousId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';

    const segmentSpaceId = process.env.SEGMENT_SPACE_ID;
    const profileApiKey = process.env.PROFILE_API_KEY;
    const segmentBaseUrl = process.env.SEGMENT_BASE_URL || 'https://profiles.segment.com';

    if (!segmentSpaceId || !profileApiKey) {
      return NextResponse.json(
        { error: 'Segment credentials not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
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
      console.error('Segment Profile API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Segment API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching traits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}