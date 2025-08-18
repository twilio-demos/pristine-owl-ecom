'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for user info first
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('fashionstore_user') : null;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
      return;
    }
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.isAuthenticated) {
          setUser(data.user);
          localStorage.setItem('fashionstore_user', JSON.stringify(data.user));
        }
      } catch {}
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">My Account</h1>
        <p className="mb-4">You are not logged in.</p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-black text-white rounded" onClick={() => router.push('/login')}>Log In</button>
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => router.push('/register')}>Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <p className="mb-2"><span className="font-semibold">Name:</span> {user.name}</p>
        <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
        {/* Add more user info or account actions here */}
        <button className="mt-6 px-4 py-2 bg-black text-white rounded" onClick={() => router.push('/')}>Return to Home</button>
      </div>
    </div>
  );
}
