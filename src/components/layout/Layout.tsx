import React, { useState, useEffect, createContext } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { db } from '../../db';
import { siteSettings } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const BgVideoContext = createContext<{ bgVideoUrl: string | null }>({ bgVideoUrl: 'https://i.imgur.com/d2d8Llz.mp4' });

interface LayoutProps {
  children: React.ReactNode;
}

// Add a simple context or just pass it down if needed, but for now we'll use a standard approach
export const BackendStatusContext = React.createContext<{ isOnline: boolean }>({ isOnline: true });

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [bgVideoUrl, setBgVideoUrl] = useState<string | null>('https://i.imgur.com/d2d8Llz.mp4');
  const location = useLocation();
  const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/');

  useEffect(() => {
    const fetchBgVideo = async () => {
      try {
        const results = await db.select().from(siteSettings).where(eq(siteSettings.id, 'default'));
        if (results.length > 0 && results[0].bgVideoUrl) {
          setBgVideoUrl(results[0].bgVideoUrl);
        }
      } catch (err) {
        console.error('Failed to fetch bg video:', err);
      }
    };
    fetchBgVideo();
  }, []);

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
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BackendStatusContext.Provider value={{ isOnline: isBackendOnline }}>
      <div className={`flex flex-col min-h-screen relative overflow-x-hidden ${isShopRoute ? 'shop-static-ui' : ''}`}>
      
      {/* News Headline */}
      <div className={`w-full py-2 z-[60] transition-colors duration-500 overflow-hidden ${
        isBackendOnline ? 'bg-primary-600' : 'bg-red-600'
      }`}>
        <div className={`flex whitespace-nowrap ${isShopRoute ? 'justify-center' : 'animate-marquee'}`}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className={`text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] px-8 italic ${isShopRoute && i > 0 ? 'hidden' : ''}`}>
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
          className="w-full h-full object-cover"
        >
          <source src={bgVideoUrl || 'https://i.imgur.com/d2d8Llz.mp4'} type="video/mp4" />
        </video>
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
      </div>

      <Navbar />
      <main className="flex-grow relative z-10 w-full">
        {children}
      </main>
      {!isShopRoute && (
        <div className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-white/10">
          <Footer />
        </div>
      )}
    </div>
    </BackendStatusContext.Provider>
  );
};

export default Layout;
