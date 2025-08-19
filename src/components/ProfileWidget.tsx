'use client';

import React, { useState, useEffect } from 'react';

interface ProfileData {
  traits?: Record<string, any>;
  events?: Array<any>;
  identities?: Array<any>;
}

function getAnonymousId(): string {
  // Try Segment Analytics.js if available
  if (typeof window !== 'undefined' && (window as any).analytics && typeof (window as any).analytics.user === 'function') {
    try {
      let id = (window as any).analytics.user().anonymousId();
      if (id) id = id.replace(/^"|"$/g, '');
      if (id) return id;
    } catch {}
  }
  // Fallback to localStorage
  let id = '';
  if (typeof window !== 'undefined') {
    id = localStorage.getItem('ajs_anonymous_id') || '';
    if (id) id = id.replace(/^"|"$/g, '');
    if (id) return id;
    // Generate new if not found
    id = 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }) + '-' + Date.now().toString(36);
    localStorage.setItem('ajs_anonymous_id', '"' + id + '"');
    return id;
  }
  return '';
}

export default function ProfileWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'traits' | 'events' | 'identities'>('traits');
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [anonymousId, setAnonymousId] = useState<string>('');

  // Generate or get anonymous ID
  useEffect(() => {
    let id = getAnonymousId();
    setAnonymousId(id);
  }, []);

  // Load profile data when opened
  useEffect(() => {
    if (isOpen && anonymousId && !profileData.traits) {
      loadProfileData();
    }
  }, [isOpen, anonymousId]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all three data types
      const [traitsRes, eventsRes, identitiesRes] = await Promise.all([
        fetch(`/api/profile/${anonymousId}/traits`),
        fetch(`/api/profile/${anonymousId}/events`),
        fetch(`/api/profile/${anonymousId}/identities`)
      ]);

      const traits = traitsRes.ok ? await traitsRes.json() : { error: 'Failed to load traits' };
      const events = eventsRes.ok ? await eventsRes.json() : { error: 'Failed to load events' };
      const identities = identitiesRes.ok ? await identitiesRes.json() : { error: 'Failed to load identities' };

      setProfileData({ traits, events, identities });
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const renderTraits = () => {
    if (!profileData.traits || profileData.traits.error) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          {profileData.traits?.error || 'No traits data available'}
        </div>
      );
    }

    const traits = profileData.traits.traits || profileData.traits.data || [];
    if (!Array.isArray(traits) || traits.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No traits found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {traits.map((trait: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm text-gray-900">{trait.key || trait.trait_key || 'Unknown'}</span>
              <span className="text-xs text-gray-500">
                {trait.timestamp ? new Date(trait.timestamp).toLocaleDateString() : ''}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {typeof trait.value === 'object' 
                ? <pre className="text-xs">{JSON.stringify(trait.value, null, 2)}</pre>
                : String(trait.value || trait.trait_value || 'N/A')}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEvents = () => {
    if (!profileData.events || profileData.events.error) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          {profileData.events?.error || 'No events data available'}
        </div>
      );
    }

    const events = profileData.events.events || profileData.events.data || [];
    if (!Array.isArray(events) || events.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No events found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {events.slice(0, 10).map((event: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm text-gray-900">
                {event.event || event.event_name || 'Unknown Event'}
              </span>
              <span className="text-xs text-gray-500">
                {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
              </span>
            </div>
            {(event.properties || event.event_properties) && (
              <div className="text-xs text-gray-600 mt-1">
                <details className="cursor-pointer">
                  <summary className="text-blue-600 hover:text-blue-800 text-xs">Show properties</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(event.properties || event.event_properties, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
        {events.length > 10 && (
          <div className="text-center text-xs text-gray-500 py-2">
            Showing 10 of {events.length} events
          </div>
        )}
      </div>
    );
  };

  const renderIdentities = () => {
    if (!profileData.identities || profileData.identities.error) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          {profileData.identities?.error || 'No identities data available'}
        </div>
      );
    }

    const identities = profileData.identities.external_ids || profileData.identities.data || profileData.identities;
    
    // Handle different response formats
    let identityArray = [];
    if (Array.isArray(identities)) {
      identityArray = identities;
    } else if (typeof identities === 'object' && identities !== null) {
      identityArray = Object.entries(identities).map(([key, value]) => ({ 
        type: key, 
        value: value,
        collection: key 
      }));
    }

    if (identityArray.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No identities found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {identityArray.map((identity: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm text-gray-900">
                {identity.type ? `${identity.type}:` : 'Identity:'}
              </span>
              <span className="text-xs text-gray-500">
                {identity.timestamp ? new Date(identity.timestamp).toLocaleDateString() : ''}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1 font-mono">
              {identity.id || identity.value || identity.external_id || 'N/A'}
            </div>
            {identity.source && (
              <div className="text-xs text-gray-500 mt-1">
                Source: {identity.source}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Profile Button */}
      <button 
        onClick={togglePanel}
        className="fixed bottom-6 left-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-[100] flex items-center justify-center"
        title="View Segment Profile"
      >
        <i className="fas fa-user text-lg"></i>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Profile Panel */}
      <div className={`fixed left-6 bottom-20 w-[576px] max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-xl transition-all duration-300 z-50 ${
        isOpen ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="p-4">
          {/* Panel Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Segment Profile</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading profile data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
              <p className="text-gray-600 text-sm">{error}</p>
              <button 
                onClick={loadProfileData}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Content */}
          {!loading && !error && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4">
                <button 
                  onClick={() => setActiveTab('traits')} 
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'traits' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Traits
                </button>
                <button 
                  onClick={() => setActiveTab('events')} 
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'events' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Events
                </button>
                <button 
                  onClick={() => setActiveTab('identities')} 
                  className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'identities' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Identities
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="max-h-80 overflow-y-auto">
                {activeTab === 'traits' && renderTraits()}
                {activeTab === 'events' && renderEvents()}
                {activeTab === 'identities' && renderIdentities()}
              </div>
            </>
          )}
          
          {/* Debug Info */}
          <div className="text-center py-4 border-t mt-4">
            <p className="text-xs text-gray-500">
              Anonymous ID: <span className="font-mono">{anonymousId}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}