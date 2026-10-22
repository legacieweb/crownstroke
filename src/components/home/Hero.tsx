import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Sparkles, Star } from 'lucide-react';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../db';
import { designerDesigns } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [editorsPick, setEditorsPick] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    db.select().from(designerDesigns).where(eq(designerDesigns.isEditorsPick, 'true' as any)).limit(1)
      .then(results => { if (results.length) setEditorsPick(results[0]); })
      .catch(error => console.warn('Could not load editor pick:', error));
    const handleMenuToggle = (e: Event) => setIsMenuOpen((e as CustomEvent).detail?.isOpen || false);
    window.addEventListener('mobileMenuToggle', handleMenuToggle);
    return () => window.removeEventListener('mobileMenuToggle', handleMenuToggle);
  }, []);

  return (
    <section className={`relative min-h-[calc(100svh-7rem)] flex items-center py-16 md:py-24 overflow-hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none' : ''}`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_72%_48%,rgba(14,165,233,.12),transparent_42%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-20 items-center">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2.5 border border-white/20 bg-white/[0.06] backdrop-blur px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary-300" /><span className="text-[10px] md:text-xs font-semibold text-white/85 uppercase tracking-[0.18em]">Independent art. Made wearable.</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-black text-white leading-[.88] tracking-[-.075em]">Wear what<br />you <span className="text-primary-300">mean.</span></h1>
              <p className="text-lg md:text-xl text-white/65 max-w-lg leading-relaxed mt-7">Turn your ideas into pieces worth keeping. Design your own, discover new artists, and make everyday things feel personal.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }} className="flex flex-wrap gap-3 mt-9">
              <Link to="/designer"><Button variant="premium" size="lg" className="h-14 px-7 !rounded-xl gap-3">Create your design <Palette className="w-5 h-5" /></Button></Link>
              <Link to="/shop"><Button variant="outline" size="lg" className="h-14 px-7 !rounded-xl border-white/25 text-white hover:bg-white/10 gap-2">Shop the collection <ArrowRight className="w-4 h-4" /></Button></Link>
            </motion.div>
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-2">{[11,12,13,14].map(n => <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="Crownstroke community member" loading="lazy" decoding="async" className="w-9 h-9 rounded-full border-2 border-black object-cover" />)}</div>
              <div><p className="text-sm font-semibold text-white">Made by a creative community</p><div className="flex items-center gap-1 mt-1">{[1,2,3,4,5].map(n => <Star key={n} className="w-3 h-3 text-amber-300 fill-amber-300" />)}<span className="text-[10px] ml-1 text-white/50">Loved by creators</span></div></div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative max-w-lg w-full mx-auto cursor-pointer" onClick={() => navigate(editorsPick ? `/shop?design=${editorsPick.id}` : '/designer?product=t-shirt')}>
            <div className="absolute -inset-10 bg-primary-500/10 blur-[90px] rounded-full" />
            <div className="relative rounded-[1.75rem] border border-white/15 bg-white/[0.07] backdrop-blur-md p-3 shadow-2xl">
              <div className="relative aspect-[4/5] rounded-[1.25rem] overflow-hidden bg-[#efeee9]">
                <img src={editorsPick?.preview || SEED_DATA['t-shirt']['#ffffff'].front} alt={editorsPick?.name || 'Featured Crownstroke design'} loading="eager" decoding="async" className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
                <span className="absolute top-5 left-5 rounded-full bg-black/75 text-white text-[10px] font-semibold uppercase tracking-[.16em] px-4 py-2 backdrop-blur">Artist spotlight</span>
              </div>
              <div className="flex items-end justify-between p-5 md:p-6">
                <div><p className="text-[10px] uppercase tracking-[.22em] text-primary-200 mb-2">This week’s pick</p><h2 className="text-xl font-semibold text-white">{editorsPick?.name || 'The everyday original'}</h2></div>
                <p className="text-sm font-semibold text-white/75">KES {(editorsPick?.price ?? 1500).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

