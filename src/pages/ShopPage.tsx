import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Layout, { BackendStatusContext } from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useCart } from '../store/CartContext';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_DATA } from '../data/seed';
import {
  Share2,
  Palette,
  ArrowRight,
  Search,
  Sparkles,
  Layers3,
  LayoutGrid,
  ShoppingBag,
  Eye,
} from 'lucide-react';

const ShopPage: React.FC = () => {
  const { shopName } = useParams<{ shopName: string }>();
  const { addToCart } = useCart();
  const { isOnline } = React.useContext(BackendStatusContext);
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopNotFound, setShopNotFound] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('Independent designer');
  const [shopTitle, setShopTitle] = useState('Creator shop');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewSides, setPreviewSides] = useState<Record<string, 'front' | 'back'>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    const fetchShopDesigns = async () => {
      if (!shopName) return;
      setIsLoading(true);
      setShopNotFound(false);
      try {
        const shop = await db.select()
          .from(shops)
          .where(eq(shops.slug, shopName))
          .limit(1);

        let resolvedShop = shop;

        // Fallback: if exact slug match fails, try normalized match
        // (handles e.g. "crownstroke" vs "crown-stroke" — hyphen differences)
        if (shop.length === 0) {
          const normalizedSlug = shopName.replace(/-/g, '').toLowerCase();
          const allShops = await db.select().from(shops).limit(100);
          const found = allShops.find(s => {
            const normalize = (value: unknown) => typeof value === 'string'
              ? value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
              : '';
            return normalize(s.slug) === normalizedSlug || normalize(s.name) === normalizedSlug;
          });
          if (found) {
            resolvedShop = [found];
          }
        }

        if (resolvedShop.length > 0) {
          const s = resolvedShop[0];
          
          const [designer, shopDesigns] = await Promise.all([
            db.select({ heroImage: designers.heroImage, name: designers.name })
              .from(designers)
              .where(eq(designers.id, s.designerId))
              .limit(1),
            db.select({
            id: designerDesigns.id,
            name: designerDesigns.name,
            productId: designerDesigns.productId,
            preview: designerDesigns.preview,
            designData: designerDesigns.designData,
            price: designerDesigns.price,
            designerId: designerDesigns.designerId,
            designerEmail: designers.email
            })
              .from(designerDesigns)
              .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
              .where(eq(designerDesigns.shopId, resolvedShop[0].id)),
          ]);
          
          setHeroImage(designer[0]?.heroImage || null);
          setCreatorName(designer[0]?.name || 'Independent designer');
          setShopTitle(s.name || shopName);
          setDesigns(shopDesigns);
        } else {
          setShopNotFound(true);
          setDesigns([]);
        }
      } catch (err) {
        console.error('Error fetching shop designs:', err);
        alert(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopDesigns();
  }, [shopName]);

  const buildShopCartItem = (design: any) => {
    const savedDesign = design.designData || {};
    const previews = savedDesign.previews || {};
    const mockups = PRODUCT_DATA[design.productId] || {};
    const garmentColor = savedDesign.color && mockups[savedDesign.color]
      ? savedDesign.color
      : mockups['#ffffff'] ? '#ffffff' : Object.keys(mockups)[0];
    const blankMockups = mockups[garmentColor] || {};
    const frontPreview = previews.front || null;
    const backPreview = previews.back || null;
    const isDoubleSided = Boolean(design.designData?.front?.objects?.length && design.designData?.back?.objects?.length);
    const previewImage = frontPreview || backPreview || design.preview;
    const product = {
      id: design.id,
      name: design.name,
      description: `Designer creation by ${design.designerEmail}`,
      price: design.price,
      image: previewImage,
      category: design.productId as any,
      isCustomizable: false,
      images: {
        front: design.designData?.front?.objects?.length ? frontPreview || design.preview : blankMockups.front || frontPreview || design.preview,
        back: design.designData?.back?.objects?.length ? backPreview || design.preview : blankMockups.back || backPreview || design.preview,
      },
      garmentColor,
      designerId: design.designerId,
      designerEmail: design.designerEmail,
      designId: design.id
    };
    const customDesign = {
      id: design.id,
      designerId: design.designerId,
      productId: design.productId,
      elements: { ...savedDesign, color: garmentColor },
      previewImage,
      isDoubleSided,
      previews: {
        front: design.designData?.front?.objects?.length ? frontPreview || previewImage : blankMockups.front || frontPreview || previewImage,
        back: design.designData?.back?.objects?.length ? backPreview || previewImage : blankMockups.back || backPreview || previewImage,
      },
    };
    return { product, customDesign };
  };

  const handleBuyNow = (design: any) => {
    if (!isOnline) {
      alert('Shop is currently closed! You can still design and save to drafts.');
      return;
    }
    const { product, customDesign } = buildShopCartItem(design);
    addToCart(product as any, 1, 'M', product.garmentColor || '#ffffff', customDesign as any);
    navigate('/checkout');
  };

  const filteredDesigns = designs.filter((design) => {
    const categoryMatch = activeCategory === 'all' || design.productId === activeCategory;
    const searchMatch = !searchTerm.trim() || `${design.name} ${design.productId}`.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return categoryMatch && searchMatch;
  });

  const categories = ['all', ...new Set(designs.map(d => d.productId))];
  const doubleSidedCount = designs.filter((design) => design.designData?.front?.objects?.length && design.designData?.back?.objects?.length).length;
  const shareShop = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${shopTitle} · Crownstroke`, url });
      else { await navigator.clipboard.writeText(url); setShareStatus('Link copied'); window.setTimeout(() => setShareStatus(''), 2200); }
    } catch { /* The share sheet can be dismissed without copying. */ }
  };

  return (
    <Layout>
      <div className="relative z-10 min-h-screen pb-20 selection:bg-lime-300/30">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <header className="relative isolate overflow-hidden rounded-[2rem] border border-white/15 bg-[#111411] shadow-[0_32px_100px_rgba(0,0,0,.3)] sm:rounded-[2.5rem]">
            {heroImage && <><img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0a0d0a] via-[#0a0d0a]/90 to-[#0a0d0a]/35" /></>}
            <div className="grid min-h-[330px] items-end gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-200/25 bg-lime-200/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.2em] text-lime-100"><Sparkles className="h-3.5 w-3.5" /> Independent creator shop</p>
                <h1 className="max-w-3xl text-5xl font-black leading-[.9] tracking-[-.065em] text-white sm:text-7xl lg:text-8xl">{shopTitle}</h1>
                <p className="mt-5 flex items-center gap-2 text-sm font-medium text-white/65"><span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10">{heroImage ? <img src={heroImage} alt="" className="h-full w-full object-cover" /> : <Palette className="h-4 w-4" />}</span> Curated by <strong className="text-white">{creatorName}</strong></p>
                <p className="mt-5 max-w-xl text-sm leading-6 text-white/55">Original designs, created independently and printed with care. Find a piece that feels like yours.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <button type="button" onClick={shareShop} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/[.06] px-5 text-xs font-extrabold text-white transition hover:bg-white/10"><Share2 className="h-4 w-4" /> {shareStatus || 'Share shop'}</button>
                <a href="#collection" className="inline-flex h-12 items-center gap-2 rounded-xl bg-lime-200 px-5 text-xs font-black text-slate-950 transition hover:bg-lime-100">Explore collection <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>
          </header>

          <section aria-label="Shop facts" className="my-8 grid grid-cols-2 gap-3 sm:my-10 sm:grid-cols-3">
            {[{ label: 'Original designs', value: designs.length, icon: Palette }, { label: 'Product types', value: Math.max(0, categories.length - 1), icon: LayoutGrid }, { label: 'Double-sided', value: doubleSidedCount, icon: Layers3 }].map((stat) => <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.07] text-lime-200"><stat.icon className="h-4 w-4" /></span><div><p className="text-xl font-black tracking-tight text-white">{stat.value}</p><p className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[.13em] text-white/45">{stat.label}</p></div></div>)}
          </section>

          <section id="collection" className="scroll-mt-24">
            <div className="mb-5 flex flex-col gap-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-lime-200">The collection</p><h2 className="mt-2 text-3xl font-black tracking-[-.045em] text-white sm:text-4xl">Made by {creatorName.split(' ')[0]}.</h2><p className="mt-2 text-sm text-white/50">{filteredDesigns.length} {filteredDesigns.length === 1 ? 'piece' : 'pieces'} to explore</p></div>
              <label className="relative block w-full sm:max-w-xs"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search this shop" className="h-11 w-full rounded-xl border border-white/15 bg-white/[.05] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-lime-200/50" /></label>
            </div>
            <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => <button key={cat} onClick={() => setActiveCategory(cat)} className={clsx('shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[.12em] transition', activeCategory === cat ? 'border-lime-200 bg-lime-200 text-slate-950' : 'border-white/15 bg-white/[.03] text-white/60 hover:border-white/30 hover:text-white')}>{cat === 'all' ? 'All pieces' : cat.replace(/-/g, ' ')}</button>)}
            </div>
          </section>

           {/* Collection Grid */}
{isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-40 gap-4 sm:gap-6">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                 <p className="text-white/40 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[10px]">Accessing Vault...</p>
              </div>
            ) : shopNotFound ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-40 text-center border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[4rem]">
                 <Palette className="w-12 h-12 sm:w-20 sm:h-20 text-white/5 mb-6 sm:mb-8" />
                 <h3 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter mb-3 sm:mb-4">Shop Not Found</h3>
                 <p className="text-white/40 text-xs sm:text-sm font-bold max-w-sm mx-auto uppercase tracking-widest">We could not find a designer shop at this URL. The shop may have been renamed or removed.</p>
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-40 text-center border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[4rem]">
                 <Palette className="w-12 h-12 sm:w-20 sm:h-20 text-white/5 mb-6 sm:mb-8" />
                 <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 sm:mb-4">Nothing in this collection yet</h3>
                 <p className="text-white/50 text-sm max-w-sm mx-auto">Try another product type or clear your search to see every design in this shop.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                 <AnimatePresence mode="popLayout">
                   {filteredDesigns.map((design, i) => {
                     const availablePreviews = design.designData?.previews || {};
                     const sideArtwork = (side: 'front' | 'back') => Boolean(design.designData?.[side]?.objects?.length);
                     const mockups = PRODUCT_DATA[design.productId] || {};
                     const garmentColor = design.designData?.color && mockups[design.designData.color]
                       ? design.designData.color
                       : mockups['#ffffff'] ? '#ffffff' : Object.keys(mockups)[0];
                     const blankMockups = mockups[garmentColor] || {};
                     const hasFrontAndBack = Boolean(availablePreviews.front || availablePreviews.back || blankMockups.front || blankMockups.back);
                     const selectedPreviewSide = previewSides[design.id] || (sideArtwork('back') && !sideArtwork('front') ? 'back' : 'front');
                     const cardPreview = sideArtwork(selectedPreviewSide)
                       ? (selectedPreviewSide === 'back' ? availablePreviews.back : availablePreviews.front) || (design.designData?.activeSide === selectedPreviewSide ? design.preview : blankMockups[selectedPreviewSide]) || design.preview
                       : blankMockups[selectedPreviewSide] || design.preview;
                     return (
                     <motion.div 
                       key={design.id}
                       layout
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ duration: 0.5, delay: i * 0.05 }}
                       className="product-motion group cursor-pointer"
                       role="link"
                       tabIndex={0}
                       aria-label={`View details for ${design.name}`}
                       onClick={() => navigate(`/product/${design.id}`)}
                       onKeyDown={(event) => {
                         if (event.target !== event.currentTarget) return;
                         if (event.key === 'Enter' || event.key === ' ') {
                           event.preventDefault();
                           navigate(`/product/${design.id}`);
                         }
                       }}
                     >
                       <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-[#e9e7df] transition duration-300 group-hover:border-lime-200/45 group-hover:shadow-[0_22px_60px_rgba(0,0,0,.32)] sm:rounded-3xl">
                         <img src={cardPreview} className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.035] sm:p-7" alt={`${design.name}, ${selectedPreviewSide} view`} />
                         <div className="absolute left-3 top-3 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.12em] text-slate-700">{design.productId.replace(/-/g, ' ')}</div>
                         <div className="absolute right-3 top-3 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[9px] font-bold text-slate-600">{garmentColor === '#000000' ? 'Black' : garmentColor === '#ffffff' ? 'White' : garmentColor}</div>
                         {hasFrontAndBack && <div className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 rounded-full border border-black/10 bg-white/95 p-1 shadow-lg" role="group" aria-label={`${design.name} garment side`}>
                           {(['front', 'back'] as const).map((side) => <button key={side} type="button" onClick={(event) => { event.stopPropagation(); setPreviewSides((current) => ({ ...current, [design.id]: side })); }} aria-pressed={selectedPreviewSide === side} className={clsx('min-h-9 rounded-full px-4 text-[9px] font-black uppercase tracking-widest transition', selectedPreviewSide === side ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950')}>{side}</button>)}
                         </div>}
                         <button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/product/${design.id}`); }} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-lime-200 hover:text-slate-950" aria-label={`View ${design.name}`}><Eye className="h-4 w-4" /></button>
                       </div>
                       <div className="px-1 pb-1 pt-4">
                         <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-lime-200">{sideArtwork('front') && sideArtwork('back') ? 'Front + back print' : sideArtwork('front') ? 'Front print' : sideArtwork('back') ? 'Back print' : 'Artist original'}</p><h3 className="mt-1 truncate text-base font-black text-white sm:text-lg">{design.name}</h3></div><p className="shrink-0 text-sm font-black text-white">KES {(design.price ?? 0).toLocaleString()}</p></div>
                         <div className="mt-4 flex gap-2"><Button variant={isOnline ? 'premium' : 'outline'} className={clsx('h-11 flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider', !isOnline && 'cursor-not-allowed opacity-60')} onClick={(event) => { event.stopPropagation(); handleBuyNow(design); }}><ShoppingBag className="mr-2 h-4 w-4" />{isOnline ? 'Buy now' : 'Shop closed'}</Button><Button variant="outline" className="h-11 rounded-xl border-white/15 px-4 text-[10px] font-black uppercase tracking-wider text-white" onClick={(event) => { event.stopPropagation(); navigate(`/product/${design.id}`); }}>Details</Button></div>
                       </div>
                     </motion.div>
                     );
                   })}
                 </AnimatePresence>
              </div>
            )}

            <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-lime-200/[.1] to-white/[.025] p-6 sm:mt-20 sm:flex-row sm:items-center sm:p-8">
              <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-lime-200">Keep exploring</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">More original work, made by independent artists.</h2><p className="mt-2 text-sm text-white/55">Browse the full Crownstroke marketplace or create something of your own.</p></div>
              <div className="flex shrink-0 flex-wrap gap-2"><Link to="/shop" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 transition hover:bg-lime-100">Browse marketplace <ArrowRight className="h-4 w-4" /></Link><Link to="/designer" className="inline-flex h-11 items-center rounded-xl border border-white/20 px-4 text-xs font-bold text-white transition hover:bg-white/10">Open studio</Link></div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
