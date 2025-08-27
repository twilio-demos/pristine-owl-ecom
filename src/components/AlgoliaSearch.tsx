"use client";

import React, { useState } from "react";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Pagination,
  Stats,
  Configure,
} from "react-instantsearch-dom";
import searchClient from "@/lib/algoliaClient";
import Image from "next/image";

interface AlgoliaSearchProps {
  indexName: string;
  filters?: string[];
  hitsPerPage?: number;
  showSearchBox?: boolean;
}

const Hit = ({ hit, onQuickView }: { hit: any; onQuickView: (hit: any) => void }) => {
  const [added, setAdded] = useState(false);
  const handleAddToCart = () => {
    // Use first available size or 'M' as fallback
    const size = (hit.sizes && hit.sizes[0]) || 'M';
    addToCartReact(hit, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={hit.images && hit.images[0] ? hit.images[0].url : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"}
          alt={hit.name}
          width={500}
          height={500}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hit.badges?.isNewProduct && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">New</span>
        )}
        {hit.badges?.isSale && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded">Sale</span>
        )}
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={e => { e.stopPropagation(); onQuickView(hit); }}
            className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-md font-medium transition-opacity duration-300 hover:bg-gray-100"
          >
            Quick View
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{hit.brand || "Lawson Reinhardt"}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{hit.name}</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{hit.price?.formattedValue || "$--"}</span>
            {hit.originalPrice && hit.originalPrice.value > hit.price.value && (
              <span className="text-sm text-gray-500 line-through">{hit.originalPrice.formattedValue}</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {hit.category || hit.type}
            </span>
          </div>
        </div>
        <button
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium relative"
          onClick={handleAddToCart}
        >
          {added ? <span className="text-green-400">Added!</span> : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

function addToCartReact(product: any, size: string, quantity: number = 1) {
  if (!product) return;
  let cart: any[] = [];
  try {
    const saved = localStorage.getItem('fashionstore_cart');
    if (saved) cart = JSON.parse(saved);
  } catch {}
  const existing = cart.find(
    (item) => item.productId === product.objectID && item.size === size
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      productId: product.objectID,
      quantity,
      size,
      color: product.colors && product.colors[0] ? product.colors[0] : 'Default',
      product: {
        id: product.objectID,
        name: product.name,
        price: product.price?.value || product.price,
        image: product.images && product.images[0] ? product.images[0].url : '',
        sku: product.sku || product.objectID,
      },
    });
  }
  localStorage.setItem('fashionstore_cart', JSON.stringify(cart));
  // Notify other tabs/components
  window.dispatchEvent(new Event('storage'));
}

function QuickViewModal({ hit, onClose }: { hit: any; onClose: () => void }) {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError('Please select a size first!');
      return;
    }
    addToCartReact(hit, selectedSize, quantity);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  if (!hit) return null;
  const hasDiscount = hit.originalPrice && hit.originalPrice.value > hit.price.value;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <i className="fas fa-times text-xl"></i>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <Image
              src={hit.images && hit.images[0] ? hit.images[0].url : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop"}
              alt={hit.name}
              width={500}
              height={500}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            {/* Additional images */}
            {hit.images && hit.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {hit.images.slice(0, 4).map((img: any, idx: number) => (
                  <Image key={idx} src={img.url} alt={hit.name} width={64} height={64} className="w-full h-16 object-cover rounded-md border" />
                ))}
              </div>
            )}
          </div>
          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{hit.brand || 'Lawson Reinhardt'}</p>
              <h2 className="text-2xl font-bold mb-2">{hit.name}</h2>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg font-bold text-gray-900">{hit.price?.formattedValue || "$--"}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">{hit.originalPrice.formattedValue}</span>
                )}
                {hasDiscount && (
                  <span className="text-sm font-medium text-green-600">Save ${((hit.originalPrice.value - hit.price.value).toFixed(2))}</span>
                )}
              </div>
              <div className="flex space-x-2 mb-2">
                {hit.badges?.isNewProduct && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">New Arrival</span>
                )}
                {hit.badges?.isSale && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Sale</span>
                )}
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {hit.category || hit.type}
                </span>
              </div>
            </div>
            <p className="mb-2 text-gray-700">{hit.description}</p>
            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Size</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-300'} hover:bg-gray-100`}
                    onClick={() => { setSelectedSize(size); setError(null); }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {/* Quantity Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100">
                  <i className="fas fa-minus text-sm"></i>
                </button>
                <span className="px-3 py-1 text-lg font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-100">
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
            </div>
            {/* Add to Cart Button */}
            <div className="space-y-2">
              <button
                className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                onClick={handleAddToCart}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add to Cart
              </button>
              {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm font-medium text-center">Added to cart!</div>}
            </div>
            {/* More product info */}
            <div className="mt-4 text-sm text-gray-600 border-t pt-4 space-y-1">
              <div><strong>SKU:</strong> {hit.sku || hit.objectID}</div>
              <div><strong>Product ID:</strong> {hit.objectID}</div>
              {hit.colors && <div><strong>Colors:</strong> {Array.isArray(hit.colors) ? hit.colors.join(', ') : hit.colors}</div>}
              {hit.sizes && <div><strong>Available Sizes:</strong> {Array.isArray(hit.sizes) ? hit.sizes.join(', ') : hit.sizes}</div>}
              <div><strong>Brand:</strong> {hit.brand || 'Lawson Reinhardt'}</div>
            </div>
            {/* Shipping & Returns */}
            <div className="mt-4 text-xs text-gray-500">
              <div>• Free shipping on orders over $50</div>
              <div>• 30-day return policy</div>
              <div>• Express delivery available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AlgoliaSearch: React.FC<AlgoliaSearchProps> = ({
  indexName,
  filters = [],
  hitsPerPage = 12,
  showSearchBox = false,
}) => {
  const [quickViewHit, setQuickViewHit] = useState<any>(null);
  return (
    <>
      {quickViewHit && <QuickViewModal hit={quickViewHit} onClose={() => setQuickViewHit(null)} />}
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <Configure hitsPerPage={hitsPerPage} facetFilters={filters} />
        {showSearchBox && <SearchBox translations={{ placeholder: "Search products..." }} />}
        {/* <Stats translations={{ stats(nbHits: number, timeSpentMS: number) { return `${nbHits} products found`; } }} /> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Hits hitComponent={({ hit }: { hit: any }) => <Hit hit={hit} onQuickView={setQuickViewHit} />} />
        </div>
        <div className="flex justify-center mt-12">
          <Pagination />
        </div>
      </InstantSearch>
    </>
  );
};

export default AlgoliaSearch;
