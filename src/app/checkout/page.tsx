'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Checkout() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new two-step checkout flow
    router.push('/checkout/shipping');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-gray-600 rounded-full mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}