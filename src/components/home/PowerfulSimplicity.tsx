import React from 'react';
import { motion } from 'framer-motion';
import { Type, Layers, Box, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const PowerfulSimplicity: React.FC = () => {
  const features = [
    {
      icon: Type,
      title: "Curated Typography",
      description: "Access 500+ premium font families.",
      color: "text-blue-500"
    },
    {
      icon: Layers,
      title: "Intelligent Layers",
      description: "Drag, drop, and lock with ease.",
      color: "text-purple-500"
    },
    {
      icon: Box,
      title: "3D Instant Preview",
      description: "See your art in a 360° environment.",
      color: "text-primary-500"
    }
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase mb-8"
            >
              POWERFUL<br />
              <span className="text-primary-500">SIMPLICITY.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 font-medium max-w-lg mb-12 leading-relaxed"
            >
              Our award-winning design studio is now faster and more intuitive than ever. Pro tools for everyone.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-black uppercase italic tracking-tighter text-sm">{feature.title}</h4>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-16"
            >
              <Link to="/designer">
                <Button variant="premium" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-2xl shadow-primary-500/20">
                  TRY THE DESIGNER <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-4 shadow-2xl relative z-20"
             >
                <div className="aspect-[4/5] rounded-[3.5rem] bg-[#0a0a0a] overflow-hidden relative group">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-4xl font-black text-white/5 uppercase italic tracking-[0.2em] group-hover:text-primary-500/10 transition-colors">PRO TOOLS</h3>
                   </div>
                   {/* Interactive Design UI elements mock */}
                   <div className="absolute top-10 left-10 right-10 flex justify-between">
                      <div className="w-32 h-12 bg-white/5 rounded-xl border border-white/10" />
                      <div className="w-12 h-12 bg-primary-500 rounded-xl" />
                   </div>
                   <div className="absolute bottom-10 left-10 w-48 h-12 bg-white/5 rounded-xl border border-white/10" />
                   
                   {/* Centered scaled element */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-2 border-primary-500/30 border-dashed rounded-full flex items-center justify-center animate-spin-slow">
                         <div className="w-48 h-48 bg-primary-500/10 backdrop-blur-xl rounded-2xl border border-primary-500/20 flex items-center justify-center">
                            <Box className="w-20 h-20 text-primary-500" />
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
             
             {/* Decorative Scaling elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-500/10 blur-3xl rounded-full" />
          </div>
        </div>

        {/* JOIN THE ELITE / READY TO BECOME A LEGEND section */}
        <div className="mt-40 pt-40 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">JOIN THE ELITE</h3>
            <p className="text-3xl md:text-4xl font-black text-primary-500 italic uppercase tracking-tighter mb-8">READY TO BECOME<br />A LEGEND?</p>
            <p className="text-gray-400 font-medium text-lg max-w-md leading-relaxed">
              Start your artistic legacy today. Join thousands of creators who chose Crownstroke for their elite merchandise.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/signup?role=designer" className="flex-1">
              <Button className="w-full h-24 rounded-3xl bg-white text-black hover:bg-gray-100 font-black uppercase italic text-xl tracking-tighter">
                CREATE NOW
              </Button>
            </Link>
            <Link to="/shop" className="flex-1">
              <Button variant="outline" className="w-full h-24 rounded-3xl border-white/10 text-white hover:bg-white/5 font-black uppercase italic text-xl tracking-tighter">
                EXPLORE SHOP
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PowerfulSimplicity;
