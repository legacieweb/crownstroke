import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { db } from '../db';
import { designerDesigns, designers, shops, orders } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { 
  Palette, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Star,
  Settings,
  LayoutGrid,
  BarChart3,
  LogOut,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  X,
  Package,
  MapPin,
  Eye,
  Type,
  Layers,
  Box,
  MousePointer2
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import videoSrc from '../assets/42154-431423229.mp4';

const DesignerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'designs' | 'shop' | 'settings'>('overview');
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isUploading, setIsProcessing] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<any | null>(null);
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalSales: 0,
    revenue: 0
  });

  const deleteDesign = async () => {
    if (!designToDelete) return;
    try {
      await db.delete(designerDesigns).where(eq(designerDesigns.id, designToDelete.id));
      setMyDesigns(prev => prev.filter(d => d.id !== designToDelete.id));
      setShowDeleteModal(false);
      setDesignToDelete(null);
      alert('Design successfully purged from your collection.');
    } catch (err) {
      console.error('Failed to delete design:', err);
      alert('Failed to delete design.');
    }
  };

  const terminateAccount = async () => {
    if (!user) return;
    try {
      const designer = await db.select().from(designers).where(eq(designers.userId, user.id)).limit(1);
      if (designer.length > 0) {
        const dId = designer[0].id;
        await db.delete(designerDesigns).where(eq(designerDesigns.designerId, dId));
        await db.delete(shops).where(eq(shops.designerId, dId));
        await db.delete(designers).where(eq(designers.id, dId));
        alert('Your designer account and all associated data have been permanently deleted.');
        logout();
      }
    } catch (err) {
      console.error('Failed to terminate account:', err);
      alert('Critical failure during termination protocol.');
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (f) => {
      const base64 = f.target?.result as string;
      try {
        await db.update(designers)
          .set({ heroImage: base64 })
          .where(eq(designers.userId, user.id));
        
        setHeroImage(base64);
        alert('Hero image updated successfully!');
      } catch (err) {
        console.error('Failed to update hero image:', err);
        alert('Failed to update hero image.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchDesignerData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Optimized: Fetch designer profile first then use ID
        const designer = await db.select()
          .from(designers)
          .where(eq(designers.userId, user.id))
          .limit(1);

        if (designer.length > 0) {
          const dProfile = designer[0];
          setHeroImage(dProfile.heroImage);
          
          // Fetch everything else in parallel for speed
          const [designs, allOrders] = await Promise.all([
            db.select().from(designerDesigns).where(eq(designerDesigns.designerId, dProfile.id)),
            db.select().from(orders)
          ]);
          
          // Calculate real sales from orders
          let totalSalesCount = 0;
          let totalEarnings = 0;

          const updatedDesigns = designs.map(design => {
            let designSales = 0;
            allOrders.forEach(order => {
              const orderItems = (order.items as any[]) || [];
              orderItems.forEach(item => {
                if (item.design && item.design.id === design.id) {
                  designSales += item.quantity || 1;
                }
              });
            });

            totalSalesCount += designSales;
            totalEarnings += designSales * (design.price * 0.7);

            return {
              ...design,
              sales: designSales
            };
          });
          
          setMyDesigns(updatedDesigns);
          
          setStats({
            totalDesigns: designs.length,
            totalSales: totalSalesCount,
            revenue: Math.round(totalEarnings)
          });
        }
      } catch (err) {
        console.error('Error fetching designer data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignerData();
  }, [user]);

  return (
    <Layout>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <Palette className="w-10 h-10 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Synchronizing Pulse</h2>
              <p className="text-primary-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Accessing Designer Network...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 min-h-screen bg-transparent text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/10 sticky top-28">
                <div className="flex flex-col items-center mb-10 pb-10 border-b border-white/5">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-600/20">
                      <Palette className="w-12 h-12" />
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-all">
                      <Plus className="w-5 h-5 text-white" />
                      <input type="file" className="hidden" onChange={handleHeroUpload} accept="image/*" />
                    </label>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2 italic uppercase tracking-tighter text-center">Creator Hub</h2>
                  <p className="text-primary-400 font-black uppercase tracking-[0.3em] text-[10px] text-center">{user?.name}</p>
                </div>

                <nav className="space-y-4">
                  {[
                    { id: 'overview', icon: BarChart3, label: 'Performance' },
                    { id: 'designs', icon: Palette, label: 'My Creations' },
                    { id: 'shop', icon: ShoppingBag, label: 'Shop Settings' },
                    { id: 'settings', icon: Settings, label: 'Security' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={clsx(
                        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300",
                        activeTab === item.id 
                          ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20 translate-x-2' 
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-white/5 my-6" />
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Terminate Session
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow space-y-10">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { label: 'Artifacts', value: stats.totalDesigns, icon: Palette, color: 'text-primary-400' },
                        { label: 'Units Sold', value: stats.totalSales, icon: ShoppingBag, color: 'text-green-400' },
                        { label: 'Est. Revenue', value: `KES ${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/5 rounded-[2.5rem] p-10 shadow-2xl border border-white/10 group hover:border-primary-500/30 transition-all">
                          <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${stat.color}`}>
                             <stat.icon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                          <h4 className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</h4>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white/5 rounded-[3.5rem] p-12 shadow-2xl border border-white/10 relative overflow-hidden">
                       {heroImage && <img src={heroImage} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm" alt="Stats BG" />}
                       <div className="relative z-10">
                         <h3 className="text-3xl font-black text-white mb-10 italic uppercase tracking-tighter">Designer Pulse</h3>
                         <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                            <BarChart3 className="w-20 h-20 text-white/10 mb-8 animate-pulse" />
                            <p className="text-white/40 font-black uppercase tracking-widest italic text-xs">Real-time performance stream synchronized</p>
                         </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'designs' && (
                  <motion.div 
                    key="designs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex items-center justify-between">
                       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">My Creations</h3>
                       <Link to="/designer">
                         <Button variant="premium" className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform flex items-center gap-2">
                           <Plus className="w-4 h-4" /> Deploy New Asset
                         </Button>
                       </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {myDesigns.map((design) => (
                         <div key={design.id} className="bg-black/40 border border-white/5 rounded-[3rem] overflow-hidden group hover:border-primary-500/30 transition-all">
                            <div className="relative aspect-square">
                               <img src={design.preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={design.name} />
                               <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                               <div className="absolute top-6 right-6">
                                 <div className={clsx(
                                   "w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/10",
                                   design.isFeatured === 'true' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" : "bg-black/40 text-white/40"
                                 )}>
                                   <Star className="w-5 h-5" fill={design.isFeatured === 'true' ? "currentColor" : "none"} />
                                 </div>
                               </div>
                               <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                                  <div>
                                     <h4 className="text-2xl font-black uppercase italic tracking-tighter">{design.name}</h4>
                                     <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{design.productId}</p>
                                  </div>
                                  <div className="text-2xl font-black italic">KES {design.price.toLocaleString()}</div>
                               </div>
                            </div>
                            <div className="p-8 grid grid-cols-2 gap-4">
                               <Link to={`/designer?edit=${design.id}`} className="flex-1">
                                 <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3">
                                   <Settings className="w-4 h-4" /> Edit Asset
                                 </button>
                               </Link>
                               <button 
                                 onClick={() => {
                                   setDesignToDelete(design);
                                   setShowDeleteModal(true);
                                 }}
                                 className="flex-1 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10 flex items-center justify-center gap-3"
                               >
                                 <Trash2 className="w-4 h-4" /> Purge
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'shop' && (
                  <motion.div 
                    key="shop"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-12 shadow-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Shop Configuration</h3>
                       <Link to={`/shop/${user?.shopName}`}>
                         <Button variant="outline" className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] gap-2">
                           <ExternalLink className="w-4 h-4" /> View Live Shop
                         </Button>
                       </Link>
                    </div>

                    <div className="space-y-8">
                       <div className="bg-black/40 border border-white/5 p-10 rounded-[2.5rem] space-y-6">
                          <div>
                             <h5 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 italic">Global Vector</h5>
                             <p className="text-lg font-bold text-white">crownstroke.com/shop/<span className="text-primary-400">{user?.shopName}</span></p>
                          </div>
                          <div className="h-px bg-white/5" />
                          <div className="flex items-center justify-between">
                             <div>
                               <h5 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 italic">Visibility Protocol</h5>
                               <p className="text-xs text-green-400 font-bold uppercase tracking-tight">Active & Synchronized</p>
                             </div>
                             <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                          </div>
                       </div>

                       <div className="bg-primary-500/10 border border-primary-500/20 rounded-[2.5rem] p-10">
                          <h5 className="text-[10px] font-black uppercase text-primary-400 tracking-[0.2em] mb-4 italic">Designer Protocol Tip</h5>
                          <p className="text-sm text-white/80 font-medium leading-relaxed">
                            Elite designers who update their hero backgrounds every 30 days see a <span className="text-white font-black">40% increase</span> in user engagement. Maintain your aesthetic.
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-12 shadow-2xl border border-white/10"
                  >
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-12">Security Terminal</h3>
                    
                    <div className="space-y-12">
                       <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Core Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Entity Name</span>
                                <span className="text-sm font-bold">{user?.name}</span>
                             </div>
                             <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Communication Channel</span>
                                <span className="text-sm font-bold">{user?.email}</span>
                             </div>
                          </div>
                       </div>

                       <div className="pt-12 border-t border-white/5">
                          <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest italic mb-6">Danger Zone</h4>
                          <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="max-w-md">
                                <h5 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Self-Termination Protocol</h5>
                                <p className="text-xs text-white/40 font-bold leading-relaxed">
                                   Once initiated, this will permanently purge your designer profile, your shop, and all uploaded designs from the ecosystem. This cannot be reversed.
                                </p>
                             </div>
                             <Button 
                               onClick={() => setShowTerminateModal(true)}
                               className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 whitespace-nowrap"
                             >
                               Initiate Termination
                             </Button>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      {/* Delete Design Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-[#0a0a0a] rounded-[3rem] p-12 border border-red-500/20 shadow-2xl">
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                  <Trash2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-red-500">Purge Asset</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Permanent removal of "{designToDelete?.name}"</p>
              </div>
              <div className="space-y-4">
                <Button onClick={deleteDesign} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20">Confirm Purge</Button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 text-center text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Abort</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terminate Account Modal */}
      <AnimatePresence>
        {showTerminateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTerminateModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-[#0a0a0a] rounded-[3rem] p-12 border border-red-500/20 shadow-2xl">
              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-red-500">Self-Termination</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  You are about to initiate the self-termination protocol. This will permanently erase your legacy from the Crownstroke network.
                </p>
              </div>
              <div className="space-y-4">
                <Button onClick={terminateAccount} className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20">Confirm Termination</Button>
                <button onClick={() => setShowTerminateModal(false)} className="w-full py-4 text-center text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Abort Protocol</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default DesignerDashboard;
