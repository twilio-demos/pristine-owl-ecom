'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '' }
  });
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('fashionstore_user') : null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setForm({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || { street: '', city: '', state: '', zip: '' }
      });
      setLoading(false);
      return;
    }
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.isAuthenticated) {
          setUser(data.user);
          setForm({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            address: data.user.address || { street: '', city: '', state: '', zip: '' }
          });
          localStorage.setItem('fashionstore_user', JSON.stringify(data.user));
        }
      } catch {}
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, ...form, address: { ...form.address } };
    setUser(updatedUser);
    localStorage.setItem('fashionstore_user', JSON.stringify(updatedUser));
    setEditMode(false);
    setSuccess('Account information updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

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
    <div className="min-h-screen flex flex-col items-center py-12 bg-gray-50">
      <div className="bg-white rounded shadow p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">My Account</h1>
        {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
        {!editMode ? (
          <div className="space-y-4">
            <div><span className="font-semibold">Name:</span> {user.name}</div>
            <div><span className="font-semibold">Email:</span> {user.email}</div>
            <div><span className="font-semibold">Phone:</span> {user.phone || <span className="text-gray-400">Not set</span>}</div>
            <div><span className="font-semibold">Address:</span> {user.address && (user.address.street || user.address.city || user.address.state || user.address.zip) ? (
              <span>{user.address.street}, {user.address.city}, {user.address.state} {user.address.zip}</span>
            ) : <span className="text-gray-400">Not set</span>}</div>
            <button className="mt-6 px-4 py-2 bg-black text-white rounded w-full" onClick={() => setEditMode(true)}>Edit Information</button>
            <button className="mt-2 px-4 py-2 bg-gray-200 rounded w-full" onClick={() => router.push('/')}>Return to Home</button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street</label>
              <input type="text" name="address.street" value={form.address.street} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" name="address.city" value={form.address.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input type="text" name="address.state" value={form.address.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zip</label>
                <input type="text" name="address.zip" value={form.address.zip} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="submit" className="px-4 py-2 bg-black text-white rounded w-full">Save</button>
              <button type="button" className="px-4 py-2 bg-gray-200 rounded w-full" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
