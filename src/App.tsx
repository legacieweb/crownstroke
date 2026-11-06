import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom';
const Home = React.lazy(() => import('./pages/Home'));
const Shop = React.lazy(() => import('./pages/Shop'));
const Designer = React.lazy(() => import('./pages/Designer'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const Cookies = React.lazy(() => import('./pages/Cookies'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const Sustainability = React.lazy(() => import('./pages/Sustainability'));
const AffiliateProgram = React.lazy(() => import('./pages/AffiliateProgram'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Shipping = React.lazy(() => import('./pages/Shipping'));
const Returns = React.lazy(() => import('./pages/Returns'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));
const API = React.lazy(() => import('./pages/API'));
const DesignerDashboard = React.lazy(() => import('./pages/DesignerDashboard'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const WaysToMake = React.lazy(() => import('./pages/WaysToMake'));
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';
import Preloader from './components/ui/Preloader';
import { useSeo } from './hooks/useSeo';
import { CROWNSTROKE_BASE } from './pages/SeoDefaults';

type SeoRouteData = {
  title: string;
  description: string;
  path: string;
  robots?: string;
};

const SeoBoundary: React.FC<{ data: SeoRouteData; children: React.ReactNode }> = ({ data, children }) => {
  useSeo({
    title: data.title,
    description: data.description,
    canonicalUrl: `${CROWNSTROKE_BASE.url}/#${data.path}`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: data.robots || 'index,follow',
  });
  return <>{children}</>;
};

const ArtistShopRoute: React.FC = () => {
  const { shopName = '' } = useParams<{ shopName: string }>();
  const displayName = shopName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <SeoBoundary data={{
    title: `${displayName || 'Artist'} Shop | Crownstroke`,
    description: `Shop original designs and custom pieces from ${displayName || 'an independent creator'} on Crownstroke.`,
    path: `/shop/${encodeURIComponent(shopName)}`,
  }}><ShopPage /></SeoBoundary>;
};

const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/') || location.pathname.startsWith('/product/');
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isShopRoute ? 'auto' : 'smooth'
    });
    const dataLayer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
    dataLayer?.push({
      event: 'page_view',
      page_path: `${location.pathname}${location.search}${location.hash}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search, location.hash]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop>
            <React.Suspense fallback={<Preloader isLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
<Route path="/shop" element={<Shop />} />
               <Route path="/product/:productId" element={<ProductDetail />} />
               <Route path="/designer" element={<Designer />} />
              <Route path="/ways-to-make" element={<WaysToMake />} />
              <Route path="/cart" element={<SeoBoundary data={{ title: 'Your Cart | Crownstroke', description: 'Review the custom products and independent designs in your Crownstroke cart.', path: '/cart', robots: 'noindex,follow' }}><Cart /></SeoBoundary>} />
              <Route path="/checkout" element={<SeoBoundary data={{ title: 'Checkout | Crownstroke', description: 'Complete your Crownstroke order securely.', path: '/checkout', robots: 'noindex,follow' }}><Checkout /></SeoBoundary>} />
              <Route path="/login" element={<SeoBoundary data={{ title: 'Sign In | Crownstroke', description: 'Sign in to manage your Crownstroke account.', path: '/login', robots: 'noindex,follow' }}><Login /></SeoBoundary>} />
              <Route path="/customer-login" element={<SeoBoundary data={{ title: 'Customer Sign In | Crownstroke', description: 'Sign in to manage your Crownstroke account.', path: '/customer-login', robots: 'noindex,follow' }}><Login /></SeoBoundary>} />
              <Route path="/designer-login" element={<SeoBoundary data={{ title: 'Designer Sign In | Crownstroke', description: 'Sign in to manage your artist shop and designs.', path: '/designer-login', robots: 'noindex,follow' }}><Login /></SeoBoundary>} />
              <Route path="/signup" element={<SeoBoundary data={{ title: 'Create an Account | Crownstroke', description: 'Join Crownstroke to create custom products and shop independent designs.', path: '/signup', robots: 'noindex,follow' }}><Signup /></SeoBoundary>} />
              <Route path="/customer-signup" element={<SeoBoundary data={{ title: 'Create a Customer Account | Crownstroke', description: 'Create a Crownstroke customer account.', path: '/customer-signup', robots: 'noindex,follow' }}><Signup /></SeoBoundary>} />
              <Route path="/designer-signup" element={<SeoBoundary data={{ title: 'Open a Designer Shop | Crownstroke', description: 'Create a Crownstroke designer account and set up your artist shop.', path: '/designer-signup', robots: 'noindex,follow' }}><Signup /></SeoBoundary>} />
              <Route path="/reset-password" element={<SeoBoundary data={{ title: 'Reset Your Password | Crownstroke', description: 'Reset your Crownstroke account password.', path: '/reset-password', robots: 'noindex,follow' }}><ResetPassword /></SeoBoundary>} />
              <Route path="/dashboard" element={<SeoBoundary data={{ title: 'My Account | Crownstroke', description: 'Manage your Crownstroke account and orders.', path: '/dashboard', robots: 'noindex,follow' }}><UserDashboard /></SeoBoundary>} />
              <Route path="/designer-dashboard" element={<SeoBoundary data={{ title: 'Designer Studio | Crownstroke', description: 'Manage your Crownstroke designs and artist shop.', path: '/designer-dashboard', robots: 'noindex,follow' }}><DesignerDashboard /></SeoBoundary>} />
              <Route path="/shop/:shopName" element={<ArtistShopRoute />} />
              <Route path="/admin" element={<SeoBoundary data={{ title: 'Admin | Crownstroke', description: 'Crownstroke administration.', path: '/admin', robots: 'noindex,nofollow' }}><AdminDashboard /></SeoBoundary>} />
              <Route path="/privacy" element={<SeoBoundary data={{ title: 'Privacy Policy | Crownstroke', description: 'Learn how Crownstroke collects, uses, and protects your personal information.', path: '/privacy' }}><PrivacyPolicy /></SeoBoundary>} />
              <Route path="/terms" element={<SeoBoundary data={{ title: 'Terms of Service | Crownstroke', description: 'Read the terms that apply when using Crownstroke design and shopping services.', path: '/terms' }}><TermsOfService /></SeoBoundary>} />
              <Route path="/cookies" element={<SeoBoundary data={{ title: 'Cookie Policy | Crownstroke', description: 'Learn how Crownstroke uses cookies and similar technologies.', path: '/cookies' }}><Cookies /></SeoBoundary>} />
              <Route path="/about" element={<SeoBoundary data={{ title: 'About Crownstroke | Made for Your Ideas', description: 'Meet Crownstroke, a creative platform for designing custom pieces and discovering independent Kenyan designers.', path: '/about' }}><AboutUs /></SeoBoundary>} />
              <Route path="/eco" element={<SeoBoundary data={{ title: 'Sustainability | Crownstroke', description: 'Explore Crownstroke’s approach to thoughtful products, responsible production, and creative reuse.', path: '/eco' }}><Sustainability /></SeoBoundary>} />
              <Route path="/affiliates" element={<SeoBoundary data={{ title: 'Affiliate Program | Crownstroke', description: 'Discover the Crownstroke affiliate program and share custom design with your community.', path: '/affiliates' }}><AffiliateProgram /></SeoBoundary>} />
              <Route path="/careers" element={<SeoBoundary data={{ title: 'Careers | Crownstroke', description: 'Explore opportunities to work with Crownstroke and help independent creativity reach more people.', path: '/careers' }}><Careers /></SeoBoundary>} />
              <Route path="/contact" element={<SeoBoundary data={{ title: 'Contact Crownstroke', description: 'Get in touch with the Crownstroke team for help with an order, account, or design.', path: '/contact' }}><Contact /></SeoBoundary>} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/shipping" element={<SeoBoundary data={{ title: 'Shipping Information | Crownstroke', description: 'Find Crownstroke shipping options, delivery information, and order guidance.', path: '/shipping' }}><Shipping /></SeoBoundary>} />
              <Route path="/returns" element={<SeoBoundary data={{ title: 'Returns & Exchanges | Crownstroke', description: 'Review the Crownstroke returns and exchange policy and learn how to request support.', path: '/returns' }}><Returns /></SeoBoundary>} />
              <Route path="/help" element={<SeoBoundary data={{ title: 'Help Center | Crownstroke', description: 'Get answers about custom products, orders, payments, shipping, and artist shops on Crownstroke.', path: '/help' }}><HelpCenter /></SeoBoundary>} />
              <Route path="/api" element={<SeoBoundary data={{ title: 'Developer API | Crownstroke', description: 'Explore Crownstroke API information and integration guidance for developers.', path: '/api' }}><API /></SeoBoundary>} />
            </Routes>
            </React.Suspense>
          </ScrollToTop>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
