'use client';

import { Layout } from '@/components/Layout';
import { useEffect, useState } from 'react';
import AlgoliaSearch from '@/components/AlgoliaSearch';

interface CollectionPageProps {
  collection: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function CollectionPage({ collection, title, description, imageUrl }: CollectionPageProps) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        if (data.isAuthenticated) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  return (
    <Layout currentUser={currentUser}>
      {/* Collection Header */}
      <section className="relative h-64 bg-gray-900 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl">{description}</p>
        </div>
      </section>

      {/* Algolia Search Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AlgoliaSearch 
          indexName={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'dev_ecommerce'}
          filters={(() => {
            if (collection === 'new-arrivals') return ['isNewProduct:true'];
            if (collection === 'shoes') return ['type:shoes'];
            if (collection === 'apparel') return ['type:clothing'];
            return [`category:${collection}`];
          })()}
          hitsPerPage={12}
        />
      </section>
    </Layout>
  );
}