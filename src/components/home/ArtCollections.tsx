import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const collections = [
  { title: 'Abstract dreams', count: '24 pieces', image: SEED_DATA['poster']['#ffffff'].front, size: 'large', number: '01', note: 'Shape & colour' },
  { title: 'Urban after dark', count: '18 pieces', image: SEED_DATA['t-shirt']['#000000'].front, number: '02', note: 'City energy' },
  { title: 'A quieter nature', count: '32 pieces', image: SEED_DATA['hoodie']['#ffffff'].front, number: '03', note: 'Soft & organic' },
  { title: 'Retro, remixed', count: '15 pieces', image: SEED_DATA['mug']['#ffffff'].front, number: '04', note: 'Old soul, new shape' },
];

const ArtCollections: React.FC = () => (
  <section className="py-24 md:py-32 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-300 mb-5">A collection of creative worlds</p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-[-0.06em] leading-[0.9]">Pick a mood.<br /><span className="text-white/45">Make it yours.</span></h2>
        </div>
        <p className="text-white/65 text-base md:text-lg max-w-sm leading-relaxed">Small worlds of art, gathered by mood. Explore a collection and find the one that feels like yours.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[260px] md:auto-rows-[310px]">
        {collections.map((col, i) => (
          <motion.div key={col.number} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`relative overflow-hidden rounded-[1.5rem] group border border-white/10 ${i === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-[624px]' : ''}`}>
            <img src={col.image} alt={col.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />
            <div className="absolute top-5 left-5 rounded-full border border-white/25 bg-black/25 backdrop-blur-md text-white/90 text-[10px] uppercase font-semibold tracking-[.2em] px-3 py-2">{col.note}</div>
            <Link to="/shop" aria-label={`Explore ${col.title}`} className="absolute inset-0" />
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex items-end justify-between pointer-events-none">
              <div><p className="text-[10px] uppercase tracking-[0.25em] text-white/60 mb-2">Collection {col.number} · {col.count}</p><h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{col.title}</h3></div>
              <span className="w-12 h-12 rounded-full border border-white/50 bg-white text-black flex items-center justify-center group-hover:bg-primary-300 group-hover:border-primary-300 transition-colors"><ArrowUpRight size={18} /></span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ArtCollections;
