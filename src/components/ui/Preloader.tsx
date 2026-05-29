import React from 'react';
import { motion } from 'framer-motion';

interface PreloaderProps {
  isLoading: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (!isLoading) {
          document.body.style.overflow = 'auto';
        }
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{ pointerEvents: isLoading ? 'all' : 'none' }}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-t-2 border-b-2 border-primary-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-24 h-24 rounded-full border-l-2 border-r-2 border-white/20"
        />
        
        {/* Logo/Brand Reveal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-8 flex flex-col items-center"
        >
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            CROWN<span className="text-primary-500">STROKE</span>
          </h2>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scaleY: [1, 2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
                className="w-1 h-3 bg-primary-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Preloader;
