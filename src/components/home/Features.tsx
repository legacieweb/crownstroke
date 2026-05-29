import React from 'react';
import { Palette, ShieldCheck, Zap, Sparkles, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  const features = [
    {
      icon: Palette,
      title: 'Art Studio',
      description: 'Professional grade tools simplified for everyone. Create vector-sharp designs in seconds.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: ShieldCheck,
      title: 'Premium Build',
      description: 'We source only the finest sustainable fabrics and use state-of-the-art eco-safe printing.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      icon: Zap,
      title: 'Rapid Flow',
      description: 'Automated fulfillment pipeline that gets your masterpiece from screen to door in record time.',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Globe,
      title: 'Global Canvas',
      description: 'Ship your creativity anywhere. Our global logistics network covers every corner of the map.',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <section className="py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-6"
          >
            THE <span className="text-primary-400">LEGEND</span> STANDARD.
          </motion.h2>
          <p className="text-xl font-medium text-white/80 leading-relaxed">
            Every product we print is a testament to our commitment to excellence. We've optimized every step of the process to ensure your art looks legendary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-2xl hover:bg-white/10 transition-all group text-center"
            >
              <div className={`w-20 h-20 rounded-3xl ${feature.bg.replace('bg-', 'bg-opacity-20 bg-')} ${feature.color} flex items-center justify-center mb-10 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
