import React from 'react';
import { ShoppingCart, Star, Heart, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { useCart } from '../../store/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-white/5 rounded-[2.5rem] border border-white/10 transition-all duration-500 hover:border-primary-500/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
        />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {product.isCustomizable && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-600 shadow-sm">
              <Palette className="w-3 h-3" />
              Customizable
            </div>
          )}
        </div>

        <button className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-xl">
          <Heart className="w-6 h-6" />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col gap-3">
          {product.isCustomizable && (
            <Link to={`/designer?product=${product.category}&id=${product.id}`}>
              <Button variant="secondary" className="w-full shadow-2xl gap-2 font-black py-4">
                <Palette className="w-5 h-5" />
                Customize Now
              </Button>
            </Link>
          )}
          <Button 
            className="w-full shadow-2xl gap-2 font-black py-4"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </Button>
        </div>
      </div>


      <div className="mt-8 space-y-3 px-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs font-black text-primary-500 uppercase tracking-[0.2em]">
              {product.category}
            </p>
            <h3 className="text-xl font-black text-white leading-tight group-hover:text-primary-500 transition-colors uppercase italic tracking-tighter">
              {product.name}
            </h3>
          </div>
          <p className="text-2xl font-black text-gray-300 tracking-tighter">KES {product.price.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < 4
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400">
              (4.8)
            </span>
          </div>
          
          <div className="flex -space-x-2">
            {product.colors?.slice(0, 3).map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            {(product.colors?.length || 0) > 3 && (
              <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                +{product.colors!.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
