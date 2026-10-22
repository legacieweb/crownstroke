import { eq } from 'drizzle-orm';
import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

import ProductCard from '../components/catalog/ProductCard';
import { Product } from '../types';
import { CheckCircle2, ChevronDown, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { PRODUCT_DATA } from '../data/seed';


type SortMode = 'featured' | 'price-low' | 'price-high' | 'name';
type ViewMode = 'grid' | 'list';

const categories = [
  { id: 'all', label: 'All products' },
  { id: 't-shirt', label: 'T-Shirts' },
  { id: 'hoodie', label: 'Hoodies' },
  { id: 'long-sleeve-tee', label: 'Long Sleeve' },
  { id: 'tank-top', label: 'Tank Tops' },
  { id: 'mug', label: 'Mugs' },
  { id: 'poster', label: 'Posters' },
  { id: 'art-design', label: 'Art Designs' },
];

const blankProducts: Product[] = Object.entries(PRODUCT_DATA).map(([category, colorSet]: [string, any]) => {
  const colors = Object.keys(colorSet);
  const first = colorSet[colors[0]];
  const label = category.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
  const apparel = ['t-shirt', 'hoodie', 'long-sleeve-tee', 'tank-top'].includes(category);

  return {
    id: 'template-' + category,
    name: label + ' Blank',
    description: 'A clean ' + label.toLowerCase() + ' ready for your own artwork.',
    price: category === 't-shirt' ? 1500 : category === 'hoodie' ? 3500 : category === 'poster' ? 1800 : category === 'mug' ? 1200 : 1600,
    image: first.front,
    category: category as Product['category'],
    isCustomizable: true,
    colors,
    sizes: apparel ? ['S', 'M', 'L', 'XL', 'XXL'] : undefined,
    images: { front: first.front, back: first.back },
  };
});

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: 'featured', label: 'Featured first' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'name', label: 'Name A-Z' }
];

const categoryLabel = (category: string) => categories.find((item) => item.id === category)?.label || category.replace(/-/g, ' ');

const Shop: React.FC = () => {
  useSeo({
    title: 'Designer Shops | Crownstroke',

    description:
      'Discover original products listed by independent designers in their own Crownstroke shops.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/shop`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  const [activeCategory, setActiveCategory] = useState('all');

  const [products, setProducts] = useState<Product[]>(blankProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toast, setToast] = useState<{ id: number; product: Product } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [featured, designerRows, shopRows] = await Promise.all([
          db.select({
            id: designerDesigns.id,
            name: designerDesigns.name,
            productId: designerDesigns.productId,
            preview: designerDesigns.preview,
            designData: designerDesigns.designData,
            price: designerDesigns.price,
            designerId: designerDesigns.designerId,
            shopId: designerDesigns.shopId,
          }).from(designerDesigns),
          db.select({ id: designers.id, name: designers.name, email: designers.email }).from(designers),
          db.select({ id: shops.id, name: shops.name, slug: shops.slug }).from(shops),
        ]);

        const designersById = new Map(designerRows.map((designer) => [String(designer.id).toLowerCase(), designer]));
        const shopsById = new Map(shopRows.map((shop) => [String(shop.id).toLowerCase(), shop]));
        const dbProducts: Product[] = featured.map((f) => {
          const designer = designersById.get(String(f.designerId).toLowerCase());
          const shop = shopsById.get(String(f.shopId).toLowerCase());
          const designData = (f.designData || {}) as { activeSide?: 'front' | 'back'; front?: { objects?: unknown[] } | null; back?: { objects?: unknown[] } | null; previews?: { front?: string | null; back?: string | null } };
          const productMockups = PRODUCT_DATA[f.productId] || {};
          const blankMockups = productMockups['#ffffff'] || productMockups[Object.keys(productMockups)[0]] || {};
          const sideImage = (side: 'front' | 'back') => designData[side]?.objects?.length
            ? designData.previews?.[side] || (designData.activeSide === side ? f.preview : blankMockups[side]) || f.preview
            : blankMockups[side] || f.preview;

          return {
            id: f.id,
            name: f.name,
            description: 'An original design by ' + (designer?.name || 'an independent designer') + '.',
            price: f.price ?? 0,
            image: sideImage(designData.activeSide || 'front'),
            category: f.productId as Product['category'],
            isCustomizable: false,
            images: { front: sideImage('front'), back: sideImage('back') },
            previewOrder: designData.back?.objects?.length && !designData.front?.objects?.length ? ['back', 'front'] : ['front', 'back'],
            designerEmail: designer?.email,
            designerId: f.designerId,
            designerName: designer?.name || undefined,
            shopSlug: shop?.slug || undefined,
            shopName: shop?.name || undefined,
            designId: f.id,
          };
        });

        setProducts([...blankProducts, ...dbProducts]);
      } catch (err) {
        console.error('Failed to fetch shop products:', err);
        setProducts(blankProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc.all = (acc.all || 0) + 1;
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.designerName || '').toLowerCase().includes(query) ||
        (product.shopName || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-low') return (a.price ?? 0) - (b.price ?? 0);
      if (sortMode === 'price-high') return (b.price ?? 0) - (a.price ?? 0);
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return Number(Boolean(b.isCustomizable)) - Number(Boolean(a.isCustomizable));
    });
  }, [activeCategory, products, searchTerm, sortMode]);

  const visibleProducts = useMemo(() => {
    return showAllProducts ? filteredProducts : filteredProducts.slice(0, 8);
  }, [filteredProducts, showAllProducts]);

  useEffect(() => {
    setShowAllProducts(false);
  }, [activeCategory, searchTerm, sortMode]);

  const handleAdded = (product: Product) => {
    setToast({ id: Date.now(), product });
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setSortMode('featured');
    setShowAllProducts(false);
  };

  return (
    <Layout>
      <div className="bg-transparent px-4 pb-10 pt-3 sm:px-6 lg:px-8">
        {toast && (
            <div
              className="fixed right-4 top-24 z-[80] flex max-w-sm items-center gap-3 rounded-lg border border-emerald-200/60 bg-white/90 p-4 text-slate-950 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black">Added to cart</p>
                <p className="truncate text-xs font-semibold text-slate-500">{toast.product.name}</p>
              </div>
              <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

        <div className="mx-auto max-w-[88rem]">
          <section className="sticky top-20 z-50 mb-4 rounded-lg border border-white/25 bg-black/55 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-4">
            <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary-200">Crownstroke Marketplace</p>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                  <h1 className="text-3xl font-black leading-none tracking-tight text-white drop-shadow md:text-4xl">Make room for great design</h1>
                  <p className="pb-1 text-xs font-black uppercase tracking-widest text-white/55">
                    {filteredProducts.length} of {products.length} products
                  </p>
                </div>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white">
                  Start with a blank canvas, or shop original pieces from independent designers.
                </p>
              </div>
              <div className="hidden rounded-lg border border-white/25 bg-white/15 px-4 py-3 backdrop-blur-md lg:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/55">Catalog</p>
                <p className="mt-1 text-xl font-black text-white">Blanks + originals</p>
              </div>
            </header>

            <div className="mt-4 flex items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setIsFilterOpen((value) => !value)}
                className="flex h-11 items-center gap-2 rounded-lg border border-white/25 bg-white px-4 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg"
                aria-expanded={isFilterOpen}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                <ChevronDown className={`h-4 w-4 transition ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${viewMode === 'grid' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${viewMode === 'list' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className={`mt-3 grid gap-3 lg:grid lg:grid-cols-[1fr_220px_auto] lg:items-center ${isFilterOpen ? 'grid' : 'hidden'}`}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-300" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products, categories, designs..."
                  className="w-full rounded-lg border border-white/25 bg-white/20 py-2.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-primary-200"
                />
              </div>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sort products"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-300/40"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-white font-medium text-slate-950">{option.label}</option>
                ))}
              </select>

              <div className="hidden items-center gap-2 lg:flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${viewMode === 'grid' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65 hover:bg-white/25 hover:text-white'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${viewMode === 'list' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65 hover:bg-white/25 hover:text-white'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-black uppercase tracking-widest transition ${
                      activeCategory === category.id
                        ? 'bg-white text-slate-950 shadow-lg shadow-black/10'
                        : 'bg-white/10 text-white/75 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className="rounded bg-black/10 px-2 py-0.5 text-[10px]">
                      {categoryCounts[category.id] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-white/65">
              <span className="rounded-md bg-white/15 px-2 py-1">{categoryLabel(activeCategory)}</span>
              {!showAllProducts && filteredProducts.length > 8 && (
                <span className="rounded-md bg-primary-400/20 px-2 py-1 text-primary-100">Showing first 8</span>
              )}
              {(searchTerm || activeCategory !== 'all' || sortMode !== 'featured') && (
                <button onClick={resetFilters} className="rounded-md border border-white/25 px-2 py-1 text-primary-100 hover:bg-white/15">
                  Reset filters
                </button>
              )}
            </div>
          </section>

          <main className="product-motion">
                {isLoading ? (
                  <div className="flex min-h-full flex-col items-center justify-center rounded-lg border border-white/25 bg-white/15 py-24 backdrop-blur-md">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
                    <p className="mt-4 text-xs font-black uppercase tracking-widest text-white/60">Loading shop</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="rounded-lg border border-white/25 bg-white/15 p-12 text-center backdrop-blur-md">
                    <h2 className="text-2xl font-black text-white">Nothing in this corner yet</h2>
                    <p className="mt-2 text-sm font-semibold text-white/70">Try another search, or clear the filters to browse every blank and artist original.</p>
                    <button onClick={resetFilters} className="mt-6 rounded-lg bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 pb-6 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4 pb-6'}>
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} layout={viewMode} onAdded={handleAdded} />
                    ))}
                  </div>
                )}
                {!isLoading && filteredProducts.length > 8 && (
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllProducts((value) => !value)}
                      className="rounded-lg border border-white/25 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
                    >
                      {showAllProducts ? 'Show first 8' : `Show all ${filteredProducts.length} products`}
                    </button>
                  </div>
                )}
          </main>
        </div>
      </div>
    </Layout>
  );
};


export default Shop;
