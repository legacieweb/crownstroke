import React from 'react';
import { ShoppingCart, Star, Heart, Palette, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Product } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  onAdded?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid', onAdded }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlistKey = user ? `wishlist_${user.id}` : '';
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [imageSide, setImageSide] = React.useState<'front' | 'back'>(product.previewOrder?.[0] || 'front');
  const displayImage = product.images?.[imageSide] || product.image;
  const hasImageControls = Boolean(product.images?.front || product.images?.back);

  React.useEffect(() => {
    setImageSide(product.previewOrder?.[0] || 'front');
  }, [product.id, product.previewOrder]);

  React.useEffect(() => {
    if (!wishlistKey) {
      setIsWishlisted(false);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      setIsWishlisted(saved.some((item: Product) => item.id === product.id));
    } catch {
      setIsWishlisted(false);
    }
  }, [product.id, wishlistKey]);

  const handleAddToCart = () => {
    addToCart(product);
    onAdded?.(product);
  };

  const handleBuyNow = () => {
    addToCart(product);
    onAdded?.(product);
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    if (!user || !wishlistKey) {
      navigate('/login');
      return;
    }

    const saved = JSON.parse(localStorage.getItem(wishlistKey) || '[]') as Product[];
    const exists = saved.some((item) => item.id === product.id);
    const next = exists ? saved.filter((item) => item.id !== product.id) : [...saved, product];
    localStorage.setItem(wishlistKey, JSON.stringify(next));
    setIsWishlisted(!exists);
  };

  if (layout === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="product-motion grid gap-4 rounded-lg border border-white/25 bg-white/15 p-4 shadow-xl shadow-black/10 backdrop-blur-md md:grid-cols-[180px_1fr_auto]"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white/15">
          <Link to={'/product/' + product.id} className="block h-full cursor-pointer">
            <img src={displayImage} alt={`${product.name} ${imageSide} view`} className="h-full w-full object-contain" />
          </Link>
          {hasImageControls && (
            <div className="absolute bottom-2 left-2 z-10 inline-flex gap-1 rounded-lg border border-white/20 bg-slate-950/85 p-1 shadow-lg backdrop-blur" role="group" aria-label={`${product.name} image side`}>
              {(['front', 'back'] as const).map((side) => <button key={side} type="button" onClick={() => setImageSide(side)} aria-pressed={imageSide === side} className={`rounded-md px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${imageSide === side ? 'bg-white text-slate-950' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>{side}</button>)}
            </div>
          )}
          <button
            onClick={toggleWishlist}
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 shadow transition hover:text-red-500 ${
              isWishlisted ? 'text-red-500' : 'text-zinc-500'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
        </div>
        <div className="min-w-0">
          <Link to={'/product/' + product.id} className="block cursor-pointer">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary-200">{product.category.replace(/-/g, ' ')}</p>
            <h3 className="text-2xl font-black text-white drop-shadow">{product.name}</h3>
          </Link>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/72">{product.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {product.shopName && <span className="text-xs font-bold text-white/55">From {product.shopName}</span>}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 md:items-end">
          <p className="text-2xl font-black text-white">KES {(product.price ?? 0).toLocaleString()}</p>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Button onClick={handleBuyNow} className="gap-2 rounded-lg font-black uppercase tracking-widest">
              <CreditCard className="h-4 w-4" />
              Buy Now
            </Button>
            <Button variant="outline" onClick={handleAddToCart} className="gap-2 rounded-lg border-white/25 text-white hover:bg-white/15">
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
            {product.isCustomizable ? (
              <Link to={`/designer?product=${product.category}&id=${product.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200/40 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-primary-100 hover:bg-white/15">
                <Palette className="h-4 w-4" /> Customize
              </Link>
            ) : product.shopSlug ? (
              <Link to={'/shop/' + product.shopSlug} className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-white/80 hover:bg-white/10">Visit shop</Link>
            ) : null}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="product-motion group">
      <div className="overflow-hidden rounded-lg border border-white/25 bg-white/15 shadow-xl shadow-black/10 backdrop-blur-md transition hover:border-primary-200/60 hover:bg-white/20">
        <div className="relative aspect-[4/5] overflow-hidden bg-white/15">
          <Link to={'/product/' + product.id} className="block h-full cursor-pointer">
            <img
              src={displayImage}
              alt={`${product.name} ${imageSide} view`}
              className="h-full w-full object-contain opacity-95 transition duration-500 group-hover:scale-[1.02]"
            />
          </Link>
          {hasImageControls && (
            <div className="absolute bottom-2 left-2 z-10 inline-flex gap-1 rounded-lg border border-white/20 bg-slate-950/85 p-1 shadow-lg backdrop-blur" role="group" aria-label={`${product.name} image side`}>
              {(['front', 'back'] as const).map((side) => <button key={side} type="button" onClick={() => setImageSide(side)} aria-pressed={imageSide === side} className={`rounded-md px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${imageSide === side ? 'bg-white text-slate-950' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>{side}</button>)}
            </div>
          )}
            <button
              onClick={toggleWishlist}
              className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 shadow transition hover:text-red-500 sm:h-10 sm:w-10 ${
                isWishlisted ? 'text-red-500' : 'text-zinc-500'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
        </div>

        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
          <Link to={'/product/' + product.id} className="block cursor-pointer">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary-200 sm:mb-2 sm:text-xs sm:tracking-[0.2em]">{product.category.replace(/-/g, ' ')}</p>
              <h3 className="min-h-[2.8rem] text-sm font-black leading-5 text-white drop-shadow sm:min-h-[3.5rem] sm:text-xl sm:leading-7">{product.name}</h3>
              {product.shopSlug && <span className="mt-1 inline-block text-[10px] font-bold text-primary-200 sm:text-xs">By {product.designerName || product.shopName}</span>}
            </div>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < 4 ? 'fill-amber-300 text-amber-300' : 'fill-white/25 text-white/25'}`} />
              ))}
            </div>
            <p className="text-base font-black text-white sm:text-xl">KES {(product.price ?? 0).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleBuyNow} className="gap-1 rounded-lg px-2 text-[10px] font-black uppercase tracking-widest sm:gap-2 sm:px-3 sm:text-xs">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Buy
            </Button>
            <Button variant="outline" onClick={handleAddToCart} className="gap-1 rounded-lg border-white/25 px-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/15 sm:gap-2 sm:px-3 sm:text-xs">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add
            </Button>
          </div>

          {product.shopSlug && (
            <Link to={'/shop/' + product.shopSlug} className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 transition hover:border-primary-200/60 hover:bg-white/10 sm:gap-2 sm:px-3 sm:text-xs">
              Visit {product.shopName || 'designer shop'}
            </Link>
          )}

          {product.isCustomizable && (
            <Link
              to={`/designer?product=${product.category}&id=${product.id}`}
              className="flex items-center justify-center gap-1 rounded-lg border border-primary-200/40 bg-white/15 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-primary-100 transition hover:bg-white/25 sm:gap-2 sm:px-3 sm:text-xs"
            >
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Customize
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
