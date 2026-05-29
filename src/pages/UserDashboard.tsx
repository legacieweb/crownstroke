import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { User, Package, Settings, Heart, LogOut, ShoppingBag, Trash2, MapPin, CreditCard, ChevronRight, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import { db } from '../db';
import { orders } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard: React.FC = () => {
  const { user, logout, deleteAccount, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const orderResults = await db.select()
          .from(orders)
          .where(eq(orders.customerEmail, user.email))
          .orderBy(desc(orders.createdAt));
        setUserOrders(orderResults);

        // Load wishlist from localStorage
        const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || '[]');
        setWishlistItems(savedWishlist);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name: profileName });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeFromWishlist = (id: string) => {
    const updated = wishlistItems.filter(item => item.id !== id);
    setWishlistItems(updated);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updated));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // AuthContext will handle navigation via state change
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-10 shadow-xl border border-slate-100 sticky top-32">
                <div className="flex flex-col items-center mb-10 pb-10 border-b border-slate-100">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center text-primary-600 mb-6 shadow-inner">
                    <User className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2 italic uppercase text-center">{user.name}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{user.email}</p>
                </div>

                <nav className="space-y-2 md:space-y-4">
                  {[
                    { id: 'orders', icon: Package, label: 'My Orders' },
                    { id: 'wishlist', icon: Heart, label: 'Wishlist' },
                    { id: 'settings', icon: Settings, label: 'Settings' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={clsx(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all",
                        activeTab === item.id 
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-[1.02]' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow space-y-8">
              <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                  <motion.div 
                    key="orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase">Recent Orders</h3>
                      <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total: {userOrders.length}
                      </div>
                    </div>
                    
                    {isLoading ? (
                      <div className="py-20 flex justify-center">
                        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                          <Package className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase">No Orders Yet</h4>
                        <p className="text-slate-400 font-medium max-w-sm mb-10">Start designing your first custom product and see it here!</p>
                        <Link to="/shop">
                          <Button variant="premium" className="px-10 rounded-2xl font-black uppercase tracking-widest">
                            Go to Shop
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {userOrders.map((order) => (
                          <div key={order.id} className="group border-2 border-slate-50 rounded-[2rem] p-6 md:p-8 hover:border-primary-100 transition-all bg-slate-50/30">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex gap-6">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0">
                                  {order.items[0]?.image ? (
                                    <img src={order.items[0].image} className="w-full h-full object-cover" alt="Product" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                      <ShoppingBag className="w-10 h-10" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col justify-center">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black bg-primary-100 text-primary-600 px-3 py-1 rounded-full uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                    <span className={clsx(
                                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                      order.status === 'pending' ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
                                    )}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <h4 className="text-lg font-black text-slate-900 uppercase italic mb-1">{order.items[0]?.name || 'Custom Order'}</h4>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex flex-col justify-center md:items-end gap-4">
                                <div className="text-2xl font-black text-slate-900">KES {order.totalAmount.toLocaleString()}</div>
                                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-[10px] font-black uppercase">View Details</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  <motion.div 
                    key="wishlist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100"
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 italic uppercase">My Wishlist</h3>
                    
                    {wishlistItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-200 mb-6">
                          <Heart className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-4 uppercase">Your Wishlist is Empty</h4>
                        <p className="text-slate-400 font-medium max-w-sm mb-10">Save your favorite designs here and come back later to customize or buy them.</p>
                        <Link to="/shop">
                          <Button variant="premium" className="px-10 rounded-2xl font-black uppercase tracking-widest">
                            Explore Designs
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="group border-2 border-slate-50 rounded-[2rem] overflow-hidden hover:border-primary-100 transition-all bg-white shadow-sm hover:shadow-xl">
                            <div className="relative aspect-[3/4]">
                              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                              <button 
                                onClick={() => removeFromWishlist(item.id)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="p-6">
                              <h4 className="font-black text-slate-900 uppercase italic truncate mb-2">{item.name}</h4>
                              <div className="flex justify-between items-center">
                                <span className="font-black text-primary-600">KES {item.price.toLocaleString()}</span>
                                <Link to={`/designer?product=${item.category}&id=${item.id}`}>
                                  <Button variant="outline" size="sm" className="rounded-lg text-[8px] px-3">Customize</Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 italic uppercase">Profile Settings</h3>
                      
                      <div className="space-y-8 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                            <input 
                              type="text" 
                              value={profileName} 
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                            <input type="email" defaultValue={user.email} disabled className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl font-bold text-slate-400 cursor-not-allowed" />
                          </div>
                        </div>
                        <Button 
                          variant="primary" 
                          className="px-10 rounded-2xl font-black uppercase tracking-widest"
                          loading={isSaving}
                          onClick={handleUpdateProfile}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-red-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-red-500 italic uppercase tracking-tighter">Danger Zone</h3>
                      </div>
                      
                      <p className="text-slate-500 font-medium mb-8 max-w-2xl">
                        Once you delete your account, there is no going back. All your designs, order history, and personal data will be permanently removed from our servers.
                      </p>
                      
                      {!showDeleteConfirm ? (
                        <Button 
                          variant="outline" 
                          className="border-red-200 text-red-500 hover:bg-red-500 hover:text-white px-10 rounded-2xl font-black uppercase tracking-widest"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          Delete Account Permanently
                        </Button>
                      ) : (
                        <div className="bg-red-50 rounded-[2rem] p-8 border border-red-100 animate-in fade-in zoom-in-95">
                          <h4 className="text-lg font-black text-red-600 uppercase mb-2 italic">Are you absolutely sure?</h4>
                          <p className="text-sm text-red-500 font-medium mb-6">Please type <span className="font-bold">DELETE</span> to confirm.</p>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <input 
                              type="text" 
                              placeholder="Type DELETE..." 
                              className="px-6 py-4 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none font-bold uppercase text-sm"
                              onChange={(e) => {
                                if (e.target.value === 'DELETE') {
                                  // Enable button state or similar
                                }
                              }}
                            />
                            <Button 
                              variant="premium" 
                              className="bg-red-600 hover:bg-red-700 px-8 rounded-xl font-black uppercase tracking-widest"
                              loading={isDeleting}
                              onClick={handleDeleteAccount}
                            >
                              Confirm Deletion
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="px-8 rounded-xl font-black uppercase tracking-widest text-slate-400"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
