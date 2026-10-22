import React from 'react';
import { Palette, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Palette, number: '01', title: 'Your art, your rules', description: 'A welcoming studio with the tools to bring the idea in your head into the real world.' },
  { icon: ShieldCheck, number: '02', title: 'Made to be kept', description: 'Thoughtful materials and crisp, lasting prints. The details matter, and we sweat them.' },
  { icon: Zap, number: '03', title: 'From sketch to doorstep', description: 'We make the journey simple, with clear updates as your custom piece comes to life.' },
  { icon: Globe, number: '04', title: 'Art travels', description: 'Create from wherever you are and send something personal to wherever they are.' },
];

const Features: React.FC = () => (
  <section className="py-24 md:py-32 border-y border-white/10 bg-black/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14 lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-300 mb-5">A better way to make merch</p>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-[-0.06em] leading-[0.95]">Good ideas<br />deserve <span className="text-white/45">good things.</span></h2>
          <p className="mt-6 text-white/60 text-lg leading-relaxed max-w-md">From your first sketch to the piece you wear every week, we bring craft and care to every part of the process.</p>
        </div>
        <div className="divide-y divide-white/15">
          {features.map(({ icon: Icon, number, title, description }, i) => (
            <motion.div key={number} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="py-7 md:py-9 grid grid-cols-[48px_1fr] md:grid-cols-[64px_1fr_48px] gap-4 md:gap-6 items-start group">
              <span className="text-xs tracking-widest text-white/35 pt-1">{number}</span>
              <div><h3 className="text-xl md:text-2xl font-semibold text-white mb-2 group-hover:text-primary-200 transition-colors">{title}</h3><p className="text-white/55 leading-relaxed max-w-lg">{description}</p></div>
              <Icon className="hidden md:block w-6 h-6 text-white/40 group-hover:text-primary-300 transition-colors" strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Features;
