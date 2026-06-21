import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';
import Button from '../components/ui/Button';
import { ShoppingCart, Palette, ChevronLeft, Minus, Plus, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { Product } from '../types';
import { db } from '../db';
import { designerDesigns, designers } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_DATA, READY_MADE_PRODUCTS } from '../data/seed';

const ProductDetail: React.FC = () => {
  useSeo({
    title: 'Product Details | Crownstroke',
    description: 'Premium customizable products and designer creations.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/product`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let foundProduct: Product | null = null;

        const readyMade = READY_MADE_PRODUCTS.find(p => p.id === productId);
        if (readyMade) {
          foundProduct = readyMade;
        } else if (productId?.startsWith('template-')) {
          const category = productId.replace('template-', '') as Product['category'];
          const templateProduct = PRODUCT_DATA[category];
          if (templateProduct) {
            const firstColor = Object.keys(templateProduct)[0];
            foundProduct = {
              id: productId,
              name: `${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Essential`,
              description: `Premium customizable ${category.replace(/-/g, ' ')}. Add your own artwork and make it personal.`,
              price: category === 't-shirt' ? 1500 : category === 'hoodie' ? 3500 : 1200,
              image: templateProduct[firstColor]?.front,
              category,
              isCustomizable: true,
              colors: Object.keys(templateProduct),
              sizes: ['t-shirt', 'hoodie', 'long-sleeve-tee', 'tank-top'].includes(category) ? ['S', 'M', 'L', 'XL', 'XXL'] : undefined,
              images: {
                front: templateProduct[firstColor]?.front,
                back: templateProduct[firstColor]?.back
              }
            };
          }
        } else {
          const result = await db.select({
            id: designerDesigns.id,
            name: designerDesigns.name,
            productId: designerDesigns.productId,
            preview: designerDesigns.preview,
            price: designerDesigns.price,
            designerEmail: designers.email,
            designerId: designers.id,
          })
            .from(designerDesigns)
            .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
            .where(eq(designerDesigns.id, productId as string));

          if (result.length > 0) {
            const d = result[0];
            const categoryImages = PRODUCT_DATA[d.productId as keyof typeof PRODUCT_DATA];
            const firstColor = categoryImages ? Object.keys(categoryImages)[0] : null;
            foundProduct = {
              id: d.id,
              name: d.name,
              description: `Exclusive artwork by Crownstroke artist${d.designerEmail ? ` (${d.designerEmail})` : ''}. This custom design represents individual creativity and premium craftsmanship. Each piece is printed on demand using eco-friendly materials.`,
              price: d.price ?? 0,
              image: d.preview,
              category: d.productId as Product['category'],
              isCustomizable: false,
              designerEmail: d.designerEmail,
              designerId: d.designerId,
              images: categoryImages && firstColor ? {
                front: categoryImages[firstColor]?.front,
                back: categoryImages[firstColor]?.back
              } : undefined
            };
          }
        }

        setProduct(foundProduct);
        if (foundProduct) {
          setSelectedImage(foundProduct.image || foundProduct.images?.front || '');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedSize, selectedColor);
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity, selectedSize, selectedColor);
      navigate('/checkout');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-transparent">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center bg-transparent">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">Product not found</h2>
            <Link to="/shop" className="mt-4 inline-block text-primary-300 hover:text-primary-200">
              Back to shop
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const galleryImages = product.images?.back
    ? [product.image, product.images.back].filter(Boolean)
    : product.images?.front
    ? [product.images.front, product.images.back].filter(Boolean)
    : [product.image];

  return (
    <Layout>
      <div className="bg-transparent px-4 pb-10 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[88rem]">
          <Link to="/shop" className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-200 hover:text-primary-100">
            <ChevronLeft className="h-4 w-4" /> Back to Shop
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-md"
              >
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="h-full w-full object-contain"
                />
              </motion.div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img!)}
                      className={`aspect-[4/5] overflow-hidden rounded-lg border transition ${
                        selectedImage === img ? 'border-primary-500' : 'border-white/25 hover:border-white/50'
                      }`}
                    >
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-primary-200">{product.category.replace(/-/g, ' ')}</p>
                <h1 className="text-3xl font-black text-white drop-shadow sm:text-4xl">{product.name}</h1>
                <div className="mt-3 flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < 4 ? 'fill-amber-300 text-amber-300' : 'fill-white/25 text-white/25'}`} />
                  ))}
                  <span className="text-sm font-bold text-white/55">(4.8)</span>
                </div>
              </div>

              <div className="border-l-4 border-primary-500/30 bg-white/5 p-4">
                <p className="text-lg font-semibold leading-relaxed text-white/90">{product.description}</p>
              </div>

              <div className="border-l-4 border-primary-500 bg-white/10 p-4">
                <p className="text-3xl font-black text-white">KES {product.price.toLocaleString()}</p>
                <p className="text-xs font-bold text-primary-200">One-time purchase • No hidden fees</p>
              </div>

              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/65">Select Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          const productImages = PRODUCT_DATA[product.category];
                          const colorImages = productImages?.[color];
                          if (!product.images || product.images.front === product.image) {
                            setSelectedImage(colorImages?.front || product.image);
                          }
                        }}
                        className={`h-12 w-12 rounded-xl border-2 transition-all hover:scale-110 ${
                          selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/65">Select Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-12 w-12 items-center justify-center rounded-xl border font-black uppercase transition-all ${
                          selectedSize === size
                            ? 'border-primary-500 bg-primary-500/20 text-white'
                            : 'border-white/25 bg-white/10 text-white/65 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-white/65">Quantity</p>
                <div className="flex w-32 items-center justify-between rounded-xl border border-white/25 bg-white/15">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-white/65 hover:text-white"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-black text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-white/65 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Button onClick={handleBuyNow} className="h-14 gap-3 text-sm font-black uppercase tracking-widest">
                  <ShoppingCart className="h-5 w-5" /> Buy Now
                </Button>
                <Button variant="outline" onClick={handleAddToCart} className="h-14 gap-3 border-white/25 text-white hover:bg-white/15">
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </Button>
              </div>

              {product.isCustomizable && (
                <Link
                  to={`/designer?product=${product.category}&id=${product.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-primary-200/40 bg-white/15 py-4 text-xs font-black uppercase tracking-widest text-primary-100 transition hover:bg-white/25"
                >
                  <Palette className="h-5 w-5" /> Customize This Product
                </Link>
              )}

              <div className="grid gap-4 border-t border-white/10 pt-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary-500" />
                  <div>
                    <p className="font-bold text-white">Premium Quality Guarantee</p>
                    <p className="text-xs text-white/55">Crafted with top-grade materials and precision.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 text-primary-500" />
                  <div>
                    <p className="font-bold text-white">Fast Shipping</p>
                    <p className="text-xs text-white/55">Delivery within 3-5 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <RefreshCw className="h-6 w-6 text-primary-500" />
                  <div>
                    <p className="font-bold text-white">Easy Returns</p>
                    <p className="text-xs text-white/55">30-day money-back guarantee.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;