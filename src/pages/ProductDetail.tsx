import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';
import Button from '../components/ui/Button';
import { ShoppingCart, Palette, ChevronLeft, Minus, Plus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { Product } from '../types';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_DATA } from '../data/seed';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedPrintOrientation, setSelectedPrintOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [selectedColor, setSelectedColor] = useState<string>('#ffffff');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);

  useSeo({
    title: product ? `${product.name} | Crownstroke` : 'Product details | Crownstroke',
    description: product?.description || 'Shop customizable blank products and original work from independent designers.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/product`,
    ogImage: product?.image || CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let foundProduct: Product | null = null;

        if (productId?.startsWith('template-')) {
          const category = productId.replace('template-', '') as Product['category'];
          const templateProduct = PRODUCT_DATA[category];
          if (templateProduct) {
            const firstColor = Object.keys(templateProduct)[0];
            foundProduct = {
              id: productId,
              name: `${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Blank`,
              description: `A clean ${category.replace(/-/g, ' ')} ready for your own artwork. Choose your color and size, then make it yours in the design studio.`,
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
          const designRows = await db.select({
            id: designerDesigns.id,
            name: designerDesigns.name,
            productId: designerDesigns.productId,
            preview: designerDesigns.preview,
            price: designerDesigns.price,
            designerId: designerDesigns.designerId,
            shopId: designerDesigns.shopId,
          }).from(designerDesigns).where(eq(designerDesigns.id, productId as string));
          const d = designRows[0];

          if (d) {
            const [designerRows, shopRows] = await Promise.all([
              db.select({ name: designers.name, email: designers.email }).from(designers).where(eq(designers.id, d.designerId)),
              db.select({ name: shops.name, slug: shops.slug }).from(shops).where(eq(shops.id, d.shopId)),
            ]);
            const designer = designerRows[0];
            const shop = shopRows[0];
            const designerName = designer?.name || 'an independent designer';

            foundProduct = {
              id: d.id,
              name: d.name,
              description: 'An original design by ' + designerName + ', printed on demand' + (shop?.name ? ' and sold through ' + shop.name : '') + '.',
              price: d.price ?? 0,
              image: d.preview,
              category: d.productId as Product['category'],
              isCustomizable: false,
              designerEmail: designer?.email,
              designerId: d.designerId,
              designerName: designer?.name || undefined,
              shopName: shop?.name || undefined,
              shopSlug: shop?.slug || undefined,
            };
          }
        }

        setProduct(foundProduct);
        if (foundProduct) {
          setSelectedPrintOrientation('portrait');
          setSelectedImage(foundProduct.image || foundProduct.images?.front || '');
          setSelectedColor(foundProduct.colors?.[0] || '#ffffff');
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const getCartProduct = (item: Product): Product => {
    if (item.category !== 'poster' && item.category !== 'art-design') return item;
    return { ...item, image: selectedImage || item.image };
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(getCartProduct(product), quantity, selectedSize, selectedColor);
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(getCartProduct(product), quantity, selectedSize, selectedColor);
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

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)] lg:gap-12">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative aspect-[4/4.2] overflow-hidden rounded-[1.4rem] border border-white/15 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,.12),transparent_60%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025))] p-5 shadow-2xl shadow-black/20 sm:p-8"
              >
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </motion.div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImage(img!);
                        if (product.category === 'poster' || product.category === 'art-design') {
                          setSelectedPrintOrientation(idx === 0 ? 'portrait' : 'landscape');
                        }
                      }}
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
              className="space-y-6 lg:sticky lg:top-24"
            >
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/15 bg-white/[.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[.17em] text-white/60">{product.category.replace(/-/g, ' ')}</span><span className={product.isCustomizable ? 'rounded-full bg-lime-200 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-slate-950' : 'rounded-full border border-primary-200/30 bg-primary-200/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em] text-primary-100'}>{product.isCustomizable ? 'Make it yours' : 'Artist original'}</span></div>
                <h1 className="max-w-2xl text-4xl font-black leading-[.96] tracking-[-.045em] text-white drop-shadow sm:text-5xl">{product.name}</h1>
                {product.shopSlug && <Link to={'/shop/' + product.shopSlug} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-100 transition hover:text-white"><span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 text-[11px] font-black">{(product.designerName || product.shopName || 'D').slice(0, 1)}</span><span>By <b>{product.designerName || product.shopName}</b> <span className="text-white/45">· Visit shop</span></span></Link>}
              </div>

              <p className="max-w-xl text-base leading-7 text-white/65">{product.description}</p>

              {product.isCustomizable && (product.category === 'poster' || product.category === 'art-design') && (
                <section className="overflow-hidden rounded-2xl border border-lime-200/20 bg-[linear-gradient(125deg,rgba(190,242,100,.09),rgba(255,255,255,.04)_48%,rgba(255,255,255,.02))] p-4 sm:p-5" aria-label="Print formats">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[.2em] text-lime-200/80">Choose your format</p>
                      <p className="mt-1 text-xs font-semibold text-white/55">Two layouts. One original.</p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[.16em] text-white/35">Print ready</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {([
                      { side: 'front', title: 'Portrait', dimensions: '1024 × 1536 px', ratio: '2:3', artwork: '4000 × 6000 px' },
                      { side: 'back', title: 'Landscape', dimensions: '1536 × 1024 px', ratio: '3:2', artwork: '6000 × 4000 px' },
                    ] as const).map((format) => {
                      const image = format.side === 'front' ? (product.images?.front || product.image) : (product.images?.back || product.image);
                      const selected = selectedPrintOrientation === format.side;
                      return (
                        <button key={format.side} type="button" onClick={() => { setSelectedPrintOrientation(format.side); setSelectedImage(image); }} aria-pressed={selected}
                          className={`rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200 ${selected ? 'border-lime-200/55 bg-lime-100/[.08]' : 'border-white/10 bg-black/15 hover:border-white/25'}`}>
                          <span className="flex items-center gap-2">
                            <span className={`grid shrink-0 place-items-center rounded-sm border border-lime-100/40 bg-lime-100/[.06] ${format.side === 'front' ? 'h-8 w-5' : 'h-5 w-8'}`}><span className="h-1 w-1 rounded-full bg-lime-200" /></span>
                            <span className="text-[9px] font-black uppercase tracking-[.14em] text-white">{format.title} <span className="text-white/45">· {format.ratio}</span></span>
                          </span>
                          <span className="mt-3 block text-[8px] font-bold text-white/65">Mockup {format.dimensions}</span>
                          <span className="mt-1 block text-[8px] text-white/40">Recommended art {format.artwork}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="flex items-end justify-between gap-4 border-y border-white/10 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">Price</p><p className="mt-1 text-4xl font-black tracking-tight text-white">KES {product.price.toLocaleString()}</p></div><p className="max-w-40 text-right text-xs leading-5 text-white/45">Printed to order<br />Thoughtfully made</p></div>

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
                          if (product.category === 'poster' || product.category === 'art-design') {
                            const side = selectedPrintOrientation === 'portrait' ? 'front' : 'back';
                            setSelectedImage(colorImages?.[side] || (side === 'front' ? product.images?.front : product.images?.back) || product.image);
                          } else if (!product.images || product.images.front === product.image) {
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
                  <ShoppingCart className="h-5 w-5" /> Buy now
                </Button>
                <Button variant="outline" onClick={handleAddToCart} className="h-14 gap-3 border-white/25 text-white hover:bg-white/15">
                  <ShoppingCart className="h-5 w-5" /> Add to bag
                </Button>
              </div>

              {product.isCustomizable && (
                <Link
                  to={`/designer?product=${product.category}&id=${product.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-primary-200/40 bg-white/15 py-4 text-xs font-black uppercase tracking-widest text-primary-100 transition hover:bg-white/25"
                >
                  <Palette className="h-5 w-5" /> Customize this blank
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
