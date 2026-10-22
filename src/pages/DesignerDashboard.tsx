import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { db } from '../db';
import { designerDesigns, designers, orders } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { 
  Palette, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  ArrowUpRight,
  ExternalLink, 
  Trash2, 
  Star,
  Settings,
  BarChart3,
  LogOut,
  RefreshCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Preloader from '../components/ui/Preloader';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const dashboardProfilesInFlight = new Map<string, Promise<any | null>>();
const dashboardDesignsInFlight = new Map<string, Promise<any[]>>();
let dashboardOrdersInFlight: Promise<{ items: any }[]> | null = null;

const loadDashboardProfile = (userId: string) => {
  const pending = dashboardProfilesInFlight.get(userId);
  if (pending) return pending;

  const request = db.select({ id: designers.id, heroImage: designers.heroImage })
    .from(designers)
    .where(eq(designers.userId, userId))
    .limit(1)
    .then((profiles) => profiles[0] ?? null);
  dashboardProfilesInFlight.set(userId, request);
  request.then(
    () => dashboardProfilesInFlight.delete(userId),
    () => dashboardProfilesInFlight.delete(userId),
  );
  return request;
};

const loadDashboardDesigns = (designerId: string) => {
  const pending = dashboardDesignsInFlight.get(designerId);
  if (pending) return pending;

  // Exclude design_data, which can contain large canvas JSON and is only needed in the editor.
  const request = db.select({
      id: designerDesigns.id,
      name: designerDesigns.name,
      productId: designerDesigns.productId,
      preview: designerDesigns.preview,
      isFeatured: designerDesigns.isFeatured,
      price: designerDesigns.price,
      createdAt: designerDesigns.createdAt,
    }).from(designerDesigns).where(eq(designerDesigns.designerId, designerId));

  dashboardDesignsInFlight.set(designerId, request);
  request.then(
    () => dashboardDesignsInFlight.delete(designerId),
    () => dashboardDesignsInFlight.delete(designerId),
  );
  return request;
};

const loadDashboardOrders = () => {
  if (dashboardOrdersInFlight) return dashboardOrdersInFlight;
  const request = db.select({ items: orders.items }).from(orders);
  dashboardOrdersInFlight = request;
  request.then(
    () => { if (dashboardOrdersInFlight === request) dashboardOrdersInFlight = null; },
    () => { if (dashboardOrdersInFlight === request) dashboardOrdersInFlight = null; },
  );
  return request;
};

const DesignerDashboard: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'designs' | 'shop' | 'settings'>('overview');
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [isDesignsLoading, setIsDesignsLoading] = useState(true);
  const [salesSummaryUnavailable, setSalesSummaryUnavailable] = useState(false);
  const [dashboardNotice, setDashboardNotice] = useState('');
  const [retryCount, setRetryCount] = useState(0);
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
      await deleteAccount();
      alert('Your designer account and all associated data have been permanently deleted.');
      navigate('/', { replace: true });
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
    if (!user) return;
    let active = true;
    setIsLoading(true);
    setIsDesignsLoading(true);
    setIsSalesLoading(true);
    setSalesSummaryUnavailable(false);
    setDashboardNotice('');

    const fetchDashboard = async () => {
      try {
        const profile = await loadDashboardProfile(user.id);
        if (!active) return;
        if (!profile) {
          setHeroImage(null);
          setMyDesigns([]);
          setStats({ totalDesigns: 0, totalSales: 0, revenue: 0 });
          setDashboardNotice('Your designer profile could not be found. Try again or contact support.');
          setIsDesignsLoading(false);
          setIsSalesLoading(false);
          return;
        }

        setHeroImage(profile.heroImage);
        setIsLoading(false);

        // Paint the profile shell before requesting the image previews for the catalog.
        const designs = await loadDashboardDesigns(profile.id);
        if (!active) return;
        setMyDesigns(designs.map((design) => ({ ...design, sales: 0 })));
        setStats({ totalDesigns: designs.length, totalSales: 0, revenue: 0 });
        setIsDesignsLoading(false);

        if (designs.length === 0) {
          setIsSalesLoading(false);
          return;
        }

        // Sales are useful, but should never hold the studio behind a large orders query.
        try {
          const allOrders = await loadDashboardOrders();
          if (!active) return;
          const salesByDesign = new Map<string, number>();
          allOrders.forEach((order) => {
            (Array.isArray(order.items) ? order.items : []).forEach((item: any) => {
              const designId = item?.design?.id;
              if (!designId) return;
              salesByDesign.set(designId, (salesByDesign.get(designId) || 0) + (Number(item.quantity) || 1));
            });
          });

          let totalSales = 0;
          let revenue = 0;
          const designsWithSales = designs.map((design) => {
            const sales = salesByDesign.get(design.id) || 0;
            totalSales += sales;
            revenue += sales * (Number(design.price) || 0) * 0.7;
            return { ...design, sales };
          });
          setMyDesigns(designsWithSales);
          setStats({ totalDesigns: designs.length, totalSales, revenue: Math.round(revenue) });
        } catch (err) {
          // Keep the core dashboard available if the order service is temporarily offline.
          console.warn('Designer sales summary is temporarily unavailable.', err instanceof Error ? err.name : 'Unknown error');
          if (active) setSalesSummaryUnavailable(true);
        } finally {
          if (active) setIsSalesLoading(false);
        }
      } catch (err) {
        console.error('Unable to load designer dashboard.', err instanceof Error ? err.name : 'Unknown error');
        if (active) {
          setSalesSummaryUnavailable(true);
          setIsSalesLoading(false);
          setIsDesignsLoading(false);
          setDashboardNotice('We couldn’t reach your studio data. Check your connection and try again.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchDashboard();
    return () => { active = false; };
  }, [user, retryCount]);

  return (
    <Layout>
      <Preloader isLoading={isLoading} />

      <div className="creator-dashboard relative z-10 min-h-screen bg-transparent text-white py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="creator-dashboard-layout flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <aside className="creator-dashboard-sidebar lg:w-[270px] flex-shrink-0">
              <div className="creator-sidebar-panel bg-slate-950/55 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-7 shadow-2xl border border-white/10 sticky top-28">
                <div className="flex flex-col items-center mb-10 pb-10 border-b border-white/5">
                  <div className="relative mb-6">
                    <div className="creator-avatar w-20 h-20 rounded-[1.6rem] flex items-center justify-center text-white shadow-2xl shadow-primary-600/20">
                      <Palette className={clsx('w-9 h-9', isUploading && 'animate-spin')} />
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-all">
                      <Plus className="w-5 h-5 text-white" />
                      <input type="file" className="hidden" onChange={handleHeroUpload} accept="image/*" disabled={isUploading} />
                    </label>
                  </div>
                  <h2 className="text-lg font-black text-white mb-2 tracking-tight text-center">Creator studio</h2>
                  <p className="max-w-full truncate text-primary-300 font-bold uppercase tracking-[0.2em] text-[9px] text-center">{user?.name}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[.07] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.15em] text-emerald-200/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Studio active</span>
                </div>

                <nav className="creator-dashboard-nav space-y-2" aria-label="Creator dashboard sections">
                  {[
                    { id: 'overview', icon: BarChart3, label: 'Performance' },
                    { id: 'designs', icon: Palette, label: 'My Creations' },
                    { id: 'shop', icon: ShoppingBag, label: 'Shop Settings' },
                    { id: 'settings', icon: Settings, label: 'Security' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold uppercase tracking-[.12em] text-[9px] transition-all duration-200",
                        activeTab === item.id 
                          ? 'bg-primary-400/15 text-white border border-primary-300/20 shadow-lg shadow-primary-900/15'
                          : 'border border-transparent text-white/50 hover:bg-white/[.055] hover:text-white'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-white/10 my-5" />
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold uppercase tracking-[.12em] text-[9px] text-red-300/75 hover:bg-red-400/10 hover:text-red-200 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Terminate Session
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="creator-dashboard-main min-w-0 flex-grow space-y-7">
              <header className="creator-dashboard-heading relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-6 sm:p-8 backdrop-blur-2xl">
                {heroImage && <img src={heroImage} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.14]" />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/45 to-slate-950/65" />
                <div className="relative z-10">
                <div>
                  <p className="mb-3 text-[9px] font-black uppercase tracking-[.24em] text-primary-300">Crownstroke <span className="mx-1 text-white/25">/</span> Creator studio</p>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-[-.045em] text-white">Welcome back, {user?.name?.split(' ')[0] || 'creator'}.</h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">Your work, shop, and sales at a glance. Keep making things worth sharing.</p>
                </div>
                </div>
                <div className="relative z-10">
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to="/designer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-400 px-4 text-[9px] font-black uppercase tracking-[.12em] text-slate-950 transition hover:bg-primary-300"><Plus className="h-4 w-4" /> New design</Link>
                  {user?.shopName && <Link to={`/shop/${user.shopName.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-4 text-[9px] font-bold uppercase tracking-[.12em] text-white/75 transition hover:bg-white/10 hover:text-white">View shop <ArrowUpRight className="h-4 w-4" /></Link>}
                </div>
                </div>
              </header>
              {dashboardNotice && (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200/15 bg-amber-200/[.06] px-4 py-4 text-sm text-amber-100/85 sm:flex-row sm:items-center sm:justify-between">
                  <span>{dashboardNotice}</span>
                  <button onClick={() => setRetryCount((count) => count + 1)} className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-amber-100/15 px-3 py-2 text-[8px] font-black uppercase tracking-widest transition hover:bg-amber-100/10 sm:self-auto"><RefreshCcw className="h-3.5 w-3.5" /> Retry</button>
                </div>
              )}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[
                        { label: 'Designs', value: isDesignsLoading ? '—' : stats.totalDesigns, caption: isDesignsLoading ? 'Loading catalog' : 'In your catalog', icon: Palette, color: 'text-primary-400' },
                        { label: 'Units sold', value: isSalesLoading || salesSummaryUnavailable ? '—' : stats.totalSales, caption: isSalesLoading ? 'Updating sales' : salesSummaryUnavailable ? 'Temporarily unavailable' : 'Across all orders', icon: ShoppingBag, color: 'text-green-400' },
                        { label: 'Estimated earnings', value: isSalesLoading || salesSummaryUnavailable ? '—' : `KES ${(stats.revenue ?? 0).toLocaleString()}`, caption: salesSummaryUnavailable ? 'Sales summary unavailable' : '70% designer share', icon: TrendingUp, color: 'text-purple-400' },
                      ].map((stat, i) => (
                        <div key={i} className="creator-metric-card relative overflow-hidden bg-slate-950/45 rounded-[1.5rem] p-5 sm:p-6 shadow-xl border border-white/10 group hover:border-primary-300/25 transition-all">
                          <div className={`w-10 h-10 rounded-xl bg-white/[.07] border border-white/[.06] flex items-center justify-center mb-6 ${stat.color}`}>
                             <stat.icon className="w-5 h-5" />
                          </div>
                          <p className="text-[9px] font-bold text-white/45 uppercase tracking-[0.18em] mb-2">{stat.label}</p>
                          <h4 className="text-3xl font-black text-white tracking-tight">{stat.value}</h4>
                          <p className="mt-2 text-[9px] font-medium text-white/35">{stat.caption}</p>
                          <div className="absolute -right-6 -bottom-8 h-24 w-24 rounded-full bg-primary-400/[.07] blur-2xl transition group-hover:bg-primary-400/[.14]" />
                        </div>
                      ))}
                    </div>

                    <section className="creator-overview-panel overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/45 shadow-xl backdrop-blur-2xl">
                      <div className="flex flex-col gap-4 border-b border-white/[.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[.22em] text-primary-300">Studio snapshot</p>
                          <h3 className="mt-2 text-lg font-black tracking-tight text-white">Top designs</h3>
                        </div>
                        <button onClick={() => setActiveTab('designs')} className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[.12em] text-white/65 transition hover:bg-white/[.06] hover:text-white sm:self-auto">All designs <ArrowRight className="h-3.5 w-3.5" /></button>
                      </div>
                      {isDesignsLoading ? (
                        <div className="divide-y divide-white/[.07]" aria-label="Loading designs">
                          {[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-4 px-5 py-4 sm:px-6"><div className="h-14 w-14 animate-pulse rounded-xl bg-white/[.06]" /><div className="flex-1 space-y-2"><div className="h-3 w-2/3 animate-pulse rounded bg-white/[.07]" /><div className="h-2 w-1/3 animate-pulse rounded bg-white/[.05]" /></div><div className="h-8 w-8 animate-pulse rounded-lg bg-white/[.06]" /></div>)}
                        </div>
                      ) : myDesigns.length ? (
                        <div className="divide-y divide-white/[.07]">
                          {[...myDesigns].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 3).map((design, index) => (
                            <div key={design.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                              <span className="w-5 text-[9px] font-black text-white/30">0{index + 1}</span>
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[.04]">
                                {design.preview ? <img src={design.preview} alt="" className="h-full w-full object-cover" /> : <Palette className="m-auto h-5 w-5 text-white/25" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-white">{design.name}</p>
                                <p className="mt-1 truncate text-[8px] font-semibold uppercase tracking-[.13em] text-white/40">{design.productId || 'Design'}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-xs font-black text-white">{design.sales || 0}</p>
                                <p className="mt-1 text-[8px] font-semibold uppercase tracking-widest text-white/40">sold</p>
                              </div>
                              <Link to={`/designer?edit=${design.id}`} aria-label={`Edit ${design.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/55 transition hover:border-primary-300/30 hover:bg-primary-400/10 hover:text-white"><ArrowUpRight className="h-4 w-4" /></Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-3 px-5 py-9 sm:px-6">
                          <p className="text-sm font-bold text-white">Your first design starts here.</p>
                          <p className="text-xs text-white/45">Create a product design and it will appear in your studio snapshot.</p>
                          <Link to="/designer" className="mt-1 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary-300 hover:text-primary-200">Start designing <ArrowRight className="h-4 w-4" /></Link>
                        </div>
                      )}
                    </section>
                  </motion.div>
                )}

                {activeTab === 'designs' && (
                  <motion.div 
                    key="designs"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="creator-designs-tab space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5 sm:p-6">
                       <div><p className="text-[8px] font-black uppercase tracking-[.22em] text-primary-300">Your catalog</p><h3 className="mt-2 text-xl font-black text-white tracking-tight">Your designs</h3></div>
                       <Link to="/designer">
                         <Button variant="premium" className="w-full sm:w-auto rounded-xl px-5 py-3.5 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                           <Plus className="w-4 h-4" /> Create a design
                         </Button>
                       </Link>
                    </div>

                    <div className="creator-design-grid grid grid-cols-1 md:grid-cols-2 gap-5">
                       {isDesignsLoading && [0, 1].map((item) => <div key={item} className="aspect-[1.1] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/[.04]" />)}
                       {myDesigns.map((design) => (
                         <div key={design.id} className="creator-design-card bg-slate-950/50 border border-white/10 rounded-[1.75rem] overflow-hidden group hover:border-primary-300/30 transition-all">
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
                                  <div className="text-2xl font-black italic">KES {(design.price ?? 0).toLocaleString()}</div>
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
                    {!isDesignsLoading && !myDesigns.length && (
                      <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-slate-950/35 px-6 py-12 text-center">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary-300/15 bg-primary-400/10 text-primary-300"><Palette className="h-6 w-6" /></div>
                        <h4 className="mt-5 text-base font-bold text-white">Your catalog is ready for its first design</h4>
                        <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/45">Use the design studio to create a product, then it will appear here for editing and management.</p>
                        <Link to="/designer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-400 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-950 transition hover:bg-primary-300">Open design studio <ArrowRight className="h-4 w-4" /></Link>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'shop' && (
                  <motion.div 
                    key="shop"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="creator-shop-panel bg-slate-950/45 backdrop-blur-3xl rounded-[1.75rem] p-5 sm:p-8 shadow-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Shop Configuration</h3>
{user?.shopName ? (
                        <Link to={`/shop/${user.shopName.toLowerCase().replace(/\s+/g, '-')}`}>
                          <Button variant="outline" className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] gap-2">
                            <ExternalLink className="w-4 h-4" /> View Live Shop
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" className="rounded-xl px-8 py-4 font-black uppercase tracking-widest text-[10px] gap-2" disabled>
                          <ExternalLink className="w-4 h-4" /> Shop Not Configured
                        </Button>
                      )}
                    </div>

                    <div className="space-y-8">
                       <div className="bg-black/40 border border-white/5 p-10 rounded-[2.5rem] space-y-6">
                          <div>
                             <h5 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-2 italic">Global Vector</h5>
                             <p className="text-lg font-bold text-white">crownstroke.com/shop/<span className="text-primary-400">{user?.shopName ? user.shopName.toLowerCase().replace(/\s+/g, '-') : 'shop'}</span></p>
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
                    className="creator-settings-panel bg-slate-950/45 backdrop-blur-3xl rounded-[1.75rem] p-5 sm:p-8 shadow-2xl border border-white/10"
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
