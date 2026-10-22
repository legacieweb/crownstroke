import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  isLoading: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#070b12]"
      role="status"
      aria-label="Loading Crownstroke"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,.16),transparent_48%)]" />
      <div className="relative flex flex-col items-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-14px] h-[116px] w-[116px] rounded-full border border-primary-300/15 border-t-primary-300/90 border-r-transparent shadow-[0_0_32px_rgba(14,165,233,.16)]"
        />
        <motion.div
          animate={{ scale: [1, 1.055, 1], opacity: [.56, .9, .56] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-5px] h-[98px] w-[98px] rounded-full border border-white/10"
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
          className="relative grid h-[88px] w-[88px] place-items-center rounded-full border border-white/10 bg-slate-950/80 shadow-[0_16px_48px_rgba(0,0,0,.4)]"
        >
          <img
            src="https://i.imgur.com/1PBylbz.png"
            alt="Crownstroke logo"
            className="h-14 w-14 object-contain brightness-0 invert drop-shadow-[0_0_14px_rgba(56,189,248,.55)]"
          />
        </motion.div>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mt-8 flex flex-col items-center"
        >
          <h2 className="text-xl font-black uppercase tracking-[.2em] text-white drop-shadow-lg">
            Crown<span className="text-primary-400">stroke</span>
          </h2>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[.3em] text-white/45">Made to be yours</p>
          <div className="mt-6 h-1 w-28 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary-500 via-cyan-300 to-primary-500"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Preloader;
