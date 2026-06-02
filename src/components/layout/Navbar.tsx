import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Palette, Search, Menu, X, User, Home, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { user, isAdmin, isDesigner } = useAuth();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop Merch', path: '/shop', icon: ShoppingBag },
    { name: 'Design Your Own', path: '/designer', icon: Palette, highlight: true },
    { name: 'Pricing', path: '/pricing', icon: Zap },
  ];

  const getDashboardPath = () => {
    if (isAdmin) return "/admin";
    if (isDesigner) return "/designer-dashboard";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin";
    if (isDesigner) return "Designer Panel";
    return "Dashboard";
  };

  const menuBgVideo = "https://i.imgur.com/d2d8Llz.mp4";

  // Dispatch custom event for hero visibility
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { isOpen } }));
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-[100] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-500/5 blur-3xl rounded-full -translate-y-1/2" />
        </div>
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-14 flex items-center">
              <img 
                src="https://i.imgur.com/1PBylbz.png" 
                alt="Crownstroke Logo" 
                className="h-full w-auto object-contain brightness-0 invert" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none tracking-tighter">
                CROWN <span className="text-primary-600">STROKE</span>
              </span>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                Elite POD Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "relative px-4 py-2 text-sm font-black uppercase tracking-widest transition-all",
                  location.pathname === link.path 
                    ? "text-primary-500 bg-white/10 rounded-xl" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                {location.pathname === link.path ? "REDESIGN" : link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 border-2 border-primary-500 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-gray-200 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart">
              <button className="p-2 text-gray-200 hover:text-white transition-colors relative group">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
            {user ? (
              <Link to={getDashboardPath()}>
                <Button size="sm" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                  <User className="w-4 h-4" />
                  {getDashboardLabel()}
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart">
              <button className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-all relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full font-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-200 hover:text-white rounded-xl hover:bg-white/10 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Full-screen video overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Video Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[90]"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={menuBgVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95" />
              <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
            </motion.div>
            
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-0 z-[100] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">Navigation</span>
                  <div className="w-8 h-1 bg-primary-500 rounded-full mt-2" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-3 text-gray-400 hover:text-white rounded-2xl hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-8 space-y-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-5 rounded-3xl text-lg font-black uppercase tracking-widest transition-all bg-white/5 hover:bg-white/10 group border border-white/5"
                    >
                      <link.icon className={clsx(
                        "w-5 h-5 transition-all",
                        location.pathname === link.path ? "text-primary-400" : "text-gray-400 group-hover:text-white"
                      )} />
                      <span className={clsx(
                        "flex-1 transition-all",
                        location.pathname === link.path ? "text-primary-400" : "text-gray-200 group-hover:text-white"
                      )}>
                        {link.name}
                      </span>
                      {link.highlight && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                      )}
                      {location.pathname === link.path && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-xl">
                {user ? (
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-3xl font-black uppercase tracking-widest gap-3 bg-white/10 hover:bg-white/15 border border-white/10">
                      <User className="w-5 h-5" />
                      {getDashboardLabel()}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-3xl font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/25">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;