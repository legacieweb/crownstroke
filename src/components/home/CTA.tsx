import React from 'react';
import { Palette, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const CTA: React.FC = () => (
  <section className="py-24 md:py-32">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#111]/80 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_75%_15%,rgba(14,165,233,.45),transparent_45%)]" />
        <div className="relative grid lg:grid-cols-[1.1fr_.9fr] items-center gap-12 p-8 md:p-14 lg:p-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-300 mb-6">Make something yours</p>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-[-0.065em] leading-[0.9]">The idea is<br />already <span className="text-white/45">yours.</span></h2>
            <p className="text-white/65 text-lg leading-relaxed mt-6 max-w-md">Now give it a life beyond the screen. Start with a blank canvas or pick a piece made by our community.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/designer"><Button variant="premium" size="lg" className="h-14 px-7 !rounded-xl gap-3">Open the studio <Palette className="w-5 h-5" /></Button></Link>
              <Link to="/shop"><Button variant="outline" size="lg" className="h-14 px-7 !rounded-xl border-white/25 text-white hover:bg-white/10 gap-2">Explore the shop <ArrowUpRight className="w-4 h-4" /></Button></Link>
            </div>
          </div>
          <div className="relative max-w-md mx-auto w-full">
            <div className="absolute -inset-6 rounded-full bg-primary-500/15 blur-3xl" />
            <div className="relative aspect-[4/3] rounded-2xl border border-white/15 bg-white/5 p-4 rotate-2">
              <img src={SEED_DATA['t-shirt']['#ffffff'].front} alt="A custom printed T-shirt" loading="lazy" decoding="async" className="w-full h-full object-contain rounded-xl" />
              <span className="absolute left-7 bottom-7 rounded-full bg-black/70 border border-white/15 backdrop-blur px-4 py-2 text-xs font-medium text-white">Made by you · made to last</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTA;
