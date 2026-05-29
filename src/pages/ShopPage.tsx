import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout, { BackendStatusContext } from '../components/layout/Layout';
import { useCart } from '../store/CartContext';
import { 
  Palette, 
  ShoppingBag, 
  Star, 
  Share2, 
  ChevronRight,
  Filter,
  LayoutGrid,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Heart
} from 'lucide-react';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../db';
import { designerDesigns, shops, designers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { clsx } from 'clsx';
import videoSrc from '../assets/42154-431423229.mp4';

const ShopPage: React.FC = () => {
  const { shopName } = useParams<{ shopName: string }>();
  const { addToCart } = useCart();
  const { isOnline } = React.useContext(BackendStatusContext);
  const [designs, setDesigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchShopDesigns = async () => {
      if (!shopName) return;
      setIsLoading(true);
      try {
        const shop = await db.select()
          .from(shops)
          .where(eq(shops.slug, shopName))
          .limit(1);

        if (shop.length > 0) {
          const s = shop[0];
          
          // Fetch designer to get hero image
          const designer = await db.select()
            .from(designers)
            .where(eq(designers.id, s.designerId))
            .limit(1);
          
          if (designer.length > 0) {
            setHeroImage(designer[0].heroImage);
          }

          const shopDesigns = await db.select({
            id: designerDesigns.id,
            name: designerDesigns.name,
            productId: designerDesigns.productId,
            preview: designerDesigns.preview,
            price: designerDesigns.price,
            designerId: designerDesigns.designerId,
            designerEmail: designers.email
          })
            .from(designerDesigns)
            .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
            .where(eq(designerDesigns.shopId, shop[0].id));
          
          setDesigns(shopDesigns);
        }
      } catch (err) {
        console.error('Error fetching shop designs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopDesigns();
  }, [shopName]);

  const handleAddToCart = (design: any) => {
    if (!isOnline) {
      alert('Shop is currently closed! You can still design and save to drafts.');
      return;
    }
    const product = {
      id: design.id,
      name: design.name,
      description: `Designer creation by ${design.designerEmail}`,
      price: design.price,
      image: design.preview,
      category: design.productId as any,
      isCustomizable: false,
      designerId: design.designerId,
      designerEmail: design.designerEmail,
      designId: design.id
    };
    addToCart(product as any, 1, 'M', '#ffffff');
    alert(`${design.name} added to cart!`);
  };

  const filteredDesigns = activeCategory === 'all' 
    ? designs 
    : designs.filter(d => d.productId === activeCategory);

  const categories = ['all', ...new Set(designs.map(d => d.productId))];

  return (
    <Layout>
      <div className="fixed inset-0 z-0">
        {heroImage ? (
          <>
            <img src={heroImage} className="w-full h-full object-cover opacity-40" alt="Hero" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="relative z-10 min-h-screen pb-40 selection:bg-primary-500/30">
        {/* Modern Hero */}
        <div className="relative pt-32 pb-20 flex items-center justify-center overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                 <h1 className="text-6xl md:text-9xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                    {shopName?.replace('-', ' ')}
                 </h1>
                 
                 <p className="text-primary-400 font-black uppercase tracking-[0.4em] text-[10px] mb-10">Architecting Digital Fabric</p>
                 
                 <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="premium" className="h-14 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-primary-500/20">
                       <Zap className="w-4 h-4" /> Sync With Creator
                    </Button>
                    <button className="h-14 px-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all gap-3 font-black uppercase tracking-widest text-[10px]">
                       <Share2 className="w-4 h-4" /> Share
                    </button>
                 </div>
              </motion.div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
           {/* Minimalist Stats */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 py-12 border-y border-white/5">
              {[
                { label: 'Artifacts', value: designs.length },
                { label: 'Global Pulse', value: '14.2k' },
                { label: 'Reputation', value: '99%' },
                { label: 'Network', value: '2.8k' },
              ].map((stat, i) => (
                <div key={i} className="text-center px-4">
                   <div className="text-4xl font-black text-white tracking-tighter mb-1 italic">{stat.value}</div>
                   <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
           </div>

           {/* Filter System */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 px-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
                 {categories.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={clsx(
                       "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                       activeCategory === cat 
                        ? "bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/20" 
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                     )}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Sorting Engine</span>
                <button className="flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-white transition-colors">
                   <Filter className="w-4 h-4" /> Optimize View
                </button>
              </div>
           </div>

           {/* Collection Grid */}
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Vault...</p>
             </div>
           ) : filteredDesigns.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                <Palette className="w-20 h-20 text-white/5 mb-8" />
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">No Assets Detected</h3>
                <p className="text-white/40 text-sm font-bold max-w-sm mx-auto uppercase tracking-widest">This designer is currently in the ideation phase. Synchronize later for updates.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <AnimatePresence mode="popLayout">
                  {filteredDesigns.map((design, i) => (
                    <motion.div 
                      key={design.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="group relative"
                    >
                      <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white/5 border border-white/10 transition-all duration-700 group-hover:border-primary-500/50 group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                         {/* Product Image */}
                         <img 
                           src={design.preview} 
                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                           alt={design.name} 
                         />
                         
                         {/* Overlay Logic */}
                         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                         
                         <div className="absolute inset-0 flex flex-col justify-end p-10 translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="mb-6 opacity-0 group-hover:opacity-100 transition-all delay-100">
                               <span className="px-3 py-1 bg-primary-500 text-[8px] font-black text-white uppercase tracking-widest rounded-full mb-3 inline-block">
                                  Premium Quality
                               </span>
                               <h4 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">
                                  {design.name}
                               </h4>
                            </div>
                            
                            <div className="flex items-center justify-between gap-4 scale-95 group-hover:scale-100 transition-transform duration-500">
                               <div className="text-3xl font-black text-white italic drop-shadow-lg">KES {design.price.toLocaleString()}</div>
                               <Button 
                                 variant={isOnline ? "premium" : "outline"}
                                 className={clsx(
                                   "flex-grow h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl",
                                   isOnline ? "shadow-primary-500/20" : "border-white/10 text-white/40 cursor-not-allowed"
                                 )}
                                 onClick={() => handleAddToCart(design)}
                               >
                                  {isOnline ? "Deploy Asset" : "Shop Closed"}
                               </Button>
                               <button className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all">
                                  <Heart className="w-5 h-5" />
                               </button>
                            </div>
                         </div>

                         {/* Side Indicator */}
                         <div className="absolute top-8 left-8">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                               <LayoutGrid className="w-3 h-3 text-primary-400" />
                               <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{design.productId}</span>
                            </div>
                         </div>

                         {/* Action Badge */}
                         {design.isFeatured === 'true' && (
                           <div className="absolute top-8 right-8">
                              <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/40 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                 <Star className="w-6 h-6 text-white" fill="currentColor" />
                              </div>
                           </div>
                         )}
                      </div>
                      
                      {/* Floating Decorative Elements */}
                      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>
           )}

           {/* Newsletter / Contact Section */}
           <div className="mt-40 bg-white/5 border border-white/10 rounded-[4rem] p-16 md:p-32 relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/10 blur-[100px] rounded-full -mr-40 -mt-40" />
              <div className="relative z-10 max-w-2xl mx-auto">
                 <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
                    Never Miss a <span className="text-primary-500">Drop</span>
                 </h2>
                 <p className="text-white/40 font-bold uppercase tracking-widest text-xs mb-12 max-w-md mx-auto leading-loose">
                    Join the internal network to receive telemetry on new collection deployments and limited release artifacts.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      placeholder="ENTER_COMM_CHANNEL_@EMAIL.COM" 
                      className="flex-grow bg-black/40 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-500 outline-none font-bold italic"
                    />
                    <Button variant="premium" className="h-[68px] px-12 rounded-2xl font-black uppercase tracking-widest text-xs gap-3">
                       Initialize <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
