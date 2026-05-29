import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Layers, Box, MousePointer2 } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

import { PRODUCT_DATA as SEED_DATA } from '../../data/seed';

const DesignerPreview: React.FC = () => {
  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.95]">
              POWERFUL <br />
              <span className="text-primary-400">SIMPLICITY.</span>
            </h2>
            <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-md">
              Our award-winning design studio is now faster and more intuitive than ever. Pro tools for everyone.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Type, title: "Curated Typography", desc: "Access 500+ premium font families." },
                { icon: Layers, title: "Intelligent Layers", desc: "Drag, drop, and lock with ease." },
                { icon: Box, title: "3D Instant Preview", desc: "See your art in a 360° environment." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-gray-300 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/designer">
              <Button variant="premium" size="lg" className="h-16 px-10 !rounded-2xl gap-3">
                TRY THE DESIGNER <Palette className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[4rem] border border-white/10 relative">
              <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden aspect-square flex items-center justify-center p-10 border border-white">
                <img src={SEED_DATA['t-shirt']['#ffffff'].front} alt="Tool Mockup" className="w-full h-full object-contain" />
                
                {/* Visual UI Bits */}
                <motion.div 
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-20 right-0 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white"><Type className="w-4 h-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Heading 1</span>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-20 left-0 glass-card p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-white"
                >
                  <MousePointer2 className="w-6 h-6 text-indigo-600 fill-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Drag to scale</span>
                </motion.div>
              </div>
            </div>
            
            {/* Soft Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary-100 rounded-full blur-[120px] -z-10 opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignerPreview;
