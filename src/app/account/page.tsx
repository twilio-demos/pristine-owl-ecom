'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '' }
  });
  const [success, setSuccess] = useState('');
  const [orders] = useState([
    { id: '#ORD-2024-001', date: '2024-01-15', status: 'Delivered', total: 189.99, items: 2 },
    { id: '#ORD-2024-002', date: '2024-01-10', status: 'In Transit', total: 299.99, items: 1 },
    { id: '#ORD-2024-003', date: '2024-01-05', status: 'Processing', total: 129.99, items: 3 },
  ]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-gray-600 rounded-full mb-4"></div>
            <p className="text-gray-600">Loading your account...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user text-3xl text-gray-400"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Your Account</h1>
            <p className="text-gray-600 mb-8">Please sign in to access your account information, order history, and preferences.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                onClick={() => router.push('/login')}
              >
                Sign In
              </button>
              <button 
                className="px-6 py-3 bg-white text-black border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/register')}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">Manage your account information and view your order history</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <i className="fas fa-check-circle mr-2"></i>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                {[
                  { id: 'profile', name: 'Profile Information', icon: 'fa-user' },
                  { id: 'orders', name: 'Order History', icon: 'fa-shopping-bag' },
                  { id: 'addresses', name: 'Addresses', icon: 'fa-map-marker-alt' },
                  { id: 'settings', name: 'Account Settings', icon: 'fa-cog' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-6 py-3 flex items-center text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`fas ${item.icon} mr-3 w-4`}></i>
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Section */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {!editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                          <p className="mt-1 text-lg text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                          <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                          <p className="mt-1 text-lg text-gray-900">{user.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</label>
                        <div className="mt-1">
                          {user.address && (user.address.street || user.address.city || user.address.state || user.address.zip) ? (
                            <div className="text-lg text-gray-900">
                              <p>{user.address.street}</p>
                              <p>{user.address.city}, {user.address.state} {user.address.zip}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">No address provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                          <input
                            type="text"
                            name="address.street"
                            value={form.address.street}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            name="address.city"
                            value={form.address.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <input
                            type="text"
                            name="address.state"
                            value={form.address.state}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                          <input
                            type="text"
                            name="address.zip"
                            value={form.address.zip}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Order History Section */}
            {activeSection === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                  <p className="text-gray-600 mt-1">View and track your recent orders</p>
                </div>
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-500 mb-6">When you make your first purchase, it will appear here.</p>
                      <button 
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{order.id}</h3>
                              <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                              <span className="text-lg font-semibold text-gray-900">${order.total}</span>
                            </div>
                            <div className="flex space-x-3">
                              <button className="text-black hover:text-gray-600 font-medium text-sm">
                                View Details
                              </button>
                              {order.status === 'Delivered' && (
                                <button className="text-black hover:text-gray-600 font-medium text-sm">
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Addresses Section */}
            {activeSection === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                      <p className="text-gray-600 mt-1">Manage your delivery addresses</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                      <i className="fas fa-plus mr-2"></i>
                      Add Address
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {user.address && (user.address.street || user.address.city || user.address.state || user.address.zip) ? (
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">Primary Address</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                      <div className="text-gray-700">
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state} {user.address.zip}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <i className="fas fa-map-marker-alt text-4xl text-gray-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                      <p className="text-gray-500 mb-6">Add a shipping address to make checkout faster.</p>
                      <button className="px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors">
                        Add Your First Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                {/* Account Preferences */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Account Preferences</h2>
                    <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive order updates and promotional emails</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 bg-black">
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SMS Updates</h3>
                        <p className="text-sm text-gray-500">Get shipping updates via text message</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 bg-gray-200">
                        <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Security</h2>
                    <p className="text-gray-600 mt-1">Keep your account secure</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-500">Update your account password</p>
                      </div>
                      <button className="text-black hover:text-gray-600 font-medium text-sm">
                        Change
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <button className="text-black hover:text-gray-600 font-medium text-sm">
                        Enable
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Login Activity</h3>
                        <p className="text-sm text-gray-500">See where your account has been accessed</p>
                      </div>
                      <button className="text-black hover:text-gray-600 font-medium text-sm">
                        View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-lg shadow-sm border border-red-200">
                  <div className="p-6 border-b border-red-200 bg-red-50">
                    <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                    <p className="text-red-700 mt-1">Irreversible actions for your account</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Delete Account</h3>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
