import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import VideoBackground from '../components/layout/VideoBackground';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  LogIn, 
  UserPlus, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag, 
  Wallet, 
  Truck, 
  Palette 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../db';
import { orders } from '../db/schema';
import { emailService } from '../services/email';
import { clsx } from 'clsx';

const KENYA_CBD_AREAS = ['Nairobi CBD', 'Westlands', 'Kilimani', 'Karen', 'Muthaiga', 'Hurlingham', 'Parklands', 'Lavington', 'Gigiri', 'Runda', 'Kileleshwa', 'Loresho', 'Nyari', 'Spring Valley'];
const KENYA_COUNTIES = ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Nyeri', 'Machakos', 'Kakamega', 'Kisii', 'Embu', 'Garissa', 'Nanyuki', 'Lamu', 'Wajir', 'Turkana'];

const NAIROBI_AREAS = ['Mathare', 'Kasarani', 'Embakasi', 'Lang\'ata', 'Dagoretti', 'Starehe', 'Kamukunji', 'Nairobi West', 'South C', 'South B', 'Umoja', 'Kayole', 'Dandora', 'Kariobangi', 'Githurai', 'Ruiru', 'Juja', 'Kikuyu', 'Athi River', 'Ongata Rongai', 'Kibera', 'Makadara'];

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [drafts, setDrafts] = useState<any[]>([]);
  const [step, setStep] = useState<'auth' | 'shipping' | 'payment' | 'success'>(user ? 'shipping' : 'auth');
  const [isGuest, setIsGuest] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    country: 'Kenya',
  });

  const getShippingFee = (city: string): number => {
    // Nairobi CBD areas - Free delivery
    if (KENYA_CBD_AREAS.includes(city)) return 0;
    // Nairobi non-CBD areas - KES 150
    if (NAIROBI_AREAS.includes(city)) return 150;
    // Nairobi county (general) - KES 150
    if (city === 'Nairobi') return 150;
    // Other Kenyan counties - KES 300
    if (KENYA_COUNTIES.includes(city)) return 300;
    // Other locations - KES 200
    return 200;
  };

  const shippingFee = formData.city ? getShippingFee(formData.city) : 0;
  const depositAmount = (total + shippingFee) * 0.6;
  const balanceAmount = (total + shippingFee) - depositAmount;
  const finalTotal = total + shippingFee;
  const payableNow = paymentType === 'full' ? finalTotal : depositAmount;

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('crownstroke_drafts') || '[]');
    setDrafts(savedDrafts);
  }, []);

  if (items.length === 0 && step !== 'success') {
    return (
      <Layout>
        <VideoBackground videoUrl="https://i.imgur.com/d2d8Llz.mp4" />
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative z-10">
          <ShoppingBag className="w-16 h-16 text-white/30 mb-6" />
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Your cart is empty</h2>
          <Link to="/shop"><Button variant="premium">Go to Shop</Button></Link>
        </div>
      </Layout>
    );
  }

  const handlePayment = async () => {
    // @ts-ignore
    if (!window.PaystackPop) {
      console.error('Paystack SDK not loaded');
      alert('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    console.log('Initializing Paystack payment...', {
      email: formData.email,
      amount: Math.round(payableNow * 100),
      currency: 'KES'
    });
    
    const handleSuccess = async (response: any) => {
      try {
        // 1. Save to Neon DB
        const orderItems = items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor,
          price: item.product.price,
          image: item.product.image,
          designerEmail: (item.product as any).designerEmail, // Ensure we have this for notifications
          design: item.customDesign ? {
            ...item.customDesign,
            id: item.customDesign.id || item.product.id,
            designerId: item.customDesign.designerId
          } : (item.product as any).designerId ? {
            id: (item.product as any).designId || item.product.id,
            designerId: (item.product as any).designerId,
            preview: item.product.image
          } : null
        }));

        const [savedOrder] = await db.insert(orders).values({
          customerName: formData.name,
          customerEmail: formData.email,
          shippingAddress: formData.address,
          city: formData.city,
          country: formData.country,
          totalAmount: finalTotal,
          depositAmount: paymentType === 'deposit' ? depositAmount : finalTotal,
          balanceAmount: paymentType === 'deposit' ? balanceAmount : 0,
          paymentType: paymentType,
          status: 'pending',
          paymentStatus: 'paid',
          items: orderItems
        }).returning();

        // Send Order Confirmation Emails
        emailService.sendOrderConfirmation(savedOrder).catch(err => {
          console.error('Failed to send order emails:', err);
        });

        // 2. Clear Cart and Show Success
        setStep('success');
        clearCart();
        setIsProcessing(false);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#0284c7', '#ffffff']
        });
      } catch (error) {
        console.error('Error saving order:', error);
        alert('Payment successful, but failed to save order details. Please contact support.');
        setIsProcessing(false);
      }
    };

    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: formData.email,
      amount: Math.round(payableNow * 100), // KES in cents
      currency: 'KES',
      ref: `ORD-${Date.now()}`,
      callback: (response: any) => {
        handleSuccess(response);
      },
      onClose: () => {
        setIsProcessing(false);
        alert('Transaction was not completed, window closed.');
      }
    });

    handler.openIframe();
  };

  useEffect(() => {
    // Load Paystack script
    console.log('Inserting Paystack script...');
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
    };
    document.body.appendChild(script);
    return () => {
      console.log('Cleaning up Paystack script...');
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Layout>
      <VideoBackground videoUrl="https://i.imgur.com/d2d8Llz.mp4" />
      <div className="min-h-screen py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-20">
            <div className="flex items-center gap-4">
              {[
                { id: 'auth', icon: User, label: 'Account' },
                { id: 'shipping', icon: MapPin, label: 'Shipping' },
                { id: 'payment', icon: CreditCard, label: 'Payment' }
              ].map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={clsx("flex flex-col items-center gap-2", step === s.id ? 'text-primary-400' : 'text-white/40')}>
                    <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all", step === s.id ? 'border-primary-400 bg-white/10 shadow-lg shadow-primary-500/20' : 'border-white/20 bg-white/5')}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{s.label}</span>
                  </div>
                  {i < 2 && <div className="w-12 h-0.5 bg-white/20 mt-[-20px]" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8">
              
              {/* Step 1: Auth */}
              {step === 'auth' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-12 shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-3xl font-black text-white mb-4 italic uppercase">Checkout Options</h3>
                  <p className="text-white/60 font-medium mb-10">Choose how you want to proceed with your order</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/login?redirect=/checkout" className="group">
                      <div className="h-full border-4 border-white/10 rounded-[2.5rem] p-8 hover:border-primary-400 transition-all text-center bg-white/5">
                        <LogIn className="w-12 h-12 text-primary-400 mx-auto mb-6" />
                        <h4 className="text-xl font-black text-white mb-2 uppercase">Log In</h4>
                        <p className="text-sm text-white/60 font-medium mb-8">Access your saved addresses and faster checkout</p>
                        <Button variant="outline" className="w-full rounded-2xl group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600">
                          Sign In <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </Link>

                    <div className="group cursor-pointer" onClick={() => { setIsGuest(true); setStep('shipping'); }}>
                      <div className="h-full border-4 border-white/10 rounded-[2.5rem] p-8 hover:border-white transition-all text-center bg-white/5">
                        <UserPlus className="w-12 h-12 text-white/40 mx-auto mb-6 group-hover:text-white" />
                        <h4 className="text-xl font-black text-white mb-2 uppercase">Guest Checkout</h4>
                        <p className="text-sm text-white/60 font-medium mb-8">No account? No problem. Checkout as a guest</p>
                        <Button variant="outline" className="w-full rounded-2xl group-hover:bg-white group-hover:text-slate-900 group-hover:border-white">
                          Continue <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping */}
              {step === 'shipping' && (
                <div className="space-y-12">
                  <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-12 shadow-xl border border-white/20">
                    <h3 className="text-3xl font-black text-white mb-10 italic uppercase">Shipping Details</h3>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep('payment'); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2">Full Name</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-white placeholder:text-white/40"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2">Email Address</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-white placeholder:text-white/40"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2">Shipping Address</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-6 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-white placeholder:text-white/40"
                          placeholder="123 Kenyatta Ave, Nairobi"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2">City/Area</label>
<select
                             required
                             value={formData.city}
                             onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                             className="w-full px-6 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-white"
                           >
                             <option value="" className="bg-slate-800">Select your location</option>
                             <optgroup label="Nairobi CBD (Free)" className="text-green-400 font-bold">
                               {KENYA_CBD_AREAS.map(area => <option key={area} value={area} className="bg-slate-800">{area}</option>)}
                             </optgroup>
                             <optgroup label="Nairobi Areas (KES 150)" className="text-primary-400 font-bold">
                               <option value="Nairobi" className="bg-slate-800">Nairobi County</option>
                               {NAIROBI_AREAS.map(area => <option key={area} value={area} className="bg-slate-800">{area}</option>)}
                             </optgroup>
                             <optgroup label="Kenya Counties (KES 300)" className="text-primary-400 font-bold">
                               {KENYA_COUNTIES.map(county => <option key={county} value={county} className="bg-slate-800">{county} County</option>)}
                             </optgroup>
                           </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2">Country</label>
                          <select
                            className="w-full px-6 py-4 bg-white/10 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold text-white"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          >
                            <option value="Kenya" className="bg-slate-800">Kenya</option>
                            <option value="" disabled className="bg-slate-800 text-white/40">USA (Coming Soon)</option>
                            <option value="" disabled className="bg-slate-800 text-white/40">Canada (Coming Soon)</option>
                            <option value="" disabled className="bg-slate-800 text-white/40">UK (Coming Soon)</option>
                            <option value="" disabled className="bg-slate-800 text-white/40">Australia (Coming Soon)</option>
                          </select>
                        </div>
                      </div>
                      <Button variant="premium" className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg mt-10" type="submit">
                        Proceed to Payment
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 'payment' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-12 shadow-xl border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-3xl font-black text-white mb-10 italic uppercase">Payment Method</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <button 
                      onClick={() => setPaymentType('full')}
                      className={clsx(
                        "p-8 rounded-[2rem] border-4 transition-all text-left group",
                        paymentType === 'full' ? "border-primary-400 bg-primary-500/10" : "border-white/10 hover:border-white/20 bg-white/5"
                      )}
                    >
                      <Wallet className={clsx("w-10 h-10 mb-4 transition-colors", paymentType === 'full' ? "text-primary-400" : "text-white/40")} />
                      <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Full Payment</h4>
                      <p className="text-sm text-white/60 font-medium mb-4">Pay the total amount now and get faster priority shipping</p>
                      <div className="text-2xl font-black text-primary-400">KES {finalTotal.toLocaleString()}</div>
                    </button>

                    <button 
                      onClick={() => setPaymentType('deposit')}
                      className={clsx(
                        "p-8 rounded-[2rem] border-4 transition-all text-left group",
                        paymentType === 'deposit' ? "border-primary-400 bg-primary-500/10" : "border-white/10 hover:border-white/20 bg-white/5"
                      )}
                    >
                      <Truck className={clsx("w-10 h-10 mb-4 transition-colors", paymentType === 'deposit' ? "text-primary-400" : "text-white/40")} />
                      <h4 className="text-xl font-black text-white mb-1 uppercase tracking-tight">Pay on Delivery</h4>
                      <p className="text-sm text-white/60 font-medium mb-4">Pay 60% deposit now for customization, and the remaining 40% balance on delivery.</p>
                      <div className="text-2xl font-black text-primary-400">KES {depositAmount.toLocaleString()} <span className="text-xs text-white/60">Deposit</span></div>
                      <div className="text-[10px] font-bold text-white/60 uppercase mt-2">Balance of KES {balanceAmount.toLocaleString()} on delivery</div>
                    </button>
                  </div>

                  <div className="bg-slate-900/80 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <CreditCard className="w-16 h-16 text-primary-400 mx-auto mb-6 relative z-10" />
                    <h4 className="text-2xl font-black text-white mb-2 uppercase italic relative z-10">Secure Checkout</h4>
                    <p className="text-white/60 font-medium mb-10 max-w-sm mx-auto relative z-10">
                      Finalize your order via Paystack. You are paying <span className="text-white font-black underline decoration-primary-400 decoration-4 underline-offset-4">KES {payableNow.toLocaleString()}</span> now.
                    </p>
                    <Button 
                      variant="premium" 
                      className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg shadow-2xl shadow-primary-600/20 disabled:opacity-50" 
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Pay KES ${payableNow.toLocaleString()} with Paystack`}
                    </Button>
                    <button 
                      onClick={() => setStep('shipping')} 
                      className="mt-8 text-xs font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors"
                      disabled={isProcessing}
                    >
                      ← Edit Shipping Information
                    </button>
                  </div>
                </div>
              )}

              {/* Success */}
              {step === 'success' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-16 shadow-xl border border-white/20 text-center">
                  <div className="w-24 h-24 bg-green-500/20 rounded-[2.5rem] flex items-center justify-center text-green-400 mx-auto mb-10 border border-green-500/30">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-6 italic uppercase">Order Placed!</h3>
                  <p className="text-xl text-white/60 font-medium mb-12 max-w-lg mx-auto">
                    Thank you for your purchase, <span className="text-white font-black">{formData.name}</span>. We've sent a confirmation email to {formData.email}.
                  </p>
                  <Link to="/">
                    <Button variant="premium" className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-lg">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              )}

            </div>

            {step !== 'success' && (
              <div className="lg:col-span-4">
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-[3rem] p-10 text-white sticky top-28 shadow-2xl border border-white/5 overflow-hidden">
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[80px] -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-600/10 blur-[80px] -ml-16 -mb-16" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-primary-400" />
                        Order Summary
                      </h3>
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <span className="text-[10px] font-black uppercase text-primary-400">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
                      </div>
                    </div>

                    <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {items.map(item => (
                        <div key={item.id} className="group relative bg-white/[0.03] backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 transition-all hover:bg-white/[0.05] hover:border-white/10">
                          <div className="flex gap-6">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 relative shadow-inner">
                              <img 
                                src={item.customDesign?.previewImage || item.product.image} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover" 
                              />
                              {item.customDesign && (
                                <div className="absolute top-1 right-1">
                                  <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <Palette className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="text-sm font-black uppercase truncate flex items-center gap-2 text-white">
                                {item.product.name}
                                {item.customDesign?.isDoubleSided && (
                                  <span className="text-[8px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 font-black tracking-tighter uppercase">2-Sided</span>
                                )}
                              </h4>
                              <p className="text-[10px] text-white/60 font-bold uppercase mt-1 tracking-tight">
                                {item.selectedSize} • {item.selectedColor} • Qty {item.quantity}
                              </p>
                              <p className="text-sm font-black text-primary-400 mt-2">KES {((item.product?.price ?? 0) * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          {item.customDesign?.isDoubleSided && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                <img src={item.customDesign.previews?.front} className="w-full h-full object-contain" alt="Front" />
                              </div>
                              <div className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                <img src={item.customDesign.previews?.back} className="w-full h-full object-contain" alt="Back" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                      <div className="space-y-4 pt-8 border-t border-white/10">
                        <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Cart Subtotal</span>
                        <span className="text-sm font-black text-white tracking-tight">KES {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Delivery Fee</span>
                        <span className={clsx("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", 
                          shippingFee === 0 ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-primary-400 bg-primary-400/10 border-primary-400/20"
                        )}>
                          {shippingFee === 0 ? 'FREE' : `KES ${shippingFee.toLocaleString()}`}
                        </span>
                      </div>
                      {formData.city && (
                        <div className="text-[9px] text-white/40 px-2">
                          {KENYA_CBD_AREAS.includes(formData.city) 
                            ? 'Nairobi CBD - Free Delivery' 
                            : NAIROBI_AREAS.includes(formData.city)
                              ? `${formData.city} - KES 150`
                              : formData.city === 'Nairobi' 
                                ? 'Nairobi County - KES 150'
                                : KENYA_COUNTIES.includes(formData.city)
                                  ? `${formData.city} County - KES 300`
                                  : 'Other Locations - KES 200'
                          }
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-8 mt-4 border-t border-white/10 px-2 bg-gradient-to-t from-white/5 to-transparent rounded-[2rem] p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-primary-400 uppercase tracking-[0.3em]">
                            {paymentType === 'full' ? 'Final Total' : 'Secure Deposit'}
                          </span>
                          {paymentType === 'deposit' && (
                            <span className="text-[8px] font-bold text-white/60 uppercase">
                              Balance: KES {balanceAmount.toLocaleString()} on arrival
                            </span>
                          )}
                        </div>
                        <span className="text-4xl font-black text-white tracking-tighter flex items-start gap-1">
                          <span className="text-base text-primary-400 mt-1">KES</span>
                          {payableNow.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-4 text-white/20">
                      <div className="h-px flex-1 bg-white/5" />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Encrypted</span>
                      </div>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;





