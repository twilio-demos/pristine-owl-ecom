'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartSidebar from './CartSidebar';

interface Props {
  children: ReactNode;
  currentUser?: any;
}

export const Layout: React.FC<Props> = ({ children, currentUser: initialCurrentUser }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(initialCurrentUser || null);
  const [cartCount, setCartCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      const menu = document.getElementById('userMenuDropdown');
      if (menu && !menu.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    // Load external scripts on client side (no longer loading app.js)
    if (typeof window !== 'undefined') {
      // Check localStorage for user info
      const storedUser = localStorage.getItem('fashionstore_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      // Cart badge logic
      const updateCartCount = () => {
        const saved = localStorage.getItem('fashionstore_cart');
        if (saved) {
          const items = JSON.parse(saved);
          setCartCount(items.reduce((sum: number, item: any) => sum + item.quantity, 0));
        } else {
          setCartCount(0);
        }
      };
      updateCartCount();
      window.addEventListener('storage', updateCartCount);

      return () => {
        window.removeEventListener('storage', updateCartCount);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/static/lawson-reinhardt-logo.png" 
                  alt="Lawson Reinhardt" 
                  width={32} 
                  height={32} 
                  className="h-8 w-auto mr-3" 
                />
                <span className="text-2xl font-bold text-gray-900">Lawson Reinhardt</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/collections/new-arrivals" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                New Arrivals
              </Link>
              <Link href="/collections/men" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Men
              </Link>
              <Link href="/collections/women" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Women
              </Link>
              <Link href="/collections/shoes" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Shoes
              </Link>
              <Link href="/collections/apparel" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Apparel
              </Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="text-gray-700 hover:text-gray-900 transition-colors">
                <i className="fas fa-search text-lg"></i>
              </button>

              {/* User Menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="text-gray-700 hover:text-gray-900 transition-colors focus:outline-none"
                  >
                    <i className="fas fa-user text-lg"></i>
                  </button>
                  {userMenuOpen && (
                    <div
                      id="userMenuDropdown"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100"
                    >
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem('fashionstore_user');
                          fetch('/api/logout', { method: 'POST' }).then(() => {
                            window.location.href = '/';
                          });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors">
                  <i className="fas fa-user text-lg"></i>
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="relative text-gray-700 hover:text-gray-900 transition-colors">
                <i className="fas fa-shopping-cart text-lg"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button onClick={() => (window as any).toggleMobileMenu?.()} className="md:hidden text-gray-700 hover:text-gray-900">
                <i className="fas fa-bars text-lg"></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobileMenu" className="hidden md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/collections/new-arrivals" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">New Arrivals</Link>
              <Link href="/collections/men" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">Men</Link>
              <Link href="/collections/women" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">Women</Link>
              <Link href="/collections/shoes" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">Shoes</Link>
              <Link href="/collections/apparel" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">Apparel</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Quick View Modal */}
      <div id="quickViewOverlay" className="fixed inset-0 bg-black bg-opacity-50 z-60 hidden" onClick={() => (window as any).closeQuickView?.()}></div>
      <div id="quickViewModal" className="fixed inset-0 z-60 overflow-y-auto hidden">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick View</h3>
                <button onClick={() => (window as any).closeQuickView?.()} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {/* Modal Content */}
              <div id="quickViewContent">
                {/* Content will be populated by JavaScript */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Button */}
      <button 
        id="profileButton" 
        onClick={() => (window as any).toggleProfilePanel?.()} 
        className="fixed bottom-6 left-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-[100] flex items-center justify-center cursor-pointer"
        title="View Segment Profile"
        style={{pointerEvents: 'auto'}}
      >
        <i className="fas fa-user text-lg"></i>
      </button>

      {/* Profile Panel - Complex component kept as-is with ids for JS interaction */}
      <div id="profileOverlay" className="fixed inset-0 bg-black bg-opacity-50 z-50 hidden" onClick={() => (window as any).toggleProfilePanel?.()}></div>
      <div id="profilePanel" className="fixed left-6 bottom-20 w-[576px] max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-xl transform translate-y-full opacity-0 transition-all duration-300 z-50">
        <div className="p-4">
          {/* Panel Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 id="profileTitle" className="text-lg font-bold text-gray-900">Segment Profile</h2>
            <button onClick={() => (window as any).toggleProfilePanel?.()} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
          
          {/* Loading State */}
          <div id="profileLoading" className="text-center py-8">
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading profile data...</p>
          </div>
          
          {/* Tabs */}
          <div id="profileTabs" className="hidden">
            <div className="flex border-b border-gray-200 mb-4">
              <button 
                onClick={() => (window as any).switchProfileTab?.('traits')} 
                className="profile-tab flex-1 py-2 px-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 active"
                data-tab="traits"
              >
                Traits
              </button>
              <button 
                onClick={() => (window as any).switchProfileTab?.('events')} 
                className="profile-tab flex-1 py-2 px-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300"
                data-tab="events"
              >
                Events
              </button>
              <button 
                onClick={() => (window as any).switchProfileTab?.('identities')} 
                className="profile-tab flex-1 py-2 px-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300"
                data-tab="identities"
              >
                Identities
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="max-h-80 overflow-y-auto">
              {/* Tabs content handled by JavaScript */}
              <div id="traitsContent" className="profile-content">
                <div className="space-y-2"></div>
              </div>
              <div id="eventsContent" className="profile-content hidden">
                <div className="space-y-2"></div>
              </div>
              <div id="identitiesContent" className="profile-content hidden">
                <div className="space-y-2"></div>
              </div>
            </div>
          </div>
          
          {/* Error State */}
          <div id="profileError" className="hidden text-center py-8">
            <i className="fas fa-exclamation-triangle text-yellow-500 text-2xl mb-2"></i>
            <p className="text-gray-600 text-sm">Unable to load profile data</p>
            <p id="errorDetails" className="text-gray-500 text-xs mt-2"></p>
            <button onClick={() => (window as any).loadSegmentProfile?.()} className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline">
              Try Again
            </button>
          </div>
          
          {/* Debug Info */}
          <div id="profileDebug" className="text-center py-4 border-t">
            <p className="text-xs text-gray-500">Anonymous ID: <span id="debugAnonymousId" className="font-mono"></span></p>
          </div>
        </div>
      </div>

      {/* Cart Sidebar (React) */}
      {cartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[99]" onClick={() => setCartOpen(false)}></div>}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Lawson Reinhardt</h3>
              <p className="text-gray-400">Premium shoes and apparel for the modern lifestyle.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/collections/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
                <li><Link href="/collections/men" className="hover:text-white">Men</Link></li>
                <li><Link href="/collections/women" className="hover:text-white">Women</Link></li>
                <li><Link href="/collections/shoes" className="hover:text-white">Shoes</Link></li>
                <li><Link href="/collections/apparel" className="hover:text-white">Apparel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white">Size Guide</Link></li>
                <li><Link href="#" className="hover:text-white">Returns</Link></li>
                <li><Link href="#" className="hover:text-white">Shipping</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Connect</h4>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-facebook"></i></Link>
                <Link href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-twitter"></i></Link>
                <Link href="#" className="text-gray-400 hover:text-white text-xl"><i className="fab fa-instagram"></i></Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Lawson Reinhardt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};