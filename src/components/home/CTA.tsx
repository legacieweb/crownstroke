import React from 'react';
import { Palette, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const CTA: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] bg-white/5 backdrop-blur-xl p-12 lg:p-24 overflow-hidden border border-white/10 shadow-3xl"
        >
          {/* Subtle Decorative elements - keeping it clean even in dark block */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mx-auto lg:mx-0">
                <Sparkles className="w-3 h-3" />
                JOIN THE ELITE
              </div>
              
              <h2 className="text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                READY TO BECOME <br />
                A <span className="text-primary-500 italic underline decoration-primary-500/30 underline-offset-8">LEGEND?</span>
              </h2>
              
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                Start your artistic legacy today. Join thousands of creators who chose Crownstroke for their elite merchandise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start pt-4">
                <Link to="/designer">
                  <Button variant="premium" size="lg" className="h-20 px-12 !rounded-[2rem] text-lg">
                    CREATE NOW <Palette className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" size="lg" className="h-20 px-10 !rounded-[2rem] border-white/10 text-white hover:bg-white/5 hover:border-white transition-all text-lg font-black uppercase tracking-widest">
                    EXPLORE SHOP
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-square glass-card !bg-white/5 p-8 rounded-[3rem] border border-white/10 rotate-3 scale-110">
                <img src={SEED_DATA['t-shirt']['#ffffff'].front} alt="Final CTA" className="w-full h-full object-cover rounded-[2rem] shadow-2xl -rotate-3" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
