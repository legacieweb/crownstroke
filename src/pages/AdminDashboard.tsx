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
  X,
  Upload,
  Plus,
  ImagePlus,
  Sparkles,
  Tag
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
  { id: 'limited', label: 'Limited editions', icon: Sparkles },
  { id: 'designs', label: 'Designs', icon: Palette },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'designers', label: 'Designers', icon: Store }
] as const;

type AdminTab = typeof tabs[number]['id'];

interface LimitedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  front: string;
  back: string;
  extras: string[];
  createdAt: string;
}

const LIMITED_PRODUCTS_KEY = 'crownstroke_limited_products';

const readLimitedProducts = (): LimitedProduct[] => {
  try {
    const value = localStorage.getItem(LIMITED_PRODUCTS_KEY);
    return value ? JSON.parse(value) : [];
  } catch { return []; }
};

const imageAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error('Could not read image.'));
  reader.readAsDataURL(file);
});

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

const LimitedEditionsPanel: React.FC = () => {
  const [products, setProducts] = useState<LimitedProduct[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setProducts(readLimitedProducts()), []);

  const loadOne = async (file?: File) => file ? imageAsDataUrl(file) : '';
  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const price = Number(form.get('price'));
    if (!name || !front || !back || !Number.isFinite(price) || price <= 0) {
      setError('Add a name, price, and both front and back images to continue.'); return;
    }
    setSaving(true); setError('');
    try {
      const next = [{ id: crypto.randomUUID(), name, description: String(form.get('description') || '').trim(), price, front, back, extras, createdAt: new Date().toISOString() }, ...products];
      localStorage.setItem(LIMITED_PRODUCTS_KEY, JSON.stringify(next));
      setProducts(next); setFront(''); setBack(''); setExtras([]); event.currentTarget.reset();
    } catch {
      setError('Images exceed this browser’s local storage capacity. Use smaller image files and try again.');
    } finally { setSaving(false); }
  };
  const removeProduct = (id: string) => {
    const next = products.filter((product) => product.id !== id);
    localStorage.setItem(LIMITED_PRODUCTS_KEY, JSON.stringify(next)); setProducts(next);
  };
  const imageField = (label: string, image: string, onImage: (value: string) => void, required = false) => (
    <label className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/[.025] text-center transition hover:border-lime-200/50 hover:bg-white/[.05]">
      {image ? <img src={image} alt={`${label} preview`} className="absolute inset-0 h-full w-full object-cover" /> : <><ImagePlus className="mb-3 h-7 w-7 text-lime-200" /><span className="text-xs font-bold text-white">{label}</span><span className="mt-1 text-[10px] text-white/40">PNG, JPG or WEBP</span></>}
      {image && <span className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white">Replace {label}</span>}
      <input type="file" accept="image/*" required={required && !image} className="sr-only" onChange={async (e) => onImage(await loadOne(e.target.files?.[0]))} />
    </label>
  );

  return <section className="p-4 sm:p-7">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-lime-200">The Crownstroke vault</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Limited edition products</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Build a collectible drop with a complete view of every detail, from both sides to the finishing shots.</p></div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/[.08] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-lime-100"><Sparkles className="h-3.5 w-3.5" /> {products.length} in the vault</span>
    </div>
    <form onSubmit={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="rounded-3xl border border-white/10 bg-white/[.025] p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-lime-200/10 text-lime-200"><Upload className="h-4 w-4" /></span><div><h3 className="text-sm font-black text-white">Product imagery</h3><p className="text-[11px] text-white/45">Front and back are required. Add detail shots as needed.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2">{imageField('Front image', front, setFront, true)}{imageField('Back image', back, setBack, true)}</div>
        <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 text-xs font-bold text-white/70 transition hover:border-white/20 hover:text-white"><Plus className="h-4 w-4" /> Add extra images ({extras.length})<input type="file" accept="image/*" multiple className="sr-only" onChange={async (e) => { const files = Array.from(e.target.files || []); const loaded = await Promise.all(files.map(loadOne)); setExtras((current) => [...current, ...loaded]); e.currentTarget.value = ''; }} /></label>
        {!!extras.length && <div className="mt-3 flex flex-wrap gap-2">{extras.map((src, i) => <button type="button" key={`${src.slice(-20)}-${i}`} onClick={() => setExtras((current) => current.filter((_, index) => index !== i))} title="Remove image" className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/15"><img src={src} alt={`Extra product view ${i + 1}`} className="h-full w-full object-cover" /><span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-bold opacity-0 hover:opacity-100">Remove</span></button>)}</div>}
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[.025] p-4 sm:p-6">
        <div className="mb-5"><h3 className="text-sm font-black text-white">Drop details</h3><p className="mt-1 text-[11px] text-white/45">Give this piece a name and a price.</p></div>
        <label className="mb-4 block text-[10px] font-extrabold uppercase tracking-wider text-white/50">Product name<input name="name" required maxLength={100} placeholder="e.g. After Hours — No. 01" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none placeholder:text-white/25 focus:border-lime-200/50" /></label>
        <label className="mb-4 block text-[10px] font-extrabold uppercase tracking-wider text-white/50">Price · KES<div className="relative mt-2"><Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lime-200" /><input name="price" type="number" min="1" step="1" required placeholder="4,500" className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-lg font-black text-white outline-none placeholder:text-white/25 focus:border-lime-200/50" /></div></label>
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-white/50">Story <span className="font-medium normal-case tracking-normal text-white/30">· optional</span><textarea name="description" rows={4} maxLength={500} placeholder="What makes this edition special?" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-3 text-sm font-medium normal-case leading-6 tracking-normal text-white outline-none placeholder:text-white/25 focus:border-lime-200/50" /></label>
        {error && <p role="alert" className="mt-4 text-xs font-semibold leading-5 text-rose-200">{error}</p>}
        <button disabled={saving} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-200 px-4 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-lime-100 disabled:opacity-60"><Sparkles className="h-4 w-4" />{saving ? 'Saving drop…' : 'Save limited edition'}</button>
        <p className="mt-3 text-center text-[10px] leading-4 text-white/35">Saved in this browser for now.</p>
      </div>
    </form>
    <div className="mt-9"><div className="mb-4 flex items-end justify-between"><div><h3 className="text-lg font-black text-white">Your editions</h3><p className="mt-1 text-xs text-white/45">Recently added pieces, ready to review.</p></div></div>
      {products.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 px-5 py-9 text-center text-sm text-white/45">Your vault is waiting for its first drop.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]"><div className="grid h-44 grid-cols-2 gap-px bg-white/10"><img src={product.front} alt={`${product.name}, front`} className="h-full w-full object-cover" /><img src={product.back} alt={`${product.name}, back`} className="h-full w-full object-cover" /></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-white">{product.name}</h4><p className="mt-1 text-xs text-lime-200">{money(product.price)}</p></div><button type="button" onClick={() => removeProduct(product.id)} aria-label={`Remove ${product.name}`} className="rounded-lg p-2 text-white/45 hover:bg-rose-400/10 hover:text-rose-200"><Trash2 className="h-4 w-4" /></button></div>{!!product.extras.length && <p className="mt-3 text-[10px] text-white/40">+ {product.extras.length} extra {product.extras.length === 1 ? 'view' : 'views'}</p>}</div></article>)}</div>}
    </div>
  </section>;
};

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

      <div className="admin-console relative min-h-screen px-3 py-5 text-white sm:px-6 sm:py-8 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_50%_0%,rgba(132,204,22,.12),transparent_68%)]" />
        <div className="mx-auto max-w-[1440px]">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(0,0,0,.32)] backdrop-blur-2xl sm:p-7"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10 text-lime-200 shadow-[0_10px_35px_rgba(190,242,100,.08)]">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-lime-200">Crownstroke · Operations</p>
                  <h1 className="mt-1 text-3xl font-black tracking-[-.045em] text-white sm:text-4xl">Admin dashboard</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">A clear view of orders, designers, and the work featured across the marketplace.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchAllData}
                  disabled={isUpdating || isDashboardLoading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[.06] px-4 py-2 text-xs font-bold text-white/80 transition hover:border-lime-200/40 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className={clsx('h-4 w-4', isDashboardLoading && 'animate-spin')} />
                  Refresh
                </button>
                <button
                  onClick={logout}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-xs font-bold text-white/65 transition hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
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

          <section aria-label="Marketplace overview" className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {[
              { label: 'Order value', value: money(stats.totalRevenue), icon: DollarSign, tone: 'text-emerald-200', detail: `${stats.totalOrders} orders tracked` },
              { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, tone: 'text-sky-200', detail: `${pendingOrders} pending fulfillment` },
              { label: 'Designers', value: stats.totalDesigners, icon: Palette, tone: 'text-fuchsia-200', detail: `${designs.length} marketplace designs` },
              { label: 'Featured', value: featuredDesigns, icon: Eye, tone: 'text-amber-200', detail: 'Promoted designs live' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group rounded-2xl border border-white/10 bg-slate-950/65 p-4 shadow-xl backdrop-blur-xl transition hover:border-white/20 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[.16em] text-white/50 sm:text-[10px]">{stat.label}</span>
                  <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[.04] transition group-hover:bg-white/[.07]"><stat.icon className={clsx('h-4 w-4', stat.tone)} /></span>
                </div>
                <div className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">{stat.value}</div>
                <p className="mt-1.5 text-[10px] leading-4 text-white/45 sm:text-xs">{stat.detail}</p>
              </motion.div>
            ))}
          </section>

          <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <nav aria-label="Admin sections" className="rounded-2xl border border-white/10 bg-slate-950/65 p-2 backdrop-blur-xl">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    className={clsx(
                      'inline-flex min-h-12 flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-[10px] font-extrabold uppercase tracking-[.12em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:flex-none sm:px-5 sm:text-xs',
                      activeTab === tab.id
                        ? 'border border-lime-200/30 bg-lime-300 text-slate-950 shadow-[0_8px_25px_rgba(190,242,100,.14)]'
                        : 'border border-transparent text-white/55 hover:border-white/10 hover:bg-white/[.05] hover:text-white'
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>

            <aside className="rounded-2xl border border-white/10 bg-slate-950/65 p-4 backdrop-blur-xl sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/75">Recent orders</h2>
                <button onClick={() => setActiveTab('orders')} className="rounded-lg px-2 py-1 text-xs font-bold text-lime-200 transition hover:bg-white/[.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-zinc-500">No orders yet.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between gap-3 border-t border-white/[.08] pt-3 first:border-t-0 first:pt-0">
                      <div>
                        <p className="text-xs font-black text-white">#{order.id.slice(-6)}</p>
                        <p className="mt-0.5 truncate text-xs text-white/50">{order.customerName}</p>
                      </div>
                      <span className="text-sm font-black text-emerald-200">{money(order.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </section>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_20px_70px_rgba(0,0,0,.22)] backdrop-blur-2xl">
            <AnimatePresence mode="wait">
              {activeTab === 'limited' && (
                <motion.div key="limited" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LimitedEditionsPanel />
                </motion.div>
              )}
              {activeTab === 'designs' && (
                <motion.section key="designs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 sm:p-6">
                  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-lime-200">Curation desk</p>
                      <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Marketplace designs</h2>
                      <p className="mt-1 text-sm text-white/50">Promote, curate, or remove designer submissions.</p>
                    </div>
                    <Link to="/designer" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-lime-200/25 bg-lime-300 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-slate-950 transition hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200">
                      Open Studio
                    </Link>
                  </div>

                  <div className="grid gap-3 lg:hidden">
                    {designs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-sm text-white/50">No designs found.</div>
                    ) : designs.map((design) => (
                      <article key={`mobile-${design.id}`} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                        <div className="flex items-center gap-3">
                          <img src={design.preview} alt={design.name} className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-slate-900 object-cover" />
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-white">{design.name}</h3>
                            <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[.12em] text-white/45">{design.productId} · {money(design.price)}</p>
                            <p className="mt-1 truncate text-xs text-white/60">{design.shopName} <span className="text-white/30">/</span> {design.designerName}</p>
                          </div>
                          <button
                            onClick={() => deleteDesign(design.id)}
                            disabled={isUpdating}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-300/20 bg-red-400/[.08] text-red-200 transition hover:bg-red-400/[.16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-200 disabled:opacity-50"
                            aria-label={`Delete ${design.name}`}
                          ><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {flagFields.map((field) => {
                            const enabled = design[field.key] === 'true';
                            return (
                              <button
                                key={field.key}
                                onClick={() => updateDesignFlag(design.id, field.key, enabled ? 'false' : 'true')}
                                disabled={isUpdating}
                                aria-pressed={enabled}
                                className={clsx(
                                  'inline-flex min-h-10 items-center justify-between gap-2 rounded-xl border px-3 text-left text-[10px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-lime-200 disabled:opacity-50',
                                  enabled ? 'border-emerald-300/25 bg-emerald-300/[.09] text-emerald-100' : 'border-white/10 bg-white/[.025] text-white/55 hover:bg-white/[.06] hover:text-white'
                                )}
                              >
                                {field.label}
                                {enabled ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[960px] text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[.025]">
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
                                  <img src={design.preview} alt={design.name} className="h-14 w-14 rounded-xl border border-white/10 bg-slate-900 object-cover" />
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
                                      'mx-auto flex h-9 w-9 items-center justify-center rounded-xl border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 disabled:cursor-not-allowed disabled:opacity-50',
                                      design[field.key] === 'true'
                                        ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200'
                                        : 'border-white/10 bg-white/5 text-zinc-500 hover:bg-white/10'
                                    )}
                                    aria-label={`Toggle ${field.label}`}
                                    aria-pressed={design[field.key] === 'true'}
                                  >
                                    {design[field.key] === 'true' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                  </button>
                                </td>
                              ))}
                              <td className="px-3 py-4 text-right">
                                <button
                                  onClick={() => deleteDesign(design.id)}
                                  disabled={isUpdating}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label={`Delete ${design.name}`}
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
                <motion.section key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 sm:p-6">
                  <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-sky-200">Fulfillment desk</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Orders &amp; sold designs</h2>
                    <p className="mt-1 text-sm text-white/50">Every order includes the design or product image sold.</p>
                  </div>

                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-12 text-center text-sm font-semibold text-white/50">
                        No orders found.
                      </div>
                    ) : (
                      orders.map((order) => {
                        const isOpen = expandedOrderId === order.id;
                        const firstItem = order.items[0];
                        const firstImage = firstItem?.design?.preview || firstItem?.design?.previewImage || firstItem?.image;

                        return (
                          <div key={order.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.025] transition hover:border-white/15">
                            <button
                              onClick={() => setExpandedOrderId(isOpen ? null : order.id)}
                              aria-expanded={isOpen}
                              className="grid w-full grid-cols-2 items-center gap-x-4 gap-y-3 p-4 text-left transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-lime-200 sm:p-5 md:grid-cols-[minmax(260px,1fr)_100px_140px_120px_24px]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 sm:h-16 sm:w-16">
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
                              <div className="pl-[68px] sm:pl-[76px] md:pl-0">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Items</p>
                                <p className="font-black text-white">{order.items.length}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Total</p>
                                <p className="font-black text-emerald-200">{money(order.totalAmount)}</p>
                              </div>
                              <div>
                                <span
                                  className={clsx(
                                    'inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest',
                                    order.status === 'pending'
                                      ? 'border-amber-400/30 bg-amber-500/15 text-amber-200'
                                      : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                                  )}
                                >
                                  {order.status}
                                </span>
                                <p className="mt-2 text-[10px] text-white/40">{new Date(order.createdAt || '').toLocaleDateString()}</p>
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
                                  <div className="grid gap-4 bg-black/15 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                                    <div className="space-y-3">
                                      {order.items.map((item, idx) => {
                                        const image = item.design?.preview || item.design?.previewImage || item.image;
                                        return (
                                          <div key={`${order.id}-${idx}`} className="flex min-w-0 gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 sm:h-20 sm:w-20">
                                              {image ? (
                                                <img src={image} alt={item.name || 'Sold design'} className="h-full w-full object-cover" />
                                              ) : (
                                                <Palette className="m-6 h-7 w-7 text-zinc-500" />
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="break-words font-black text-white">{item.name || 'Custom design'}</p>
                                              <p className="mt-1 text-xs leading-5 text-zinc-400 sm:text-sm">
                                                {item.productId || item.design?.productId || 'product'} · Qty {item.quantity || 1}
                                                {item.size ? ` · ${item.size}` : ''}
                                                {item.color ? ` · ${item.color}` : ''}
                                              </p>
                                              {item.design?.id && (
                                                <p className="mt-1 text-xs font-semibold text-primary-300">Design ID: {item.design.id}</p>
                                              )}
                                            </div>
                                            <p className="shrink-0 text-xs font-black text-zinc-200 sm:text-sm">{money(item.price)}</p>
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
                <motion.section key="designers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 sm:p-6">
                  <div className="mb-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-fuchsia-200">Creator network</p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">Designers &amp; shops</h2>
                    <p className="mt-1 text-sm text-white/50">Monitor shop ownership and storefront links.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {designersList.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-12 text-center text-sm font-semibold text-white/50 lg:col-span-2">
                        No designers found.
                      </div>
                    ) : (
                      designersList.map((designer) => (
                        <div key={designer.id} className="flex min-w-0 flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:p-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
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
                              className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200 sm:w-auto"
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

          <nav aria-label="Admin shortcuts" className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3 backdrop-blur-xl sm:mt-6 sm:gap-3 sm:p-4">
            <Link to="/shop" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200">
              View Shop
            </Link>
            <Link to="/designer" className="inline-flex min-h-10 items-center rounded-xl border border-lime-200/20 bg-lime-300/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-lime-100 transition hover:bg-lime-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200">
              Design Studio
            </Link>
            <Link to="/" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200">
              Home
            </Link>
          </nav>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
