import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/catalog/ProductCard';
import { Product } from '../types';
import { Search, Filter, SlidersHorizontal, LayoutGrid, List, Palette, ChevronRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { db } from '../db';
import { designerDesigns, designers } from '../db/schema';
import { eq, or } from 'drizzle-orm';
import { motion } from 'framer-motion';

import { PRODUCT_DATA as SEED_DATA, READY_MADE_PRODUCTS } from '../data/seed';

const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['all', 't-shirt', 'hoodie', 'long-sleeve-tee', 'tank-top', 'mug', 'poster', 'art-design'];

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
        
        const dbProducts: Product[] = featured.map(f => ({
          id: f.id,
          name: f.name,
          description: `Designer creation: ${f.name}`,
          price: f.price,
          image: f.preview,
          category: f.productId as any,
          isCustomizable: false,
          designerEmail: f.designerEmail,
          designerId: f.designerId
        } as any));

        const templateProducts: Product[] = Object.entries(SEED_DATA).map(([category, colorsData], index) => {
          const colors = colorsData as any;
          const firstColor = Object.keys(colors)[0];
          const firstImageData = colors[firstColor];
          
          return {
            id: `template-${category}`,
            name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Essential',
            description: `Premium customizable ${category}. Add your legend design today.`,
            price: category === 't-shirt' ? 1500 : category === 'hoodie' ? 3500 : 1200,
            image: firstImageData.front,
            category: category as any,
            isCustomizable: true,
            colors: Object.keys(colors),
            sizes: ['t-shirt', 'hoodie', 'long-sleeve-tee', 'tank-top'].includes(category) ? ['S', 'M', 'L', 'XL', 'XXL'] : undefined
          };
        });

        const readyMade: Product[] = READY_MADE_PRODUCTS.map(p => ({
          ...p,
          description: "Exclusive ready-made design from Crownstroke collection.",
          isCustomizable: false
        })) as Product[];

        // Combine and Sort: DB products first, then ready-made, then templates
        setProducts([...dbProducts, ...readyMade, ...templateProducts]);
      } catch (err) {
        console.error('Failed to fetch shop products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  return (
    <Layout>
      <div className="bg-transparent min-h-screen pb-24">
        {/* Header */}
        <header className="py-12 lg:py-20 mb-12 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Shop Ready-made <span className="text-primary-500 italic">Merch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl font-medium leading-relaxed">
              Discover unique products created by top designers. Customize any item to make it truly yours or buy as-is.
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Filters - Redesigned Floating Sidebar */}
            <aside className="lg:w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-32">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {/* Category Card */}
                  <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary-500/20 transition-colors" />
                    
                    <div className="relative mb-8 flex items-center justify-between">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(var(--color-primary-500),0.5)]" />
                        Vault
                      </h3>
                      <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      {categories.map((cat, idx) => (
                        <motion.button
                          key={cat}
                          whileHover={{ x: 8 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full group/btn px-6 py-4 rounded-2xl flex items-center justify-between transition-all duration-300 border ${
                            activeCategory === cat
                              ? 'bg-primary-600 border-primary-500 text-white shadow-[0_10px_20px_rgba(var(--color-primary-600),0.3)]'
                              : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10'
                          }`}
                        >
                          <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                            {cat === 'all' ? 'Universal Access' : cat.replace(/-/g, ' ')}
                          </span>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                            activeCategory === cat ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100'
                          }`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Card */}
                  <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -ml-16 -mb-16" />
                    
                    <h3 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3 italic">
                      <div className="w-2 h-6 bg-white/20 rounded-full" />
                      Economy
                    </h3>

                    <div className="space-y-6">
                      {[
                        { id: 'p1', label: 'KES 0 - 2,000', range: 'entry' },
                        { id: 'p2', label: 'KES 2,000 - 5,000', range: 'mid' },
                        { id: 'p3', label: 'KES 5,000+', range: 'premium' }
                      ].map((range) => (
                        <label key={range.id} className="flex items-center gap-4 cursor-pointer group/label">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              id={range.id} 
                              className="peer hidden" 
                            />
                            <div className="w-6 h-6 rounded-lg border-2 border-white/10 bg-white/5 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all duration-300 group-hover/label:border-white/30" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/label:text-white transition-colors italic">
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Aesthetic Info Card */}
                  <div className="bg-primary-600/10 backdrop-blur-xl rounded-[2.5rem] p-6 border border-primary-500/20">
                    <p className="text-[9px] font-bold text-primary-400 uppercase tracking-[0.3em] leading-relaxed">
                      All artifacts are cryptographically verified and manufactured using high-precision digital fabricator units.
                    </p>
                  </div>
                </motion.div>
              </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-grow space-y-12">
              {/* Controls */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-6 justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl"
              >
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search artifacts..."
                    className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-black text-[10px] uppercase tracking-widest text-white placeholder:text-white/20"
                  />
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="hidden sm:flex items-center gap-3 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                    <button className="p-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20">
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-white/40 hover:text-white transition-colors">
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="h-10 w-px bg-white/10 hidden sm:block" />
                  
                  <button className="flex items-center gap-3 text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] hover:text-white transition-colors">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                </div>
              </motion.div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {isLoading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-white/40 font-black uppercase tracking-widest text-xs">Accessing Vault...</p>
                  </div>
                ) : products
                  .filter(p => activeCategory === 'all' || p.category === activeCategory)
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                }
              </div>
              
              {/* Load More */}
              <div className="flex justify-center pt-12">
                <Button variant="outline" size="lg" className="px-12 rounded-2xl font-black border-2 border-slate-200 hover:border-primary-600 hover:text-primary-600 transition-all">
                  Load More Products
                </Button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
