import { products, type Product } from './data';

export const getProductById = (id: number): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  switch (category) {
    case 'new-arrivals':
      return products.filter(p => p.isNewArrival);
    case 'men':
      return products.filter(p => 
        p.category === 'men' || 
        (p.category === 'shoes' && p.subcategory.includes('Men')) || 
        (p.category === 'apparel' && p.subcategory.includes('Men'))
      );
    case 'women':
      return products.filter(p => 
        p.category === 'women' || 
        (p.category === 'shoes' && p.subcategory.includes('Women')) || 
        (p.category === 'apparel' && p.subcategory.includes('Women'))
      );
    case 'shoes':
      return products.filter(p => p.category === 'shoes');
    case 'apparel':
      return products.filter(p => p.category === 'apparel');
    default:
      return products;
  }
};