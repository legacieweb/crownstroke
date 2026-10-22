import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../../db';
import { designerDesigns } from '../../db/schema';
import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  useEffect(() => {
    db.select().from(designerDesigns).then((designs: any[]) => {
      const selected = designs.filter(d => [d.isExclusive, d.is_exclusive, d.isSpringCollection, d.is_spring_collection, d.isFlashSale, d.is_flash_sale].includes('true')).slice(0, 3);
      setOffers(selected);
    }).catch(() => setOffers([]));
  }, []);
  const tiles = [
    { eyebrow: 'A fresh point of view', title: 'Spring, in full colour', label: 'Explore the edit', image: offers[0]?.preview || SEED_DATA['t-shirt']['#ffffff'].front, href: '/shop' },
    { eyebrow: 'Good things, together', title: 'Make it a set', label: 'Find your pair', image: offers[1]?.preview || SEED_DATA['hoodie']['#000000'].front, href: '/shop' },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div><p className="text-xs font-bold uppercase tracking-[.3em] text-primary-300 mb-5"><Tag className="w-3.5 h-3.5 inline mr-2" />The good stuff</p><h2 className="text-5xl md:text-6xl font-black text-white tracking-[-.06em]">A little extra.</h2></div>
          <p className="text-white/60 max-w-sm leading-relaxed">Limited edits, artist picks, and small surprises worth catching while they’re here.</p>
        </div>
        {offers.length > 0 && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">{offers.map((offer, i) => <Link to="/shop" key={offer.id || i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10"><img src={offer.preview} alt={offer.name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" /><div className="absolute bottom-5 left-5 right-5 flex items-end justify-between"><div><span className="text-[10px] uppercase tracking-widest text-primary-200">Artist exclusive</span><h3 className="text-xl font-semibold text-white mt-1">{offer.name}</h3></div><span className="text-white font-semibold">KES {(offer.price ?? 0).toLocaleString()}</span></div></Link>)}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {tiles.map((tile, i) => <motion.div key={tile.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }} className="relative min-h-[360px] md:min-h-[440px] overflow-hidden rounded-2xl border border-white/10 group">
            <img src={tile.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
            <div className="relative z-10 p-7 md:p-10 min-h-[360px] md:min-h-[440px] flex flex-col items-start justify-end"><p className="text-xs uppercase tracking-[.24em] text-white/65 mb-3">{tile.eyebrow}</p><h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white max-w-xs">{tile.title}</h3><Link to={tile.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white border-b border-white/50 pb-1 group-hover:text-primary-200 group-hover:border-primary-200 transition-colors">{tile.label}<ArrowUpRight className="w-4 h-4" /></Link></div>
          </motion.div>)}
        </div>
      </div>
    </section>
  );
};

export default Offers;
