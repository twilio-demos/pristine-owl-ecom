'use client';

import { Layout } from '@/components/Layout';
import { useEffect, useState } from 'react';

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
        {/* Search Stats */}
        <div id={`${collection}-stats`} className="mb-6">
          <div id={`${collection}-results-count`} className="text-gray-600"></div>
        </div>

        {/* Product Grid */}
        <div id={`${collection}-search-container`}>
          <div id={`${collection}-hits`} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Products will be loaded by Algolia InstantSearch */}
          </div>
        </div>

        {/* Pagination */}
        <div id={`${collection}-pagination`} className="flex justify-center mt-12">
          {/* Pagination will be loaded by Algolia InstantSearch */}
        </div>
      </section>
    </Layout>
  );
}