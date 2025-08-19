import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ anonymousId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';

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
    
    // First, try to get external_ids 
    const externalIdsUrl = `${segmentBaseUrl}/v1/spaces/${segmentSpaceId}/collections/users/profiles/anonymous_id:${resolvedParams.anonymousId}/external_ids?limit=${limit}`;

    try {
      const response = await fetch(externalIdsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Always include the anonymous_id as an identity
        const identities = [
          {
            collection: 'anonymous_id',
            type: 'anonymous_id',
            id: resolvedParams.anonymousId,
            value: resolvedParams.anonymousId,
            source: 'system',
            timestamp: new Date().toISOString()
          }
        ];

        // Add external IDs if they exist
        if (data.external_ids && Array.isArray(data.external_ids)) {
          identities.push(...data.external_ids.map((id: any) => ({
            collection: id.collection || 'external_id',
            type: id.type || id.collection || 'external_id',
            id: id.id || id.external_id || id.value,
            value: id.id || id.external_id || id.value,
            source: id.source || 'segment',
            timestamp: id.timestamp || id.created_at
          })));
        }

        // If no external IDs in response, try to extract from data structure
        if (data.data && typeof data.data === 'object') {
          Object.entries(data.data).forEach(([key, value]) => {
            if (key !== 'anonymous_id') {
              identities.push({
                collection: key,
                type: key,
                id: String(value),
                value: String(value),
                source: 'segment',
                timestamp: new Date().toISOString()
              });
            }
          });
        }

        return NextResponse.json({ 
          external_ids: identities,
          data: identities,
          total: identities.length 
        });
      }
    } catch (error) {
      console.warn('External IDs endpoint failed, trying alternate approach:', error);
    }

    // Fallback: Try to get profile metadata that might contain identities
    const profileUrl = `${segmentBaseUrl}/v1/spaces/${segmentSpaceId}/collections/users/profiles/anonymous_id:${resolvedParams.anonymousId}`;
    
    try {
      const profileResponse = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        const identities = [
          {
            collection: 'anonymous_id',
            type: 'anonymous_id', 
            id: resolvedParams.anonymousId,
            value: resolvedParams.anonymousId,
            source: 'system',
            timestamp: new Date().toISOString()
          }
        ];

        // Extract any user IDs or other identifiers from the profile
        if (profileData.traits) {
          ['user_id', 'email', 'userId', 'id'].forEach(field => {
            if (profileData.traits[field]) {
              identities.push({
                collection: field,
                type: field,
                id: String(profileData.traits[field]),
                value: String(profileData.traits[field]),
                source: 'profile_traits',
                timestamp: profileData.cursor || new Date().toISOString()
              });
            }
          });
        }

        return NextResponse.json({ 
          external_ids: identities,
          data: identities,
          total: identities.length 
        });
      }
    } catch (error) {
      console.warn('Profile endpoint also failed:', error);
    }

    // Final fallback: return just the anonymous_id
    const fallbackIdentities = [
      {
        collection: 'anonymous_id',
        type: 'anonymous_id',
        id: resolvedParams.anonymousId,
        value: resolvedParams.anonymousId,
        source: 'system',
        timestamp: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      external_ids: fallbackIdentities,
      data: fallbackIdentities,
      total: 1,
      note: 'Using fallback identity data - Segment API may not be configured or accessible'
    });

  } catch (error) {
    console.error('Error fetching identities:', error);
    
    // Even in error case, return the anonymous_id
    const errorIdentities = [
      {
        collection: 'anonymous_id', 
        type: 'anonymous_id',
        id: (await params).anonymousId,
        value: (await params).anonymousId,
        source: 'system',
        timestamp: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      external_ids: errorIdentities,
      data: errorIdentities,
      total: 1,
      error: 'Partial data only - full identity data unavailable'
    });
  }
}