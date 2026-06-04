import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, ArrowRight, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { Product } from '../../types';
import { db } from '../../db';
import { designerDesigns, designers } from '../../db/schema';
import { eq, or } from 'drizzle-orm';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const PopularProducts: React.FC = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const featured = await db.select({
          id: designerDesigns.id,
          name: designerDesigns.name,
          productId: designerDesigns.productId,
          preview: designerDesigns.preview,
          price: designerDesigns.price,
          designerEmail: designers.email,
          designerId: designers.id,
          isFeatured: designerDesigns.isFeatured,
        })
          .from(designerDesigns)
          .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
          .where(or(eq(designerDesigns.isFeatured, 'home'), eq(designerDesigns.isFeatured, 'true')));
        
        if (featured.length === 0) {
          setProducts([
            {
              id: 'trend-1',
              name: 'ELITE SIGNATURE TEE',
              price: 1500,
              image: SEED_DATA['t-shirt']['#ffffff'].front,
              category: 'T-Shirt',
              rating: 4.9,
              tag: 'BESTSELLER',
              designerEmail: 'admin@crownstroke.com'
            },
            {
              id: 'trend-2',
              name: 'LEGEND URBAN HOODIE',
              price: 3500,
              image: SEED_DATA['hoodie']['#000000'].front,
              category: 'Hoodie',
              rating: 5.0,
              tag: 'NEW DROP',
              designerEmail: 'admin@crownstroke.com'
            },
            {
              id: 'trend-3',
              name: 'MINIMALIST TEE',
              price: 1500,
              image: SEED_DATA['t-shirt']['#000000'].front,
              category: 'T-Shirt',
              rating: 4.8,
              tag: 'TRENDING',
              designerEmail: 'admin@crownstroke.com'
            },
            {
              id: 'trend-4',
              name: 'MODERN MUG',
              price: 1200,
              image: SEED_DATA['mug']['#ffffff'].front,
              category: 'Mug',
              rating: 4.7,
              tag: 'ESSENTIAL',
              designerEmail: 'admin@crownstroke.com'
            }
          ]);
        } else {
          setProducts(featured.map(f => ({
            id: f.id,
            name: f.name,
            price: f.price ?? 0,
            image: f.preview,
            category: f.productId,
            rating: 5.0,
            tag: 'FEATURED',
            designerEmail: f.designerEmail,
            designerId: f.designerId
          })));
        }
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        // Fallback to seed data on any error
        setProducts([
          {
            id: 'trend-1',
            name: 'ELITE SIGNATURE TEE',
            price: 1500,
            image: SEED_DATA['t-shirt']['#ffffff'].front,
            category: 'T-Shirt',
            rating: 4.9,
            tag: 'BESTSELLER',
            designerEmail: 'admin@crownstroke.com'
          },
          {
            id: 'trend-2',
            name: 'LEGEND URBAN HOODIE',
            price: 3500,
            image: SEED_DATA['hoodie']['#000000'].front,
            category: 'Hoodie',
            rating: 5.0,
            tag: 'NEW DROP',
            designerEmail: 'admin@crownstroke.com'
          },
          {
            id: 'trend-3',
            name: 'MINIMALIST TEE',
            price: 1500,
            image: SEED_DATA['t-shirt']['#000000'].front,
            category: 'T-Shirt',
            rating: 4.8,
            tag: 'TRENDING',
            designerEmail: 'admin@crownstroke.com'
          },
          {
            id: 'trend-4',
            name: 'MODERN MUG',
            price: 1200,
            image: SEED_DATA['mug']['#ffffff'].front,
            category: 'Mug',
            rating: 4.7,
            tag: 'ESSENTIAL',
            designerEmail: 'admin@crownstroke.com'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const realProduct: Product = {
      id: product.id,
      name: product.name,
      description: `Premium ${product.category} from our trending collection.`,
      price: product.price,
      image: product.image,
      category: product.category.toLowerCase().replace(' ', '-') as any,
      isCustomizable: true
    };
    
    addToCart(realProduct);
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-1 bg-primary-500" />
              <span className="text-xs font-black text-primary-500 uppercase tracking-[0.4em]">Curated Pieces</span>
            </div>
            <h2 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-8 uppercase leading-none">
              <span className="block">TRENDING</span>
              <span className="text-primary-500 italic">NOW.</span>
            </h2>
            <p className="text-xl font-medium text-gray-400 max-w-md">
              Elite designs hand-picked for their exceptional artistry and premium quality.
            </p>
          </div>
          <Link to="/shop" className="hidden lg:block">
            <Button variant="outline" className="h-16 px-10 !rounded-2xl gap-4 border-white/20 text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all font-black uppercase tracking-widest text-xs group">
              EXPLORE EVERYTHING <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product, idx) => (
<motion.div
               key={product.id || idx}
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1, duration: 0.7 }}
               className="group cursor-pointer"
               onClick={() => navigate(`/designer?product=${product.category?.toLowerCase()}`)}
             >
              <div className="relative aspect-[4/3] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#0c0c0c] to-[#050505] rounded-[2.5rem] border border-white/5 transition-all duration-700 group-hover:border-primary-500/40 group-hover:shadow-[0_30px_80px_rgba(var(--primary-rgb),0.25)]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain sm:object-cover lg:object-contain transition-transform duration-1000 group-hover:scale-105"
                />
                
                <div className="absolute top-6 left-6">
                  <span className="bg-primary-500 text-white text-[9px] font-black px-4 py-1 rounded-full tracking-widest shadow-2xl uppercase">
                    {product.tag}
                  </span>
                </div>

                <button 
                  onClick={(e) => toggleWishlist(product.id, e)}
                  className={`absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
                    wishlist.includes(product.id) 
                      ? 'bg-red-500 border-red-500 text-white scale-110' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 gap-4">
                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="flex-1 h-14 bg-white rounded-2xl flex items-center justify-center text-black font-black uppercase text-xs gap-2 hover:bg-primary-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/designer?product=${product.category.toLowerCase()}`);
                      }}
                      className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl"
                    >
                      <Palette className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-1 px-2">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">
                    {product.category}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-gray-500">{product.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase italic">
                  {product.name}
                </h3>
                <p className="text-2xl font-black text-gray-400 tracking-tighter italic">KES {(product.price ?? 0).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 lg:hidden flex justify-center">
          <Link to="/shop">
            <Button variant="outline" className="h-16 px-10 !rounded-2xl gap-4 border-white/20 text-white hover:border-primary-500 hover:bg-primary-500/10 transition-all font-black uppercase tracking-widest text-xs">
              EXPLORE EVERYTHING <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
