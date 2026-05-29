import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, token, password);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-black text-white mb-4 uppercase italic">Invalid Link</h1>
          <p className="text-gray-400 mb-8">This password reset link is invalid or incomplete.</p>
          <Link to="/login">
            <Button variant="premium" className="w-full">Back to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1614850523296-e8c041de83a4?q=80&w=2070&auto=format&fit=crop" 
          alt="Reset background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-end p-20">
          <h2 className="text-6xl font-black text-white italic uppercase mb-4 leading-none">
            Secure Your<br />
            <span className="text-primary-500">Account.</span>
          </h2>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0a0a0a] relative">
        <div className="max-w-md w-full">
          {isSuccess ? (
            <div className="text-center animate-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-black text-white mb-4 uppercase italic">Password Reset!</h1>
              <p className="text-gray-400 font-medium mb-8">
                Your password has been successfully updated. Redirecting you to login...
              </p>
              <Link to="/login">
                <Button variant="premium" className="w-full py-4 rounded-2xl font-black uppercase tracking-widest">
                  Login Now
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-4xl font-black text-white mb-2 uppercase italic">New Password</h1>
                <p className="text-gray-400 font-medium uppercase text-[10px] tracking-[0.3em]">
                  Create a secure password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">New Password</label>
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 font-bold text-white placeholder-gray-600 outline-none transition-all"
                      placeholder="••••••••"
                    />
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
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link to="/login" className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
