import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Sparkles, Star, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../db';
import { designerDesigns } from '../../db/schema';
import { eq } from 'drizzle-orm';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [editorsPick, setEditorsPick] = useState<any>(null);

  useEffect(() => {
    const fetchEditorsPick = async () => {
      try {
        const results = await db.select()
          .from(designerDesigns)
          .where(eq(designerDesigns.isEditorsPick, 'true'))
          .limit(1);
        
        if (results.length > 0) {
          setEditorsPick(results[0]);
        }
      } catch (error) {
        console.error('Failed to fetch editor\'s pick:', error);
      }
    };

    fetchEditorsPick();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-transparent">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-xs font-black text-white uppercase tracking-widest">New Art Collections Live</span>
              <ChevronRight className="w-3 h-3 text-white/60" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                Create Your <br />
                <span className="text-primary-400 italic">Masterpiece.</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-lg leading-relaxed font-medium">
                Crownstroke offers an elite canvas for your imagination. Minimal design, premium quality, and the world's most intuitive design tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/designer">
                <Button variant="premium" size="lg" className="h-16 px-10 !rounded-2xl gap-3 text-lg">
                  START DESIGNING
                  <Palette className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="h-16 px-10 !rounded-2xl border-slate-200 text-white hover:border-primary-400 hover:text-primary-400 transition-all font-black">
                  BROWSE COLLECTIONS
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8 pt-4"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-black/30 bg-slate-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-black text-white leading-none mb-1">Joined by 50,000+ artists</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                  <span className="text-[10px] font-bold text-white/60 ml-1">4.9/5 RATING</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative cursor-pointer group"
            onClick={() => {
              if (editorsPick) {
                navigate(`/shop?design=${editorsPick.id}`);
              } else {
                navigate('/designer?product=t-shirt');
              }
            }}
          >
            <div className="relative z-10 glass-card p-4 rounded-[3.5rem] shadow-3xl transition-all duration-500 group-hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.2)]">
              <div className="rounded-[2.5rem] overflow-hidden bg-slate-50 aspect-[4/5] relative">
                <img
                  src={editorsPick ? editorsPick.preview : SEED_DATA['t-shirt']['#ffffff'].front}
                  alt={editorsPick ? editorsPick.name : "Elegant Merch"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Clean Floating Tag */}
                <div className="absolute top-8 right-8 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl border border-white shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">In Stock</span>
                </div>
              </div>

              {/* Minimal Design Element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 glass-card p-6 rounded-3xl shadow-2xl border border-white max-w-[200px]"
              >
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Editor's Choice</p>
                <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                  {editorsPick ? editorsPick.name : "Minimalist Essential Tee"}
                </p>
                <p className="text-xl font-black text-slate-400 mt-2">
                  KES {editorsPick ? editorsPick.price.toLocaleString() : "1,500"}
                </p>
              </motion.div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-100/30 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
