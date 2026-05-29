import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../db';
import { users, designers, shops, orders, designerDesigns, siteSettings } from '../db/schema';
import { Users, ShoppingBag, DollarSign, LogOut, Trash2, Eye, Store, Palette, Check, X, Loader2, RefreshCw, Video, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import { eq } from 'drizzle-orm';

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

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigners: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designersList, setDesignersList] = useState<Designer[]>([]);
  const [bgVideoUrl, setBgVideoUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'designs' | 'designers' | 'bg-video'>('designs');

  useEffect(() => {
    fetchAllData();
    loadBgVideo();
  }, []);

  const fetchAllData = async () => {
    try {
      const [userResults, designerResults, orderResults, allDesigns, allShops, allUsers] = await Promise.all([
        db.select().from(users),
        db.select().from(designers),
        db.select().from(orders),
        db.select().from(designerDesigns),
        db.select().from(shops),
        db.select().from(users)
      ]);

      const revenue = orderResults.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const designsWithInfo = await Promise.all(allDesigns.map(async (d: any) => {
        const designer = allUsers.find(u => u.id === d.designerId?.toString() || u.id === d.designerId);
        const shop = allShops.find(s => s.id === d.shopId?.toString() || s.id === d.shopId);
        return {
          ...d,
          id: d.id.toString(),
          designerId: d.designerId?.toString() || '',
          shopId: d.shopId?.toString() || '',
          designerName: designer?.name || 'Unknown',
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

      setStats({
        totalUsers: userResults.length,
        totalDesigners: designerResults.length,
        totalOrders: orderResults.length,
        totalRevenue: revenue
      });
      setDesigns(designsWithInfo);
      setDesignersList(designersWithShops);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
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
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBgVideoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveBgVideo = async () => {
    if (!bgVideoUrl) return;
    
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
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
      setUpdateMsg({ type: 'error', text: 'Failed to save background video' });
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

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
              Admin <span className="text-primary-600">Panel</span>
            </h1>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-600' },
              { label: 'Designers', value: stats.totalDesigners, icon: ShoppingBag, color: 'text-green-600' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600' },
              { label: 'Revenue', value: `KES ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            ))}
          </div>

          {updateMsg && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${
              updateMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {updateMsg.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span className="font-medium text-sm">{updateMsg.text}</span>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('designs')}
                className={`flex-1 px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'designs' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-slate-50/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Manage Designs
              </button>
              <button
                onClick={() => setActiveTab('designers')}
                className={`flex-1 px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'designers' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-slate-50/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Store className="w-4 h-4 inline mr-2" />
                View Designers & Shops
              </button>
              <button
                onClick={() => setActiveTab('bg-video')}
                className={`flex-1 px-8 py-6 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'bg-video' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-slate-50/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Background Video
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'designs' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic">Design Management</h2>
                    <button
                      onClick={fetchAllData}
                      disabled={false}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Design</th>
                          <th className="text-left py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Product</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Editor's Pick</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Featured (Home)</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Exclusive</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Spring</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Minimalist</th>
                          <th className="text-center py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Flash Sale</th>
                          <th className="text-right py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designs.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                              No designs found. Add some designs in the shop!
                            </td>
                          </tr>
                        ) : (
                          designs.map((design) => (
                            <tr key={design.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <img src={design.preview} alt={design.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <span className="font-black text-slate-900">{design.name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-slate-700 font-medium">{design.productId}</td>
                              
                              {['isEditorsPick', 'isFeatured', 'isExclusive', 'isSpringCollection', 'isMinimalist', 'isFlashSale'].map(field => (
                                <td key={field} className="py-4 px-2 text-center">
                                  <button
                                    onClick={() => updateDesignFlag(design.id, field, design[field as keyof Design] === 'true' ? 'false' : 'true')}
                                    disabled={isUpdating}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all mx-auto disabled:opacity-50 ${
                                      design[field as keyof Design] === 'true' 
                                        ? 'bg-primary-600 text-white' 
                                        : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                    }`}
                                  >
                                    {design[field as keyof Design] === 'true' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                  </button>
                                </td>
                              ))}

                              <td className="py-4 px-2 text-right">
                                <button
                                  onClick={() => deleteDesign(design.id)}
                                  disabled={isUpdating}
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
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
                </div>
              )}

              {activeTab === 'designers' && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-8">Designers & Shops</h2>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Designer</th>
                          <th className="text-left py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Email</th>
                          <th className="text-left py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Shop Name</th>
                          <th className="text-right py-4 px-2 text-xs font-black text-slate-500 uppercase tracking-widest">Shop Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designersList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-500 font-medium">
                              No designers found.
                            </td>
                          </tr>
                        ) : (
                          designersList.map((designer) => (
                            <tr key={designer.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                                    {designer.heroImage ? (
                                      <img src={designer.heroImage} alt={designer.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Palette className="w-5 h-5 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <span className="font-black text-slate-900">{designer.name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-2 text-slate-700 font-medium">{designer.email}</td>
                              <td className="py-4 px-2 text-slate-700 font-medium">{designer.shopName || 'No shop yet'}</td>
                              <td className="py-4 px-2 text-right">
                                {designer.shopName && (
                                  <Link
                                    to={`/shop/${designer.shopName.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-primary-600 hover:text-white transition-all"
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
                </div>
              )}

              {activeTab === 'bg-video' && (
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 uppercase italic">Background Video</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                        Upload Video (MP4)
                      </label>
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="bg-video-upload"
                      />
                      <label
                        htmlFor="bg-video-upload"
                        className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Choose Video File
                      </label>
                    </div>

                    {bgVideoUrl && (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video max-w-md">
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
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-black uppercase tracking-widest text-xs hover:bg-primary-700 transition-all disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Save Video
                          </button>
                          <button
                            onClick={() => setBgVideoUrl('')}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs hover:bg-slate-300 transition-all disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {!bgVideoUrl && (
                      <p className="text-sm text-slate-500 font-medium">
                        Upload an MP4 video to use as the website background. The video will be stored as a data URL in the database.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30 rounded-b-[2rem]">
              <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase italic">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest">
                    View Shop
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest">
                    Home
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