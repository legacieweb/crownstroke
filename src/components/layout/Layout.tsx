import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PaintBackground from './PaintBackground';
import { apiUrl } from '../../services/apiUrl';

interface LayoutProps {
  children: React.ReactNode;
}

// Add a simple context or just pass it down if needed, but for now we'll use a standard approach
export const BackendStatusContext = React.createContext<{ isOnline: boolean }>({ isOnline: true });

type SiteBackgroundType = 'image' | 'video';
let siteBackgroundCache: { media: string | null; type: SiteBackgroundType | null; fetchedAt: number } | null = null;
let siteBackgroundRequest: Promise<{ media: string | null; type: SiteBackgroundType | null }> | null = null;
const SITE_BACKGROUND_CACHE_MS = 60_000;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [background, setBackground] = useState(() => ({
    media: siteBackgroundCache?.media ?? null,
    type: siteBackgroundCache?.type ?? null,
  }));
  const location = useLocation();
  const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/');
  const isArtistShopRoute = location.pathname.startsWith('/shop/') && location.pathname !== '/shop';
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

  useEffect(() => {
    let active = true;
    const loadBackground = async () => {
      if (siteBackgroundCache && Date.now() - siteBackgroundCache.fetchedAt < SITE_BACKGROUND_CACHE_MS) {
        setBackground({ media: siteBackgroundCache.media, type: siteBackgroundCache.type });
        return;
      }
      if (!siteBackgroundRequest) {
        siteBackgroundRequest = (async () => {
          try {
            const response = await fetch(apiUrl('/api/site-background'));
            if (!response.ok) return { media: null, type: null };
            const result = await response.json();
            const media = typeof result.media === 'string' ? result.media : null;
            const type = result.type === 'image' || result.type === 'video' ? result.type : null;
            return { media, type };
          } catch { return { media: null, type: null }; }
        })();
      }
      try {
        const loaded = await siteBackgroundRequest;
        siteBackgroundCache = { ...loaded, fetchedAt: Date.now() };
        if (active) setBackground(loaded);
      } finally {
        siteBackgroundRequest = null;
      }
    };
    const handleBackgroundUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ media?: unknown; type?: unknown }>).detail;
      const media = typeof detail?.media === 'string' ? detail.media : null;
      const type = detail?.type === 'image' || detail?.type === 'video' ? detail.type : null;
      siteBackgroundCache = { media, type, fetchedAt: Date.now() };
      setBackground({ media, type });
    };
    loadBackground();
    window.addEventListener('site-background-updated', handleBackgroundUpdate);
    return () => {
      active = false;
      window.removeEventListener('site-background-updated', handleBackgroundUpdate);
    };
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
       
        {/* Use the shared database background when available; retain paint washes as the fallback. */}
        <PaintBackground
          className="fixed inset-0 z-0 overflow-hidden bg-[#111318]"
          overlayClassName={`site-bg-overlay ${location.pathname === '/' ? 'site-bg-overlay-home' : ''}`}
          media={background.media}
          mediaType={background.type}
        />

{(!isDesignerRoute || isDesignerDashboardRoute) && <Navbar />}
        <main className="site-main flex-grow relative z-10 w-full">
          {children}
        </main>
        {(!isShopRoute || isArtistShopRoute) && !isDesignerRoute && (
          <div className="relative z-10 border-t border-white/10">
            <Footer showNewsletterSignup={!isArtistShopRoute} />
          </div>
        )}
      </div>
    </BackendStatusContext.Provider>
  );
};

export default Layout;
