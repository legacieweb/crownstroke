import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { db } from '../../db';
import { designerDesigns } from '../../db/schema';
import { eq, or } from 'drizzle-orm';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const Offers: React.FC = () => {
  const [exclusiveDesigns, setExclusiveDesigns] = useState<any[]>([]);
  const [springDesign, setSpringDesign] = useState<any>(null);
  const [minimalistDesign, setMinimalistDesign] = useState<any>(null);
  const [flashSaleDesign, setFlashSaleDesign] = useState<any>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const designs = await db.select().from(designerDesigns);
        
        setExclusiveDesigns(designs.filter(d => d.isExclusive === 'true'));
        setSpringDesign(designs.find(d => d.isSpringCollection === 'true'));
        setMinimalistDesign(designs.find(d => d.isMinimalist === 'true'));
        setFlashSaleDesign(designs.find(d => d.isFlashSale === 'true'));
      } catch (err) {
        console.error('Failed to fetch offer designs:', err);
      }
    };
    fetchOffers();
  }, []);

  const deals = [
    {
      title: "Spring Collection",
      discount: "30% OFF",
      image: springDesign?.preview || SEED_DATA['t-shirt']['#ffffff'].front,
      color: "bg-blue-500",
      link: "/shop"
    },
    {
      title: "Minimalist Series",
      discount: "BUY 2 GET 1",
      image: minimalistDesign?.preview || SEED_DATA['hoodie']['#000000'].front,
      color: "bg-indigo-500",
      link: "/shop"
    }
  ];

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-black uppercase tracking-widest mb-4">
              <Tag className="w-3 h-3" /> Limited Time
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-6">EXCLUSIVE OFFERS</h2>
            <p className="text-lg font-medium text-gray-300">Premium designs at legendary prices. Grab your favorites before they disappear into the vault.</p>
          </div>
          <Link to="/shop">
            <Button variant="outline" className="gap-2 font-black border-white/30 text-white hover:bg-white/10">
              VIEW ALL OFFERS <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Dynamic Exclusive Designs Row */}
        {exclusiveDesigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {exclusiveDesigns.slice(0, 4).map((design, idx) => (
              <motion.div
                key={design.id}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden group"
              >
                <div className="aspect-[4/5] relative">
                  <img src={design.preview} alt={design.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">{design.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-black tracking-tighter">KES {design.price.toLocaleString()}</span>
                      <Link to={`/shop`}>
                        <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {deals.map((deal, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="relative h-[400px] rounded-[3rem] overflow-hidden group shadow-2xl shadow-slate-200/50"
            >
              <img src={deal.image} alt={deal.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
              
              <div className="relative h-full flex flex-col justify-center p-12 text-white">
                <div className={`${deal.color} self-start px-4 py-1 rounded-full text-xs font-black tracking-widest mb-4 shadow-lg`}>
                  {deal.discount}
                </div>
                <h3 className="text-4xl font-black tracking-tighter mb-2">{deal.title}</h3>
                <p className="text-slate-200 font-medium mb-8">Ready-designed & ships within 24h.</p>
                <Link to="/shop">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 !rounded-2xl px-8 font-black group">
                    CLAIM OFFER <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Banner Offer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-12 bg-primary-600 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20">
              <Zap className="w-10 h-10 text-white fill-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter mb-2">FLASH SALE: 50% OFF ALL POSTERS</h3>
              <p className="text-primary-100 font-medium">Use code <span className="bg-white/20 px-2 py-0.5 rounded text-white font-black">LEGEND50</span> at checkout.</p>
            </div>
          </div>
          <Link to="/shop?category=poster">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-slate-50 !rounded-2xl px-10 font-black shadow-2xl">
              SHOP POSTERS
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Offers;
