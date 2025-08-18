import { useSearchParams, useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const total = searchParams.get('total');
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">Thank You for Your Order!</h1>
        <p className="text-lg mb-2">Your order has been placed successfully.</p>
        {orderId && (
          <p className="mb-2 text-gray-700">Order ID: <span className="font-mono">{orderId}</span></p>
        )}
        {total && (
          <p className="mb-6 text-gray-700">Total: <span className="font-semibold">${Number(total).toFixed(2)}</span></p>
        )}
        <button
          className="mt-4 px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          onClick={() => router.push('/')}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
