import React from 'react';
import Layout from '../components/layout/Layout';
import { useCart } from '../store/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
          <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">Your cart is empty</h2>
          <p className="text-lg text-slate-500 mb-10 text-center max-w-md">
            Looks like you haven't added anything to your cart yet. Let's change that!
          </p>
          <Link to="/shop">
            <Button size="lg" className="px-10 py-5 rounded-2xl font-black gap-3 shadow-xl shadow-primary-600/20">
              Go to Shop
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen pb-24">
        <header className="bg-white border-b border-slate-200 py-12 lg:py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900">
              Shopping <span className="text-primary-600">Cart</span>
            </h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row gap-6 group hover:border-primary-200 transition-all shadow-sm"
                  >
                    <div className="w-full sm:w-32 aspect-square bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.customDesign?.previewImage || item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">
                            {item.product.category}
                          </p>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">
                            {item.product.name}
                          </h3>
                          {item.selectedSize && (
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase">
                              Size: <span className="text-slate-900">{item.selectedSize}</span>
                            </p>
                          )}
                        </div>
                        <p className="text-xl font-black text-slate-900">
                          KES {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-black text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400 hover:text-slate-900 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 text-sm font-black text-red-400 hover:text-red-500 transition-colors px-4 py-2 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white sticky top-28 shadow-2xl">
                <h3 className="text-2xl font-black mb-8">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>Subtotal</span>
                    <span className="text-white">KES {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>Shipping</span>
                    <span className="text-green-400 font-black tracking-widest uppercase text-xs">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>Estimated Tax</span>
                    <span className="text-white">KES 0</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-3xl font-black">KES {total.toLocaleString()}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full py-5 rounded-2xl font-black text-lg gap-3 bg-white text-slate-900 hover:bg-primary-50 transition-all mb-4">
                    Checkout Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                  Secure SSL Encrypted Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
