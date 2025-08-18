'use client';

import { Layout } from '@/components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
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
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-gray-900 to-gray-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Lawson Reinhardt</h1>
          <p className="text-xl mb-8">Discover Premium Shoes & Apparel</p>
          <Link 
            href="/collections/new-arrivals" 
            className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Shop New Arrivals
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
        
        {/* Algolia InstantSearch Container - will be handled by app.js */}
        <div id="featured-search-container" className="mb-12">
          <div id="featured-hits"></div>
        </div>

        {/* Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <Link href="/collections/new-arrivals" className="group relative overflow-hidden rounded-lg">
            <div className="aspect-square bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop" 
                alt="New Arrivals" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">New Arrivals</h3>
            </div>
          </Link>

          <Link href="/collections/men" className="group relative overflow-hidden rounded-lg">
            <div className="aspect-square bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                alt="Men's Collection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Men&apos;s Collection</h3>
            </div>
          </Link>

          <Link href="/collections/women" className="group relative overflow-hidden rounded-lg">
            <div className="aspect-square bg-gray-200">
              <img 
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop" 
                alt="Women's Collection" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">Women&apos;s Collection</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Crafted for Excellence</h2>
              <p className="text-gray-600 text-lg mb-6">
                At Lawson Reinhardt, we believe in the perfect fusion of style and substance. 
                Every piece in our collection is carefully curated to meet the highest standards 
                of quality and design.
              </p>
              <p className="text-gray-600 text-lg mb-8">
                From premium materials to meticulous craftsmanship, our products are designed 
                to elevate your wardrobe and accompany you through life&apos;s adventures.
              </p>
              <Link 
                href="/collections/new-arrivals" 
                className="inline-block bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Explore Collection
              </Link>
            </div>
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=600&fit=crop" 
                alt="About Lawson Reinhardt" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}