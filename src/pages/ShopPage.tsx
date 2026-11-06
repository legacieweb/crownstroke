import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import Layout, { BackendStatusContext } from '../components/layout/Layout';
import Preloader from '../components/ui/Preloader';
import { useCart } from '../store/CartContext';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_DATA } from '../data/seed';
import { apiUrl } from '../services/apiUrl';
import {
  Share2,
  Palette,
  ArrowRight,
  Search,
  Sparkles,
  ShoppingBag,
  Eye,
  Mail,
} from 'lucide-react';

const ShopPage: React.FC = () => {
  const { shopName } = useParams<{ shopName: string }>();
  const { addToCart } = useCart();
  const { isOnline } = React.useContext(BackendStatusContext);
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shopNotFound, setShopNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState('Independent designer');
  const [shopTitle, setShopTitle] = useState('Creator shop');
  const [shopDescription, setShopDescription] = useState('A collection of original designs, made with care.');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewSides, setPreviewSides] = useState<Record<string, 'front' | 'back'>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  useEffect(() => {
    const fetchShopDesigns = async () => {
      if (!shopName) {
        setShopNotFound(true);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setShopNotFound(false);
      setLoadError('');
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
          setShopDescription(s.description || 'A collection of original designs, made with care.');
          setDesigns(shopDesigns);
        } else {
          setShopNotFound(true);
          setDesigns([]);
        }
      } catch (err) {
        console.error('Error fetching shop designs:', err);
        setLoadError('We couldn’t load this artist shop right now. Please try again.');
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
  const shareShop = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${shopTitle} · Crownstroke`, url });
      else { await navigator.clipboard.writeText(url); setShareStatus('Link copied'); window.setTimeout(() => setShareStatus(''), 2200); }
    } catch { /* The share sheet can be dismissed without copying. */ }
  };

  const handleNewsletterSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsNewsletterSubmitting(true);
    setNewsletterStatus('');
    try {
      const response = await fetch(apiUrl('/api/newsletter-signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newsletterName, email: newsletterEmail, website: String(formData.get('website') || '') }),
      });
      const responseText = await response.text();
      let result: any = {};
      try { result = responseText ? JSON.parse(responseText) : {}; } catch { /* Handle server and proxy errors without JSON parse failures. */ }
      if (!response.ok) throw new Error(result.error || 'We could not complete your signup. Please try again.');
      setNewsletterStatus(result.message || 'You’re subscribed. Check your inbox for a note from us.');
      setNewsletterName('');
      setNewsletterEmail('');
      form.reset();
    } catch (error) {
      setNewsletterStatus(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const openCollection = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const showError = loadError || (shopNotFound ? 'This artist shop could not be found. It may have moved or closed.' : '');

  return (
    <Layout>
      <Preloader key={shopName || 'artist-shop'} isLoading={isLoading} />
      <main className="relative z-10 min-h-screen pb-16 selection:bg-lime-300/30 sm:pb-24">
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-5 sm:px-7 sm:pb-20 sm:pt-9 lg:px-10">
          <div className="mb-5 flex items-center justify-between gap-4 sm:mb-7">
            <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-white/55 transition hover:text-white"><span aria-hidden="true">←</span> Discover artists</Link>
            <span className="hidden text-[9px] font-bold uppercase tracking-[.2em] text-white/30 sm:block">Crownstroke · Independent by design</span>
          </div>

          <header className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080b09]/70 shadow-[0_32px_100px_rgba(0,0,0,.35)] sm:rounded-[2.5rem]">
            <div className="grid lg:min-h-[520px] lg:grid-cols-[.92fr_1.08fr]">
              <div className="relative z-10 order-2 flex flex-col justify-center px-6 pb-7 pt-6 sm:px-10 sm:pb-10 sm:pt-8 lg:order-1 lg:px-14 lg:py-14 xl:px-16">
                <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-lime-200/25 bg-lime-200/[.08] px-3.5 py-2 text-[9px] font-black uppercase tracking-[.2em] text-lime-100"><Sparkles className="h-3.5 w-3.5" /> Artist owned · Original work</p>
                <h1 className="max-w-2xl break-words text-[2.8rem] font-black leading-[.91] tracking-[-.075em] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">{shopTitle}<span className="text-lime-200">.</span></h1>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lime-200/25 bg-lime-200/[.08] text-lime-100"><Palette className="h-4 w-4" /></span>
                  <div><p className="text-[9px] font-bold uppercase tracking-[.17em] text-white/40">The artist</p><p className="mt-0.5 text-sm font-bold text-white">{creatorName}</p></div>
                </div>
                <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 sm:text-base sm:leading-7">{shopDescription}</p>
                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={openCollection} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lime-200 px-5 text-xs font-black text-slate-950 transition hover:bg-lime-100">Explore the collection <ArrowRight className="h-4 w-4" /></button>
                  <button type="button" onClick={shareShop} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[.035] px-5 text-xs font-extrabold text-white transition hover:bg-white/10"><Share2 className="h-4 w-4" /> {shareStatus || 'Share this shop'}</button>
                </div>
              </div>
              <div className="relative order-1 h-64 overflow-hidden bg-gradient-to-br from-[#20291b] to-[#080a08] sm:h-[390px] lg:order-2 lg:h-auto lg:min-h-[520px]">
                {heroImage ? <img src={heroImage} alt={`${creatorName} artist shop cover`} className="absolute inset-0 h-full w-full object-cover object-center" /> : <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,rgba(190,242,100,.15),transparent_62%)]"><Palette className="h-20 w-20 text-lime-100/40" /></div>}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10 lg:bg-gradient-to-r lg:from-[#080b09]/40 lg:via-transparent lg:to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/90 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> In the artist’s studio</span><span className="font-mono text-[10px] tracking-[.18em] text-white/75">CS / 001</span></div>
              </div>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-200/40 to-transparent" />
          </header>

          <section id="collection" className="scroll-mt-8 pt-14 sm:pt-20" aria-labelledby="collection-title">
            <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.23em] text-lime-200">Curated by {creatorName}</p>
                <h2 id="collection-title" className="mt-2 text-3xl font-black tracking-[-.055em] text-white sm:text-5xl">The collection<span className="text-lime-200">.</span></h2>
                <p className="mt-2 text-sm text-white/50">{filteredDesigns.length} {filteredDesigns.length === 1 ? 'original piece' : 'original pieces'} to discover</p>
              </div>
              <label className="relative block w-full lg:max-w-sm"><span className="sr-only">Search this artist shop</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Find a design" className="h-12 w-full rounded-xl border border-white/15 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-lime-200/60 focus:bg-black/35" /></label>
            </div>
            <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="group" aria-label="Filter by product type">
              {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className={clsx('shrink-0 rounded-full border px-4 py-2.5 text-[9px] font-black uppercase tracking-[.14em] transition', activeCategory === category ? 'border-lime-200 bg-lime-200 text-slate-950' : 'border-white/15 bg-white/[.025] text-white/60 hover:border-white/35 hover:text-white')}>{category === 'all' ? 'Everything' : category.replace(/-/g, ' ')}</button>)}
            </div>
          </section>

          {isLoading ? (
            <div className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Loading products">
              {[0, 1, 2, 3].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[4/5] rounded-3xl border border-white/[.07] bg-white/[.035]" /><div className="mt-4 h-3 w-2/3 rounded bg-white/[.07]" /><div className="mt-2 h-3 w-1/3 rounded bg-white/[.05]" /></div>)}
            </div>
          ) : showError ? (
            <div className="my-10 rounded-[1.75rem] border border-white/10 bg-white/[.025] px-6 py-16 text-center sm:my-14 sm:py-20"><Palette className="mx-auto h-10 w-10 text-lime-100/50" /><p className="mt-5 text-[9px] font-black uppercase tracking-[.22em] text-lime-200">Studio unavailable</p><h3 className="mt-2 text-2xl font-black tracking-tight text-white">{shopNotFound ? 'We couldn’t find this shop.' : 'We can’t reach the studio right now.'}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">{showError}</p><Link to="/shop" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-4 text-xs font-bold text-white transition hover:bg-white/[.06]">Explore all artists</Link></div>
          ) : filteredDesigns.length === 0 ? (
            <div className="my-10 rounded-[1.75rem] border border-dashed border-white/15 px-6 py-16 text-center sm:my-14 sm:py-20"><Palette className="mx-auto h-10 w-10 text-white/25" /><h3 className="mt-5 text-2xl font-black tracking-tight text-white">{designs.length ? 'No pieces match that search.' : 'The studio is warming up.'}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">{designs.length ? 'Try a different phrase or clear the product filter to see more work.' : 'New original designs will appear here as soon as the artist publishes them.'}</p>{(searchTerm || activeCategory !== 'all') && <button type="button" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="mt-5 text-xs font-black uppercase tracking-wider text-lime-200 hover:text-lime-100">Clear filters</button>}</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 pt-3 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {filteredDesigns.map((design, index) => {
                  const previews = design.designData?.previews || {};
                  const hasArtwork = (side: 'front' | 'back') => Boolean(design.designData?.[side]?.objects?.length);
                  const mockups = PRODUCT_DATA[design.productId] || {};
                  const garmentColor = design.designData?.color && mockups[design.designData.color]
                    ? design.designData.color
                    : mockups['#ffffff'] ? '#ffffff' : Object.keys(mockups)[0];
                  const blankMockups = mockups[garmentColor] || {};
                  const hasSides = Boolean(previews.front || previews.back || blankMockups.front || blankMockups.back);
                  const selectedSide = previewSides[design.id] || (hasArtwork('back') && !hasArtwork('front') ? 'back' : 'front');
                  const cardImage = hasArtwork(selectedSide)
                    ? (selectedSide === 'back' ? previews.back : previews.front) || (design.designData?.activeSide === selectedSide ? design.preview : blankMockups[selectedSide]) || design.preview
                    : blankMockups[selectedSide] || design.preview;
                  const printLabel = hasArtwork('front') && hasArtwork('back') ? 'Front + back artwork' : hasArtwork('front') ? 'Front artwork' : hasArtwork('back') ? 'Back artwork' : 'Artist original';
                  const colorName = garmentColor === '#000000' ? 'Black' : garmentColor === '#ffffff' ? 'White' : garmentColor || 'Original';
                  return (
                    <motion.article key={design.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: .35, delay: Math.min(index * .04, .2) }} className="product-motion group min-w-0">
                      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/[.09] bg-gradient-to-br from-white/[.045] via-white/[.015] to-black/20 transition-colors group-hover:border-lime-200/30 sm:rounded-[1.8rem]">
                        <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-lime-100/[.055] blur-3xl transition-opacity group-hover:opacity-150" />
                        <Link to={`/product/${encodeURIComponent(design.id)}`} className="absolute inset-0 z-0 block" aria-label={`View ${design.name} details`}><img src={cardImage} loading="lazy" className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.035] sm:p-7" alt={`${design.name}, ${selectedSide} view`} /></Link>
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3.5 sm:p-4"><span className="max-w-[62%] truncate rounded-full border border-white/10 bg-[#080b09]/70 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.13em] text-white/80 backdrop-blur">{design.productId.replace(/-/g, ' ')}</span><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#080b09]/70 px-3 py-1.5 text-[8px] font-bold text-white/80 backdrop-blur"><span className="h-2 w-2 rounded-full border border-white/50" style={{ backgroundColor: garmentColor }} />{colorName}</span></div>
                        {hasSides && <div className="absolute bottom-3 left-3 z-20 inline-flex rounded-full border border-white/10 bg-[#080b09]/75 p-1 backdrop-blur sm:bottom-4 sm:left-4" role="group" aria-label={`Choose ${design.name} view`}>{(['front', 'back'] as const).map((side) => <button key={side} type="button" onClick={() => setPreviewSides((current) => ({ ...current, [design.id]: side }))} aria-pressed={selectedSide === side} className={clsx('min-h-8 rounded-full px-3 text-[8px] font-black uppercase tracking-[.13em] transition sm:min-h-9 sm:px-4', selectedSide === side ? 'bg-white text-slate-950' : 'text-white/60 hover:text-white')}>{side}</button>)}</div>}
                        <Link to={`/product/${encodeURIComponent(design.id)}`} className="absolute bottom-3 right-3 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-[#080b09]/75 px-3.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur transition hover:border-lime-200/50 hover:text-lime-100 sm:bottom-4 sm:right-4"><Eye className="h-3.5 w-3.5" /> Details</Link>
                      </div>
                      <div className="px-0.5 pt-4">
                        <p className="text-[8px] font-black uppercase tracking-[.18em] text-lime-200/80">{printLabel}</p>
                        <div className="mt-1.5 flex items-start justify-between gap-3"><Link to={`/product/${encodeURIComponent(design.id)}`} className="min-w-0 text-base font-black leading-snug text-white transition hover:text-lime-100 sm:text-lg"><span className="line-clamp-2">{design.name}</span></Link><span className="shrink-0 pt-0.5 text-sm font-black text-white">KES {(design.price ?? 0).toLocaleString()}</span></div>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[.08] pt-3"><span className="text-[9px] font-medium text-white/40">Designed by {creatorName}</span><button type="button" disabled={!isOnline} onClick={() => handleBuyNow(design)} className={clsx('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[9px] font-black uppercase tracking-[.12em] transition', isOnline ? 'bg-lime-200 text-slate-950 hover:bg-lime-100' : 'cursor-not-allowed border border-white/10 text-white/40')}><ShoppingBag className="h-3.5 w-3.5" />{isOnline ? 'Buy now' : 'Closed'}</button></div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <section aria-labelledby="studio-notes-title" className="relative mt-16 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0e0b]/45 p-6 backdrop-blur-sm sm:mt-24 sm:rounded-[2.25rem] sm:p-9 lg:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-lime-300/[.07] blur-3xl" />
            <div className="relative grid gap-7 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-12">
              <div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-lime-200/20 bg-lime-200/[.06] text-lime-100"><Mail className="h-4 w-4" /></span><p className="mt-4 text-[8px] font-black uppercase tracking-[.22em] text-lime-200">A note from the studio</p><h2 id="studio-notes-title" className="mt-2 text-3xl font-black tracking-[-.05em] text-white sm:text-4xl">Studio notes.</h2><p className="mt-3 max-w-md text-sm leading-6 text-white/60">Get occasional updates on new products and creative ideas, delivered straight to your inbox.</p><p className="mt-3 text-[10px] text-white/40">Thoughtful updates, sent occasionally.</p></div>
              <form onSubmit={handleNewsletterSignup} className="relative grid min-w-0 gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
                <label className="sr-only" htmlFor="studio-notes-name">Name (optional)</label><input id="studio-notes-name" value={newsletterName} onChange={(event) => setNewsletterName(event.target.value)} maxLength={100} autoComplete="name" placeholder="Name (optional)" className="h-12 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-lime-200/50" />
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="sr-only" htmlFor="studio-notes-email">Email address</label><input id="studio-notes-email" type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required maxLength={254} autoComplete="email" placeholder="Email address" className="h-12 min-w-0 rounded-xl border border-white/10 bg-white/[.035] px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-lime-200/50" /><button type="submit" disabled={isNewsletterSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lime-200 px-5 text-[10px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-lime-100 disabled:opacity-60">{isNewsletterSubmitting ? 'Joining…' : 'Join the list'} <ArrowRight className="h-4 w-4" /></button></div>
                <label aria-hidden="true" className="hidden">Leave this field empty<input tabIndex={-1} name="website" autoComplete="off" /></label>
                {newsletterStatus && <p role="status" className={clsx('text-xs leading-5', newsletterStatus.toLowerCase().includes('could not') || newsletterStatus.toLowerCase().includes('failed') ? 'text-rose-200' : 'text-emerald-200')}>{newsletterStatus}</p>}
              </form>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default ShopPage;
