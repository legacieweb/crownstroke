import React from 'react';
import { motion } from 'framer-motion';
import { Palette, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const ArtCollections: React.FC = () => {
  const collections = [
    {
      title: "Abstract Dreams",
      count: "24 Items",
      image: SEED_DATA['poster']['#ffffff'].front,
      size: "lg"
    },
    {
      title: "Urban Cyberpunk",
      count: "18 Items",
      image: SEED_DATA['t-shirt']['#000000'].front,
      size: "sm"
    },
    {
      title: "Minimalist Nature",
      count: "32 Items",
      image: SEED_DATA['hoodie']['#ffffff'].front,
      size: "sm"
    },
    {
      title: "Retro Revival",
      count: "15 Items",
      image: SEED_DATA['mug']['#ffffff'].front,
      size: "md"
    }
  ];

  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-5xl font-black text-white tracking-tighter mb-6 uppercase">ART COLLECTIONS</h2>
          <p className="text-lg font-medium text-gray-300">Curated styles from global top-tier artists. Find the aesthetic that speaks to your legacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full">
          {collections.map((col, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={clsx(
                "relative group rounded-[3rem] overflow-hidden bg-white/10 shadow-xl shadow-black/20 border border-white/20",
                idx === 0 ? "md:col-span-2 md:row-span-2 min-h-[600px]" : "h-[284px]"
              )}
            >
              <img src={col.image} alt={col.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-x-0 bottom-0 p-10 flex items-end justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">{col.count}</p>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic">{col.title}</h3>
                </div>
                <Link to="/shop" className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white border border-white/30 shadow-2xl transition-transform hover:rotate-12 hover:scale-110">
                  <ArrowUpRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtCollections;
