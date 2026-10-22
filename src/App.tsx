import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';
import Preloader from './components/ui/Preloader';

const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    const isShopRoute = location.pathname === '/shop' || location.pathname.startsWith('/shop/') || location.pathname.startsWith('/product/');
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isShopRoute ? 'auto' : 'smooth'
    });
  }, [location.pathname]);

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
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customer-login" element={<Login />} />
              <Route path="/designer-login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/customer-signup" element={<Signup />} />
              <Route path="/designer-signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/designer-dashboard" element={<DesignerDashboard />} />
              <Route path="/shop/:shopName" element={<ShopPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/eco" element={<Sustainability />} />
              <Route path="/affiliates" element={<AffiliateProgram />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/api" element={<API />} />
            </Routes>
            </React.Suspense>
          </ScrollToTop>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
