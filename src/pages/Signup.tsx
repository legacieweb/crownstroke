import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { Mail, Lock, User, Plus, Eye, EyeOff, LayoutGrid, Palette, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import videoSrc from '../assets/42154-431423229.mp4';

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'user' | 'designer'>('user');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(email, password, name, role, role === 'designer' ? shopName : undefined);
      
      navigate(role === 'designer' ? '/designer-dashboard' : '/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-[-1]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
      </div>

      {/* Left Side - Image/Creative */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop" 
          alt="Signup background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-end p-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-black text-white italic uppercase mb-4 leading-none">
              Create Your<br />
              <span className="text-primary-500">Legacy.</span>
            </h2>
            <p className="text-xl text-gray-300 font-medium max-w-md italic">
              Join the elite community of designers and creators on Crownstroke.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl lg:bg-transparent lg:backdrop-blur-none" />

        <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-colors z-20">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full py-20 relative z-10 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white mb-2 uppercase italic">Join Now</h1>
            <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[0.3em]">
              Select your path and start creating today
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={clsx(
                "p-6 rounded-3xl border transition-all text-left group relative overflow-hidden",
                role === 'user' ? "border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "border-white/5 bg-white/5 hover:border-white/10"
              )}
            >
              <User className={clsx("w-8 h-8 mb-3 transition-colors", role === 'user' ? "text-primary-500" : "text-gray-500")} />
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Customer</h4>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Buy & Customize</p>
            </button>

            <button
              type="button"
              onClick={() => setRole('designer')}
              className={clsx(
                "p-6 rounded-3xl border transition-all text-left group relative overflow-hidden",
                role === 'designer' ? "border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" : "border-white/5 bg-white/5 hover:border-white/10"
              )}
            >
              <Palette className={clsx("w-8 h-8 mb-3 transition-colors", role === 'designer' ? "text-primary-500" : "text-gray-500")} />
              <h4 className="text-sm font-black text-white uppercase tracking-tight">Designer</h4>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Sell your art</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-bold text-white placeholder-gray-600 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-bold text-white placeholder-gray-600 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {role === 'designer' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Shop Name</label>
                <div className="relative group">
                  <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-bold text-white placeholder-gray-600 outline-none transition-all"
                    placeholder="my-awesome-shop"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-bold text-white placeholder-gray-600 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <Button 
              variant="premium" 
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest gap-2" 
              type="submit"
              loading={isLoading}
            >
              {!isLoading && <Plus className="w-5 h-5" />}
              {role === 'designer' ? 'Open My Shop' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6">Already have an account?</p>
            <Link to="/login">
              <Button variant="outline" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest gap-2 border-white/10 text-white hover:bg-white/5">
                Sign In Instead
                <Plus className="w-5 h-5 rotate-45" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
