import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Preloader from '../ui/Preloader';
import videoSrc from '../../assets/42154-431423229.mp4';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

// Add a simple context or just pass it down if needed, but for now we'll use a standard approach
export const BackendStatusContext = React.createContext<{ isOnline: boolean }>({ isOnline: true });

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';

    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        setIsBackendOnline(response.ok);
      } catch (err) {
        setIsBackendOnline(false);
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleVideoPlaying = () => {
    // Small delay to ensure smooth transition
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <BackendStatusContext.Provider value={{ isOnline: isBackendOnline }}>
      <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <Preloader isLoading={isLoading} />

      {/* News Headline */}
      <div className={`w-full py-2 z-[60] transition-colors duration-500 overflow-hidden ${
        isBackendOnline ? 'bg-primary-600' : 'bg-red-600'
      }`}>
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] px-8 italic">
              {isBackendOnline 
                ? "⚡ Shop open. Enjoy shopping and designing. ⚡" 
                : "⚠️ Shop closed ! Shopping closed ! You can design and save to draft and save it until we are open. ⚠️"}
            </span>
          ))}
        </div>
      </div>

      {/* Video Background */}
      <div className="fixed inset-0 z-[-1]">
        <video
          autoPlay
          loop
          muted
          playsInline
          onPlaying={handleVideoPlaying}
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
      </div>

      <Navbar />
      <main className="flex-grow relative z-10 w-full">
        {children}
      </main>
      <div className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10">
        <Footer />
      </div>
    </div>
    </BackendStatusContext.Provider>
  );
};

export default Layout;
