import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Palette, Menu, X, User, Home, Zap, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';
import { DEFAULT_BG_VIDEO_URL } from './VideoBackground';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const { user, isAdmin, isDesigner, logout } = useAuth();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop Merch', path: '/shop', icon: ShoppingBag },
    { name: 'Design Your Own', path: '/designer', icon: Palette, highlight: true },
    { name: 'Ways to Make', path: '/ways-to-make', icon: Palette },
    { name: 'Pricing', path: '/pricing', icon: Zap },
  ];

  const getDashboardPath = () => {
    if (isAdmin) return "/admin";
    if (isDesigner) return "/designer-dashboard";
    return "/dashboard";
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getDashboardLabel = () => {
    if (isAdmin) return "Admin";
    return "Dashboard";
  };

  // Dispatch custom event for hero visibility
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: { isOpen } }));
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/15 bg-slate-950/65 shadow-[0_8px_30px_rgba(0,0,0,.2)] backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary-500/5 blur-3xl rounded-full -translate-y-1/2" />
        </div>
        <div className="flex justify-between items-center min-h-20 py-3 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 flex items-center">
              <img 
                src="https://i.imgur.com/1PBylbz.png" 
                alt="Crownstroke Logo" 
                className="h-full w-auto object-contain brightness-0 invert drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-black leading-none tracking-tighter text-white drop-shadow-sm">
                CROWN <span className="text-primary-300">STROKE</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest mt-1 text-white/75 drop-shadow-sm">
                Made to be yours
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={clsx(
                  "relative px-3 py-2 text-[11px] font-bold uppercase tracking-[.14em] transition-all rounded-lg",
                  location.pathname === link.path
                    ? "text-white bg-white/15 shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg -z-10 border border-white/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/cart">
              <span className="relative group flex items-center justify-center p-2.5 rounded-xl text-white/85 transition-colors hover:text-white hover:bg-white/10">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary-600 text-white text-[10px] flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>
            {user ? <>
              <Link to={getDashboardPath()}><Button size="sm" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"><User className="w-4 h-4" />{getDashboardLabel()}</Button></Link>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-2 text-white/85 hover:text-white hover:bg-white/10"><LogOut className="w-4 h-4" />Log out</Button>
            </> : <>
              <Link to="/login"><Button size="sm" variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">Log in</Button></Link>
              <Link to="/customer-signup"><Button size="sm" className="gap-2 px-5 shadow-lg shadow-primary-900/30">Sign up <span aria-hidden="true">↗</span></Button></Link>
            </>}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <Link to="/cart">
              <button aria-label="Open cart" className="p-2 rounded-xl transition-all relative text-white/85 hover:text-white hover:bg-white/10">
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
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-xl transition-all text-white/90 hover:text-white hover:bg-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with its own full-screen video background */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-slate-950"
            >
              <video
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                src={DEFAULT_BG_VIDEO_URL}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                onCanPlay={(event) => { void event.currentTarget.play().catch(() => {}); }}
              />
              <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/75" />
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/20 bg-slate-950/70 backdrop-blur-md">
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
              <div className="relative z-10 flex-1 space-y-2 overflow-y-auto px-6 py-8">
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
                      className="flex items-center gap-4 rounded-2xl border border-white/25 bg-slate-950/85 p-5 text-lg font-black uppercase tracking-widest text-white shadow-lg shadow-black/20 transition-all hover:bg-slate-900/95 group"
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
              <div className="relative z-10 border-t border-white/20 bg-slate-950/85 p-6 backdrop-blur-md">
                {user ? <div className="grid grid-cols-2 gap-3">
                  <Link to={getDashboardPath()} onClick={() => setIsOpen(false)}><Button className="w-full h-12 rounded-xl border border-white/30 bg-slate-900 font-bold text-white shadow-md hover:bg-slate-800 gap-2"><User className="w-4 h-4" />Dashboard</Button></Link>
                  <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl border-2 border-white/50 bg-slate-950 font-bold text-white shadow-md hover:bg-slate-800 gap-2"><LogOut className="w-4 h-4" />Log out</Button>
                </div> : <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setIsOpen(false)}><Button variant="outline" className="w-full h-12 rounded-xl border-2 border-white/50 bg-slate-950 font-bold text-white shadow-md hover:bg-slate-800">Log in</Button></Link>
                  <Link to="/customer-signup" onClick={() => setIsOpen(false)}><Button className="w-full h-12 rounded-xl border border-white/30 bg-primary-600 font-bold text-white shadow-lg hover:bg-primary-500">Sign up</Button></Link>
                </div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
