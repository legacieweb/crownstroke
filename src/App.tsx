import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Designer from './pages/Designer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Cookies from './pages/Cookies';
import AboutUs from './pages/AboutUs';
import Sustainability from './pages/Sustainability';
import AffiliateProgram from './pages/AffiliateProgram';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import HelpCenter from './pages/HelpCenter';
import API from './pages/API';
import DesignerDashboard from './pages/DesignerDashboard';
import ShopPage from './pages/ShopPage';
import { CartProvider } from './store/CartContext';
import { AuthProvider } from './store/AuthContext';

const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/designer" element={<Designer />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
          </ScrollToTop>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
