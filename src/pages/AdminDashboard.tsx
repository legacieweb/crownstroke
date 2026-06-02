import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../db';
import { users, designers, shops, orders as ordersTable, designerDesigns, siteSettings } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { Users, ShoppingBag, DollarSign, LogOut, Trash2, Eye, Store, Palette, Check, X, RefreshCw, Video, Upload, Package, TrendingUp, Shield, Zap, Settings, Globe, Lock, Activity, Database } from 'lucide-react';
import Button from '../components/ui/Button';
import Preloader from '../components/ui/Preloader';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface Design {
  id: string;
  name: string;
  productId: string;
  preview: string;
  price: number;
  designerId: string;
  designerName: string;
  shopId: string;
  shopName: string;
  isEditorsPick: string;
  isFeatured: string;
  isExclusive: string;
  isSpringCollection: string;
  isMinimalist: string;
  isFlashSale: string;
}

interface Designer {
  id: string;
  userId: string;
  name: string;
  email: string;
  heroImage: string | null;
  shopName: string | null;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  country: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  status: string;
  paymentStatus: string;
  paymentType: string;
  createdAt: string | Date;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigners: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designersList, setDesignersList] = useState<Designer[]>([]);
  const [orders, setOrdersList] = useState<Order[]>([]);
  const [bgVideoUrl, setBgVideoUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'designs' | 'designers' | 'orders' | 'bg-video' | 'settings'>('designs');

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([fetchAllData(), loadBgVideo()]);
    };
    loadAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [userResults, designerResults, orderResults, allDesigns, allShops] = await Promise.all([
        db.select().from(users),
        db.select().from(designers),
        db.select().from(ordersTable),
        db.select().from(designerDesigns),
        db.select().from(shops)
      ]);

      const revenue = orderResults.reduce((sum: number, order) => sum + (order.totalAmount || 0), 0);

      const designsWithInfo = await Promise.all(allDesigns.map(async (d: any) => {
        const designer = designerResults.find(dsg => dsg.id?.toString() === d.designerId?.toString());
        const designerUser = designer ? userResults.find(u => u.id === designer.userId) : null;
        const shop = allShops.find(s => s.id?.toString() === d.shopId?.toString());
        return {
          ...d,
          id: d.id.toString(),
          designerId: d.designerId?.toString() || '',
          shopId: d.shopId?.toString() || '',
          designerName: designerUser?.name || designer?.name || 'Unknown',
          shopName: shop?.name || 'Unknown',
          isEditorsPick: d.isEditorsPick || 'false',
          isFeatured: d.isFeatured || 'false',
          isExclusive: d.isExclusive || 'false',
          isSpringCollection: d.isSpringCollection || 'false',
          isMinimalist: d.isMinimalist || 'false',
          isFlashSale: d.isFlashSale || 'false',
        } as Design;
      }));

      const designersWithShops = designerResults.map(d => ({
        ...d,
        id: d.id.toString(),
        shopName: allShops.find(s => s.designerId?.toString() === d.id.toString())?.name || null
      })) as Designer[];

      const ordersFormatted = orderResults.map((o: any) => ({
        ...o,
        id: o.id?.toString() || '',
      })) as Order[];

      setStats({
        totalUsers: userResults.length,
        totalDesigners: designerResults.length,
        totalOrders: orderResults.length,
        totalRevenue: revenue
      });
      setDesigns(designsWithInfo);
      setDesignersList(designersWithShops);
      setOrdersList(ordersFormatted);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDesignFlag = async (designId: string, field: string, value: string) => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      await db.update(designerDesigns)
        .set({ [field]: value })
        .where(eq(designerDesigns.id, designId as any));
      
      setDesigns(prev => prev.map(d => 
        d.id === designId ? { ...d, [field]: value } : d
      ));
      setUpdateMsg({ type: 'success', text: 'Design updated successfully' });
    } catch (err) {
      console.error('Failed to update design:', err);
      setUpdateMsg({ type: 'error', text: 'Failed to update design' });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) return;
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      await db.delete(designerDesigns).where(eq(designerDesigns.id, designId as any));
      setDesigns(prev => prev.filter(d => d.id !== designId));
      setUpdateMsg({ type: 'success', text: 'Design deleted successfully' });
    } catch (err) {
      console.error('Failed to delete design:', err);
      setUpdateMsg({ type: 'error', text: 'Failed to delete design' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      setUpdateMsg({ type: 'error', text: 'Please select a valid video file' });
      return;
    }
    
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`Video selected: ${file.name} (${fileSizeMB} MB)`);
    
    const videoUrl = URL.createObjectURL(file);
    setBgVideoUrl(videoUrl);
    setUpdateMsg({ type: 'success', text: `Video loaded: ${file.name} (${fileSizeMB} MB)` });
  };

  const saveBgVideo = async () => {
    if (!bgVideoUrl) return;
    
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      if (bgVideoUrl.startsWith('blob:')) {
        setUpdateMsg({ type: 'error', text: 'Please use a video URL (not file upload in this version)' });
        setIsUpdating(false);
        return;
      }
      
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
      
      if (existing.length > 0) {
        await db.update(siteSettings)
          .set({ bgVideoUrl: bgVideoUrl })
          .where(eq(siteSettings.id, 'default'));
      } else {
        await db.insert(siteSettings)
          .values({ id: 'default', bgVideoUrl: bgVideoUrl });
      }
      
      setUpdateMsg({ type: 'success', text: 'Background video updated successfully' });
    } catch (err) {
      console.error('Failed to save bg video:', err);
      setUpdateMsg({ type: 'error', text: 'Failed to save background video. Please use a video URL instead of uploading a file.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const loadBgVideo = async () => {
    try {
      const results = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
      if (results.length > 0 && results[0].bgVideoUrl) {
        setBgVideoUrl(results[0].bgVideoUrl);
      }
    } catch (err) {
      console.error('Failed to load bg video:', err);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={clsx(
        "flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2",
        activeTab === id 
          ? "text-primary-400 border-primary-400 bg-white/5" 
          : "text-gray-400 border-transparent hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className="w-4 h-4 inline mr-2" />
      {label}
    </button>
  );

  return (
    <Layout>
      <Preloader isLoading={isLoading} />
      
      <div className="relative min-h-screen py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-12"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                  Admin <span className="text-primary-400">Panel</span>
                </h1>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Control Center</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-xs border border-red-500/30 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500', change: '+12%' },
              { label: 'Designers', value: stats.totalDesigners, icon: Palette, color: 'from-green-500 to-emerald-500', change: '+8%' },
              { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-purple-500 to-indigo-500', change: '+24%' },
              { label: 'Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-yellow-500 to-orange-500', change: '+18%' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-[2rem] blur-xl group-hover:opacity-30 transition-opacity" />
                <div className="relative bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 hover:border-white/20 transition-all">
                  <div className={clsx(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                    stat.color
                  )}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                  <div className="flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs font-black text-green-400">{stat.change}</span>
                    <span className="text-xs text-gray-500">this month</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {updateMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={clsx(
                  "p-4 rounded-xl mb-6 flex items-center gap-2 border backdrop-blur-xl",
                  updateMsg.type === 'success' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                )}
              >
                {updateMsg.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                <span className="font-medium text-sm">{updateMsg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="flex flex-wrap border-b border-white/5 bg-white/5">
              <TabButton id="designs" label="Manage Designs" icon={Palette} />
              <TabButton id="designers" label="Designers & Shops" icon={Store} />
              <TabButton id="orders" label="Orders" icon={Package} />
              <TabButton id="bg-video" label="Background Video" icon={Video} />
              <TabButton id="settings" label="Site Settings" icon={Settings} />
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'designs' && (
                  <motion.div
                    key="designs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-white uppercase italic">Design Management</h2>
                      <button
                        onClick={fetchAllData}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/15 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Design</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Editor's Pick</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Featured (Home)</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Exclusive</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Spring</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Minimalist</th>
                            <th className="text-center py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Flash Sale</th>
                            <th className="text-right py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {designs.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-gray-400 font-medium">
                                No designs found. Add some designs in the shop!
                              </td>
                            </tr>
                          ) : (
                            designs.map((design, idx) => (
                              <tr
                                key={design.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                              >
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-3">
                                    <img src={design.preview} alt={design.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                    <span className="font-black text-white">{design.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-2 text-gray-300 font-medium">{design.productId}</td>
                                
                                {['isEditorsPick', 'isFeatured', 'isExclusive', 'isSpringCollection', 'isMinimalist', 'isFlashSale'].map(field => (
                                  <td key={field} className="py-4 px-2 text-center">
                                    <button
                                      onClick={() => updateDesignFlag(design.id, field, design[field as keyof Design] === 'true' ? 'false' : 'true')}
                                      disabled={isUpdating}
                                      className={clsx(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all mx-auto disabled:opacity-50",
                                        design[field as keyof Design] === 'true' 
                                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                      )}
                                    >
                                      {design[field as keyof Design] === 'true' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                    </button>
                                  </td>
                                ))}

                                <td className="py-4 px-2 text-right">
                                  <button
                                    onClick={() => deleteDesign(design.id)}
                                    disabled={isUpdating}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'designers' && (
                  <motion.div
                    key="designers"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-2xl font-black text-white uppercase italic mb-8">Designers & Shops</h2>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Designer</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Shop Name</th>
                            <th className="text-right py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Shop Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {designersList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                                No designers found.
                              </td>
                            </tr>
                          ) : (
                            designersList.map((designer, idx) => (
                              <tr
                                key={designer.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                              >
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden border border-white/10">
                                      {designer.heroImage ? (
                                        <img src={designer.heroImage} alt={designer.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Palette className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <span className="font-black text-white">{designer.name}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-2 text-gray-300 font-medium">{designer.email}</td>
                                <td className="py-4 px-2 text-gray-300 font-medium">{designer.shopName || 'No shop yet'}</td>
                                <td className="py-4 px-2 text-right">
                                  {designer.shopName && (
                                    <Link
                                      to={`/shop/${designer.shopName.toLowerCase().replace(/\s+/g, '-')}`}
                                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-primary-500/20 hover:text-primary-400 transition-all border border-white/10"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Shop
                                    </Link>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-white uppercase italic">Order Management</h2>
                      <button
                        onClick={fetchAllData}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/15 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Email</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Payment</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="text-left py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                            <th className="text-right py-4 px-2 text-xs font-black text-gray-400 uppercase tracking-widest">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                                No orders found.
                              </td>
                            </tr>
                          ) : (
                            orders.map((order, idx) => (
                              <tr
                                key={order.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-all"
                              >
                                <td className="py-4 px-2">
                                  <span className="font-black text-white">#{order.id.slice(-6)}</span>
                                </td>
                                <td className="py-4 px-2 text-gray-300 font-medium">{order.customerName}</td>
                                <td className="py-4 px-2 text-gray-300 font-medium">{order.customerEmail}</td>
                                <td className="py-4 px-2 text-gray-300 font-medium">KES {(order.totalAmount || 0).toLocaleString()}</td>
                                <td className="py-4 px-2">
                                  <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                    order.paymentType === 'full' 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  )}>
                                    {order.paymentType === 'full' ? 'Full Payment' : `Deposit`}
                                  </span>
                                </td>
                                <td className="py-4 px-2">
                                  <span className={clsx(
                                    "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border",
                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                                    order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                    'bg-white/10 text-gray-400 border-white/20'
                                  )}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-4 px-2 text-gray-300 font-medium">
                                  {new Date(order.createdAt || '').toLocaleDateString()}
                                </td>
                                <td className="py-4 px-2 text-right">
                                  <button
                                    onClick={() => {
                                      const items = (order as any).items || [];
                                      alert(`Order Details:\n${JSON.stringify(items, null, 2)}`);
                                    }}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-400 hover:bg-primary-500/20 transition-all border border-white/10"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bg-video' && (
                  <motion.div
                    key="bg-video"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <h2 className="text-2xl font-black text-white uppercase italic">Background Video Settings</h2>

                    <div>
                      <label className="block text-sm font-black text-gray-300 uppercase tracking-widest mb-3">
                        Upload Video (MP4) or Enter URL
                      </label>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/mp4"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="bg-video-upload"
                      />
                      <label
                        htmlFor="bg-video-upload"
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/15 transition-all cursor-pointer border border-white/10"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Video File
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-300 uppercase tracking-widest mb-3">
                        Or Enter Video URL
                      </label>
                      <input
                        type="url"
                        value={bgVideoUrl}
                        onChange={(e) => setBgVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/10 focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    {bgVideoUrl && (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-video max-w-md">
                          <video
                            src={bgVideoUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={saveBgVideo}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-black uppercase tracking-widest text-xs hover:bg-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25"
                          >
                            <Check className="w-4 h-4" />
                            Save Video
                          </button>
                          <button
                            onClick={() => setBgVideoUrl('')}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-gray-300 font-black uppercase tracking-widest text-xs hover:bg-white/15 transition-all disabled:opacity-50 border border-white/10"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {!bgVideoUrl && (
                      <p className="text-sm text-gray-400 font-medium">
                        Upload an MP4 video or enter a URL to use as the website background. The video will be stored and displayed on the homepage.
                      </p>
                    )}
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <h2 className="text-2xl font-black text-white uppercase italic">Site Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Globe className="w-8 h-8 text-primary-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2">Site Info</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage global site settings and configuration</p>
                        <button className="px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 font-black uppercase tracking-widest text-xs border border-primary-500/30 hover:bg-primary-500/30 transition-all">
                          Configure
                        </button>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Database className="w-8 h-8 text-green-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2">Database</h3>
                        <p className="text-sm text-gray-400 mb-4">View database statistics and performance</p>
                        <button className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-black uppercase tracking-widest text-xs border border-green-500/30 hover:bg-green-500/30 transition-all">
                          View Stats
                        </button>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Lock className="w-8 h-8 text-yellow-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2">Security</h3>
                        <p className="text-sm text-gray-400 mb-4">Manage admin access and permissions</p>
                        <button className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 font-black uppercase tracking-widest text-xs border border-yellow-500/30 hover:bg-yellow-500/30 transition-all">
                          Manage
                        </button>
                      </div>
                      
                      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <Activity className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-lg font-black text-white mb-2">Analytics</h3>
                        <p className="text-sm text-gray-400 mb-4">View site analytics and metrics</p>
                        <button className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-xs border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                          View Analytics
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 border-t border-white/5 bg-white/5">
              <h2 className="text-2xl font-black text-white mb-8 uppercase italic">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest border-white/20 text-gray-300 hover:bg-white/10">
                    View Shop
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest border-white/20 text-gray-300 hover:bg-white/10">
                    Home
                  </Button>
                </Link>
                <Link to="/designer">
                  <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest border-primary/20 text-primary-400 hover:bg-primary-500/10">
                    Design Studio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;