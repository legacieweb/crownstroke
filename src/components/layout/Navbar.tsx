import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Palette, Search, Menu, X, User } from 'lucide-react';
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
    { name: 'Home', path: '/' },
    { name: 'Shop Merch', path: '/shop' },
    { name: 'Design Your Own', path: '/designer', highlight: true },
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

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart">
              <button className="p-2 text-slate-500 relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-200 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-20 inset-x-0 bg-black/90 backdrop-blur-md border-b border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "block px-3 py-4 text-base font-black uppercase tracking-widest transition-all",
                  location.pathname === link.path
                    ? 'text-primary-400 bg-white/10 rounded-xl border border-primary-500/50'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 rounded-xl'
                )}
              >
                {location.pathname === link.path ? "REDESIGN" : link.name}
              </Link>
            ))}
            <div className="pt-4 px-3">
              {user ? (
                <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}>
                  <Button className="w-full" variant="outline">{getDashboardLabel()}</Button>
                </Link>
              ) : (
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
