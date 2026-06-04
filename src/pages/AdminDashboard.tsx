import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../store/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { db } from '../db';
import { users, designers, shops, orders as ordersTable, designerDesigns } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  AlertCircle,
  Check,
  ChevronDown,
  DollarSign,
  Eye,
  LogOut,
  Package,
  Palette,
  RefreshCw,
  Shield,
  ShoppingBag,
  Store,
  Trash2,
  Users,
  X
} from 'lucide-react';
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

interface OrderItem {
  productId?: string;
  name?: string;
  quantity?: number;
  size?: string;
  color?: string;
  price?: number;
  image?: string;
  designerEmail?: string;
  design?: {
    id?: string;
    designerId?: string;
    preview?: string;
    previewImage?: string;
    productId?: string;
  } | null;
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
  items: OrderItem[];
  createdAt: string | Date;
}

const flagFields = [
  { key: 'isEditorsPick', label: "Editor's Pick" },
  { key: 'isFeatured', label: 'Home' },
  { key: 'isExclusive', label: 'Exclusive' },
  { key: 'isSpringCollection', label: 'Spring' },
  { key: 'isMinimalist', label: 'Minimal' },
  { key: 'isFlashSale', label: 'Flash' }
] as const;

const designFlagFields = new Set(flagFields.map((field) => field.key));

const tabs = [
  { id: 'designs', label: 'Designs', icon: Palette },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'designers', label: 'Designers', icon: Store }
] as const;

type AdminTab = typeof tabs[number]['id'];

const normalizeUuid = (v: any): string => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const anyV = v as any;
    if (anyV.type === 'Buffer' && Array.isArray(anyV.data)) {
      const hex = anyV.data.map((b: any) => (Number(b) || 0).toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    if (Array.isArray(anyV.data) && anyV.data.length === 16) {
      const hex = anyV.data.map((b: any) => (Number(b) || 0).toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  }
  return String(v);
};

const normalizeBoolText = (v: any): 'true' | 'false' => {
  if (v === true || v === 'true' || v === 1 || v === '1') return 'true';
  return 'false';
};

const normalizeItems = (items: unknown): OrderItem[] => {
  if (Array.isArray(items)) return items as OrderItem[];
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const money = (value: number | undefined) => `KES ${(value ?? 0).toLocaleString()}`;

const AdminDashboard: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('designs');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigners: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [designs, setDesigns] = useState<Design[]>([]);
  const [designersList, setDesignersList] = useState<Designer[]>([]);
  const [orders, setOrdersList] = useState<Order[]>([]);

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'pending').length, [orders]);
  const featuredDesigns = useMemo(
    () => designs.filter((design) => design.isFeatured === 'true' || design.isEditorsPick === 'true').length,
    [designs]
  );

  const fetchAllData = async () => {
    setIsDashboardLoading(true);
    try {
      const userResults = await db.select().from(users).catch((e: any) => {
        console.error('users query error:', e instanceof Error ? e.message : e);
        return [];
      });

      const designerResults = await db.select().from(designers).catch((e: any) => {
        console.error('designers query error:', e instanceof Error ? e.message : e);
        return [];
      });

      const orderResults = await db.select().from(ordersTable).catch((e: any) => {
        console.error('orders query error:', e instanceof Error ? e.message : e);
        return [];
      });

      const allDesigns = await db.select().from(designerDesigns).catch((e: any) => {
        console.error('designerDesigns query error:', e instanceof Error ? e.message : e);
        return [];
      });

      const allShops = await db.select().from(shops).catch((e: any) => {
        console.error('shops query error:', e instanceof Error ? e.message : e);
        return [];
      });

      const filteredDesigns = (allDesigns || []).filter((d: any) => d && (d.id ?? d.ID ?? null));
      const revenue = orderResults.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      const designsWithInfo = filteredDesigns.map((d: any) => {
        const designerId = d.designerId ?? d.designer_id;
        const shopId = d.shopId ?? d.shop_id;
        const designer = designerResults.find((dsg: any) => normalizeUuid(dsg.id) === normalizeUuid(designerId));
        const designerUser = designer ? userResults.find((u: any) => u.id === designer.userId) : null;
        const shop = allShops.find((s: any) => normalizeUuid(s.id) === normalizeUuid(shopId));

        return {
          ...d,
          id: normalizeUuid(d.id),
          designerId: normalizeUuid(designerId),
          shopId: normalizeUuid(shopId),
          designerName: designerUser?.name || designer?.name || 'Unknown',
          shopName: shop?.name || 'Unknown',
          isEditorsPick: normalizeBoolText(d.isEditorsPick ?? d.is_editors_pick),
          isFeatured: normalizeBoolText(d.isFeatured ?? d.is_featured),
          isExclusive: normalizeBoolText(d.isExclusive ?? d.is_exclusive),
          isSpringCollection: normalizeBoolText(d.isSpringCollection ?? d.is_spring_collection),
          isMinimalist: normalizeBoolText(d.isMinimalist ?? d.is_minimalist),
          isFlashSale: normalizeBoolText(d.isFlashSale ?? d.is_flash_sale)
        } as Design;
      });

      const designersWithShops = (designerResults || [])
        .filter((d: any) => d && d.id)
        .map((d: any) => {
          const designerId = normalizeUuid(d.id);
          return {
            ...d,
            id: designerId,
            userId: d.userId ?? '',
            heroImage: d.heroImage ?? null,
            shopName:
              allShops.find((s: any) => normalizeUuid(s.designerId ?? s.designer_id) === designerId)?.name ||
              null
          };
        }) as Designer[];

      const ordersFormatted = orderResults
        .map((o: any) => ({
          ...o,
          id: normalizeUuid(o.id),
          items: normalizeItems(o.items)
        }))
        .sort((a: Order, b: Order) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) as Order[];

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
      setUpdateMsg({ type: 'error', text: 'Dashboard data could not be refreshed.' });
    } finally {
      setIsDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user?.role === 'admin') {
      fetchAllData();
    }
  }, [isAuthLoading, user?.role]);

  const updateDesignFlag = async (designId: string, field: string, nextValueText: 'true' | 'false') => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      if (!designFlagFields.has(field as any)) {
        throw new Error(`Unknown design flag: ${field}`);
      }

      await db
        .update(designerDesigns)
        .set({ [field]: nextValueText })
        .where(eq(designerDesigns.id, designId as any));

      setDesigns((prev) => prev.map((d) => (d.id === designId ? { ...d, [field]: nextValueText } : d)));
      setUpdateMsg({ type: 'success', text: 'Design visibility updated.' });
    } catch (err) {
      console.error('Failed to update design:', err);
      setUpdateMsg({ type: 'error', text: 'Failed to update design.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteDesign = async (designId: string) => {
    if (!confirm('Delete this design permanently?')) return;
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      await db.delete(designerDesigns).where(eq(designerDesigns.id, designId as any));
      setDesigns((prev) => prev.filter((d) => d.id !== designId));
      setUpdateMsg({ type: 'success', text: 'Design deleted.' });
    } catch (err) {
      console.error('Failed to delete design:', err);
      setUpdateMsg({ type: 'error', text: 'Failed to delete design.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isAuthLoading) {
    return (
      <Layout>
        <Preloader isLoading />
      </Layout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <Layout>
      <Preloader isLoading={isDashboardLoading} />

      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-white/10 bg-zinc-950/80 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-zinc-950">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary-300">Operations Console</p>
                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Admin Dashboard</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchAllData}
                  disabled={isUpdating || isDashboardLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-950 transition hover:bg-primary-100 disabled:opacity-60"
                >
                  <RefreshCw className={clsx('h-4 w-4', isDashboardLoading && 'animate-spin')} />
                  Refresh
                </button>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-200 transition hover:bg-red-500/25"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.header>

          <AnimatePresence>
            {updateMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={clsx(
                  'mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold backdrop-blur-xl',
                  updateMsg.type === 'success'
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-red-400/30 bg-red-500/15 text-red-200'
                )}
              >
                {updateMsg.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {updateMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Revenue', value: money(stats.totalRevenue), icon: DollarSign, tone: 'text-emerald-200', detail: `${stats.totalOrders} paid orders` },
              { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, tone: 'text-sky-200', detail: `${pendingOrders} pending fulfillment` },
              { label: 'Designers', value: stats.totalDesigners, icon: Palette, tone: 'text-fuchsia-200', detail: `${designs.length} marketplace designs` },
              { label: 'Featured', value: featuredDesigns, icon: Eye, tone: 'text-amber-200', detail: 'Promoted designs live' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-lg border border-white/10 bg-zinc-950/75 p-5 backdrop-blur-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{stat.label}</span>
                  <stat.icon className={clsx('h-5 w-5', stat.tone)} />
                </div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <p className="mt-2 text-sm font-medium text-zinc-400">{stat.detail}</p>
              </motion.div>
            ))}
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-2 backdrop-blur-xl">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'inline-flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-xs font-black uppercase tracking-widest transition md:flex-none',
                      activeTab === tab.id
                        ? 'bg-white text-zinc-950'
                        : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Recent Orders</h2>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-primary-300 hover:text-primary-100">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-zinc-500">No orders yet.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                      <div>
                        <p className="text-sm font-black text-white">#{order.id.slice(-6)}</p>
                        <p className="text-xs text-zinc-400">{order.customerName}</p>
                      </div>
                      <span className="text-sm font-black text-emerald-200">{money(order.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <div className="rounded-lg border border-white/10 bg-zinc-950/85 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {activeTab === 'designs' && (
                <motion.section key="designs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">Marketplace Designs</h2>
                      <p className="text-sm text-zinc-400">Promote, curate, or remove designer submissions.</p>
                    </div>
                    <Link to="/designer" className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-400">
                      Open Studio
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-widest text-zinc-500">Design</th>
                          <th className="px-3 py-3 text-left text-xs font-black uppercase tracking-widest text-zinc-500">Shop</th>
                          {flagFields.map((field) => (
                            <th key={field.key} className="px-3 py-3 text-center text-xs font-black uppercase tracking-widest text-zinc-500">
                              {field.label}
                            </th>
                          ))}
                          <th className="px-3 py-3 text-right text-xs font-black uppercase tracking-widest text-zinc-500">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {designs.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-3 py-12 text-center text-sm font-semibold text-zinc-500">
                              No designs found.
                            </td>
                          </tr>
                        ) : (
                          designs.map((design) => (
                            <tr key={design.id} className="border-b border-white/5 transition hover:bg-white/[0.04]">
                              <td className="px-3 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={design.preview} alt={design.name} className="h-14 w-14 rounded-lg border border-white/10 object-cover" />
                                  <div>
                                    <p className="font-black text-white">{design.name}</p>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{design.productId} · {money(design.price)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4">
                                <p className="font-semibold text-zinc-200">{design.shopName}</p>
                                <p className="text-xs text-zinc-500">{design.designerName}</p>
                              </td>
                              {flagFields.map((field) => (
                                <td key={field.key} className="px-3 py-4 text-center">
                                  <button
                                    onClick={() =>
                                      updateDesignFlag(
                                        design.id,
                                        field.key,
                                        design[field.key] === 'true' ? 'false' : 'true'
                                      )
                                    }
                                    disabled={isUpdating}
                                    className={clsx(
                                      'mx-auto flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50',
                                      design[field.key] === 'true'
                                        ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200'
                                        : 'border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10'
                                    )}
                                    aria-label={`Toggle ${field.label}`}
                                  >
                                    {design[field.key] === 'true' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                              ))}
                              <td className="px-3 py-4 text-right">
                                <button
                                  onClick={() => deleteDesign(design.id)}
                                  disabled={isUpdating}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                                  aria-label="Delete design"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              )}

              {activeTab === 'orders' && (
                <motion.section key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                  <div className="mb-5">
                    <h2 className="text-2xl font-black text-white">Orders & Sold Designs</h2>
                    <p className="text-sm text-zinc-400">Every order now shows the design or product image sold.</p>
                  </div>

                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-12 text-center text-sm font-semibold text-zinc-500">
                        No orders found.
                      </div>
                    ) : (
                      orders.map((order) => {
                        const isOpen = expandedOrderId === order.id;
                        const firstItem = order.items[0];
                        const firstImage = firstItem?.design?.preview || firstItem?.design?.previewImage || firstItem?.image;

                        return (
                          <div key={order.id} className="rounded-lg border border-white/10 bg-white/[0.03]">
                            <button
                              onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                              className="grid w-full grid-cols-1 gap-4 p-4 text-left transition hover:bg-white/[0.04] md:grid-cols-[minmax(260px,1fr)_140px_130px_120px_32px]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                                  {firstImage ? (
                                    <img src={firstImage} alt={firstItem?.name || 'Sold design'} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="m-5 h-6 w-6 text-zinc-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black uppercase tracking-widest text-primary-300">#{order.id.slice(-6)}</p>
                                  <h3 className="truncate text-base font-black text-white">{order.customerName}</h3>
                                  <p className="truncate text-sm text-zinc-400">{order.customerEmail}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Items</p>
                                <p className="font-black text-white">{order.items.length}</p>
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Total</p>
                                <p className="font-black text-emerald-200">{money(order.totalAmount)}</p>
                              </div>
                              <div>
                                <span
                                  className={clsx(
                                    'inline-flex rounded-md border px-2 py-1 text-xs font-black uppercase tracking-widest',
                                    order.status === 'pending'
                                      ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                                      : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                                  )}
                                >
                                  {order.status}
                                </span>
                                <p className="mt-2 text-xs text-zinc-500">{new Date(order.createdAt || '').toLocaleDateString()}</p>
                              </div>
                              <ChevronDown className={clsx('h-5 w-5 self-center text-zinc-500 transition', isOpen && 'rotate-180')} />
                            </button>

                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border-t border-white/10"
                                >
                                  <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
                                    <div className="space-y-3">
                                      {order.items.map((item, idx) => {
                                        const image = item.design?.preview || item.design?.previewImage || item.image;
                                        return (
                                          <div key={`${order.id}-${idx}`} className="flex gap-3 rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                                              {image ? (
                                                <img src={image} alt={item.name || 'Sold design'} className="h-full w-full object-cover" />
                                              ) : (
                                                <Palette className="m-6 h-7 w-7 text-zinc-500" />
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="font-black text-white">{item.name || 'Custom design'}</p>
                                              <p className="mt-1 text-sm text-zinc-400">
                                                {item.productId || item.design?.productId || 'product'} · Qty {item.quantity || 1}
                                                {item.size ? ` · ${item.size}` : ''}
                                                {item.color ? ` · ${item.color}` : ''}
                                              </p>
                                              {item.design?.id && (
                                                <p className="mt-1 text-xs font-semibold text-primary-300">Design ID: {item.design.id}</p>
                                              )}
                                            </div>
                                            <p className="shrink-0 font-black text-zinc-200">{money(item.price)}</p>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="rounded-lg border border-white/10 bg-zinc-950/60 p-4">
                                      <h3 className="mb-3 text-sm font-black uppercase tracking-widest text-white">Fulfillment</h3>
                                      <p className="text-sm font-semibold text-zinc-300">{order.shippingAddress}</p>
                                      <p className="mt-1 text-sm text-zinc-400">{order.city}, {order.country}</p>
                                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Payment</p>
                                          <p className="font-black text-white">{order.paymentType}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Balance</p>
                                          <p className="font-black text-white">{money(order.balanceAmount)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.section>
              )}

              {activeTab === 'designers' && (
                <motion.section key="designers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                  <div className="mb-5">
                    <h2 className="text-2xl font-black text-white">Designers & Shops</h2>
                    <p className="text-sm text-zinc-400">Monitor shop ownership and storefront links.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {designersList.length === 0 ? (
                      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-12 text-center text-sm font-semibold text-zinc-500 lg:col-span-2">
                        No designers found.
                      </div>
                    ) : (
                      designersList.map((designer) => (
                        <div key={designer.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                              {designer.heroImage ? (
                                <img src={designer.heroImage} alt={designer.name} className="h-full w-full object-cover" />
                              ) : (
                                <Palette className="m-4 h-6 w-6 text-zinc-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-black text-white">{designer.name}</p>
                              <p className="truncate text-sm text-zinc-400">{designer.email}</p>
                              <p className="truncate text-xs font-semibold uppercase tracking-widest text-primary-300">{designer.shopName || 'No shop yet'}</p>
                            </div>
                          </div>
                          {designer.shopName && (
                            <Link
                              to={`/shop/${designer.shopName.toLowerCase().replace(/\s+/g, '-')}`}
                              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                              Shop
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 rounded-lg border border-white/10 bg-zinc-950/75 p-4 backdrop-blur-xl">
            <Link to="/shop" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10">
              View Shop
            </Link>
            <Link to="/designer" className="rounded-lg border border-primary-400/30 bg-primary-500/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-100 transition hover:bg-primary-500/25">
              Design Studio
            </Link>
            <Link to="/" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10">
              Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
