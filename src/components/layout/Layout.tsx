import React, { useState, useEffect, createContext } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import VideoBackground from './VideoBackground';
import { DEFAULT_BG_VIDEO_URL } from './VideoBackground';

export const BgVideoContext = createContext<{ bgVideoUrl: string | null }>({ bgVideoUrl: DEFAULT_BG_VIDEO_URL });

interface LayoutProps {
  children: React.ReactNode;
}

// Add a simple context or just pass it down if needed, but for now we'll use a standard approach
export const BackendStatusContext = React.createContext<{ isOnline: boolean }>({ isOnline: true });

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const location = useLocation();
  const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/');
  const isDesignerRoute = location.pathname === '/designer' || location.pathname.startsWith('/designer');
  const isDesignerDashboardRoute = location.pathname === '/designer-dashboard';
  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';
  const newsMessage = isBackendOnline
    ? '⚡ Shop open. Enjoy shopping and designing. ⚡'
    : '⚠️ Shop closed! You can design and save to draft until we are open. ⚠️';

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
        {!isDesignerRoute && (
        <div className={`relative w-full py-2 z-[60] border-b border-white/10 backdrop-blur-md transition-colors duration-500 overflow-hidden ${
          isBackendOnline ? 'bg-slate-950/50' : 'bg-red-950/70'
        }`}>
          <div className={`news-marquee-window ${isShopRoute ? 'justify-center' : ''}`} role="status" aria-label={newsMessage}>
            {isShopRoute ? (
              <span className="news-marquee-message">{newsMessage}</span>
            ) : (
              <div className="news-marquee-track" aria-hidden="true">
                <span className="news-marquee-message">{newsMessage}</span>
                <span className="news-marquee-message">{newsMessage}</span>
              </div>
            )}
          </div>
        </div>
        )}
       
        {/* The shared local video loads after the route is ready, then plays behind each page. */}
        <VideoBackground
          videoUrl={DEFAULT_BG_VIDEO_URL}
          className="fixed inset-0 z-0 overflow-hidden bg-[#111318]"
          overlayClassName={`site-bg-overlay ${location.pathname === '/' ? 'site-bg-overlay-home' : ''}`}
          videoClassName="h-full w-full object-cover opacity-90"
        />

{(!isDesignerRoute || isDesignerDashboardRoute) && <Navbar />}
        <main className="site-main flex-grow relative z-10 w-full">
          {children}
        </main>
        {!isShopRoute && !isDesignerRoute && (
          <div className="relative z-10 border-t border-white/10">
            <Footer />
          </div>
        )}
      </div>
    </BackendStatusContext.Provider>
  );
};

export default Layout;
