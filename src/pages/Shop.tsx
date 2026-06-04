import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/catalog/ProductCard';
import { Product } from '../types';
import { CheckCircle2, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { db } from '../db';
import { designerDesigns, designers } from '../db/schema';
import { eq, or } from 'drizzle-orm';

import { PRODUCT_DATA as SEED_DATA, READY_MADE_PRODUCTS } from '../data/seed';

type PriceFilter = 'all' | 'under-2000' | '2000-5000' | 'over-5000';
type SortMode = 'featured' | 'price-low' | 'price-high' | 'name';
type ViewMode = 'grid' | 'list';

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 't-shirt', label: 'T-Shirts' },
  { id: 'hoodie', label: 'Hoodies' },
  { id: 'long-sleeve-tee', label: 'Long Sleeve' },
  { id: 'tank-top', label: 'Tank Tops' },
  { id: 'mug', label: 'Mugs' },
  { id: 'poster', label: 'Posters' },
  { id: 'art-design', label: 'Art Designs' }
];

const priceFilters: Array<{ id: PriceFilter; label: string }> = [
  { id: 'all', label: 'Any price' },
  { id: 'under-2000', label: 'Under KES 2,000' },
  { id: '2000-5000', label: 'KES 2,000 - 5,000' },
  { id: 'over-5000', label: 'Over KES 5,000' }
];

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: 'featured', label: 'Featured first' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'name', label: 'Name A-Z' }
];

const categoryLabel = (category: string) => categories.find((item) => item.id === category)?.label || category.replace(/-/g, ' ');

const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toast, setToast] = useState<{ id: number; product: Product } | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const featured = await db.select({
          id: designerDesigns.id,
          name: designerDesigns.name,
          productId: designerDesigns.productId,
          preview: designerDesigns.preview,
          price: designerDesigns.price,
          designerEmail: designers.email,
          designerId: designers.id,
        })
          .from(designerDesigns)
          .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
          .where(or(eq(designerDesigns.isFeatured, 'shop'), eq(designerDesigns.isFeatured, 'true')));

        const dbProducts: Product[] = featured.map((f) => ({
          id: f.id,
          name: f.name,
          description: `Designer creation: ${f.name}`,
          price: f.price ?? 0,
          image: f.preview,
          category: f.productId as any,
          isCustomizable: false,
          designerEmail: f.designerEmail,
          designerId: f.designerId,
          designId: f.id
        } as any));

        const templateProducts: Product[] = Object.entries(SEED_DATA).map(([category, colorsData]) => {
          const colors = colorsData as any;
          const firstColor = Object.keys(colors)[0];
          const firstImageData = colors[firstColor];

          return {
            id: `template-${category}`,
            name: `${category.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Essential`,
            description: `Premium customizable ${category.replace(/-/g, ' ')}. Add your own artwork and make it personal.`,
            price: category === 't-shirt' ? 1500 : category === 'hoodie' ? 3500 : 1200,
            image: firstImageData.front,
            category: category as any,
            isCustomizable: true,
            colors: Object.keys(colors),
            sizes: ['t-shirt', 'hoodie', 'long-sleeve-tee', 'tank-top'].includes(category) ? ['S', 'M', 'L', 'XL', 'XXL'] : undefined
          };
        });

        const readyMade: Product[] = READY_MADE_PRODUCTS.map((p) => ({
          ...p,
          description: 'Exclusive ready-made design from Crownstroke collection.',
          isCustomizable: false
        })) as Product[];

        setProducts([...dbProducts, ...readyMade, ...templateProducts]);
      } catch (err) {
        console.error('Failed to fetch shop products:', err);
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
        product.category.toLowerCase().includes(query);
      const price = product.price ?? 0;
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under-2000' && price < 2000) ||
        (priceFilter === '2000-5000' && price >= 2000 && price <= 5000) ||
        (priceFilter === 'over-5000' && price > 5000);

      return matchesCategory && matchesSearch && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-low') return (a.price ?? 0) - (b.price ?? 0);
      if (sortMode === 'price-high') return (b.price ?? 0) - (a.price ?? 0);
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return Number(Boolean((b as any).designerId)) - Number(Boolean((a as any).designerId));
    });
  }, [activeCategory, priceFilter, products, searchTerm, sortMode]);

  const handleAdded = (product: Product) => {
    setToast({ id: Date.now(), product });
  };

  const resetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setPriceFilter('all');
    setSortMode('featured');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-transparent px-4 pb-24 pt-8 sm:px-6 lg:px-8">
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

        <div className="mx-auto max-w-7xl">
          <header className="mb-6 rounded-lg border border-white/25 bg-white/12 p-5 shadow-2xl shadow-black/10 backdrop-blur-md">
            <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-primary-200">Crownstroke Marketplace</p>
                <h1 className="text-4xl font-black tracking-tight text-white drop-shadow md:text-6xl">Shop Designs</h1>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-white/85">
                  Browse ready-made pieces, designer drops, and blank products you can customize instantly.
                </p>
              </div>
              <div className="rounded-lg border border-white/25 bg-white/20 p-4 backdrop-blur-md">
                <p className="text-xs font-black uppercase tracking-widest text-white/60">Showing</p>
                <p className="mt-2 text-3xl font-black text-white">{filteredProducts.length}</p>
                <p className="text-sm font-semibold text-white/70">of {products.length} available products</p>
              </div>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside
              className="mb-5 lg:sticky lg:top-32 lg:z-30 lg:mb-0 lg:h-fit lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto lg:pr-1"
            >
              <div
                className="rounded-lg border border-white/25 bg-white/15 p-4 shadow-2xl shadow-black/10 backdrop-blur-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Categories</h2>
                  <div>
                    <SlidersHorizontal className="h-4 w-4 text-primary-200" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center justify-between rounded-md px-3 py-3 text-left text-xs font-black uppercase tracking-widest transition ${
                        activeCategory === category.id
                          ? 'bg-white text-slate-950 shadow-lg shadow-black/10'
                          : 'bg-white/10 text-white/75 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <span>{category.label}</span>
                      <span
                        className="ml-2 rounded bg-black/10 px-2 py-0.5 text-[10px]"
                      >
                        {categoryCounts[category.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 border-t border-white/20 pt-5">
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-white/55">Price</h3>
                  <div className="space-y-2">
                    {priceFilters.map((filter) => (
                      <label key={filter.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold text-white/75 hover:bg-white/15">
                        <input
                          type="radio"
                          name="price"
                          checked={priceFilter === filter.id}
                          onChange={() => setPriceFilter(filter.id)}
                          className="h-4 w-4 accent-primary-500"
                        />
                        {filter.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="space-y-5">
              <section className="rounded-lg border border-white/25 bg-white/15 p-4 shadow-2xl shadow-black/10 backdrop-blur-md">
                <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-300" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products, categories, designs..."
                      className="w-full rounded-lg border border-white/25 bg-white/20 py-3 pl-12 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-primary-200"
                    />
                  </div>

                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-lg border border-white/25 bg-white/20 px-4 py-3 text-sm font-black uppercase tracking-widest text-white outline-none backdrop-blur-md focus:border-primary-200"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${viewMode === 'grid' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65 hover:bg-white/25 hover:text-white'}`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${viewMode === 'list' ? 'border-white bg-white text-slate-950' : 'border-white/25 bg-white/15 text-white/65 hover:bg-white/25 hover:text-white'}`}
                      aria-label="List view"
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-white/65">
                  <span className="rounded-md bg-white/15 px-2 py-1">{categoryLabel(activeCategory)}</span>
                  <span className="rounded-md bg-white/15 px-2 py-1">{priceFilters.find((filter) => filter.id === priceFilter)?.label}</span>
                  {(searchTerm || activeCategory !== 'all' || priceFilter !== 'all' || sortMode !== 'featured') && (
                    <button onClick={resetFilters} className="rounded-md border border-white/25 px-2 py-1 text-primary-100 hover:bg-white/15">
                      Reset filters
                    </button>
                  )}
                </div>
              </section>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-white/25 bg-white/15 py-24 backdrop-blur-md">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-white/60">Loading shop</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-white/25 bg-white/15 p-12 text-center backdrop-blur-md">
                  <h2 className="text-2xl font-black text-white">No products match those filters</h2>
                  <p className="mt-2 text-sm font-semibold text-white/70">Try a different category, price range, or search term.</p>
                  <button onClick={resetFilters} className="mt-6 rounded-lg bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-950">
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3' : 'space-y-4'}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} layout={viewMode} onAdded={handleAdded} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
