import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, PackageCheck, Palette, Sparkles, Upload, WandSparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomeHeroProductMockup from '../components/home/HomeHeroProductMockup';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';
import { PRODUCT_DATA } from '../data/seed';
import { apiUrl } from '../services/apiUrl';

const products = [
  { name: 'T-shirts', detail: 'Your next favourite tee', image: PRODUCT_DATA['t-shirt']['#ffffff'].front, query: 't-shirt' },
  { name: 'Hoodies', detail: 'Made for the everyday', image: PRODUCT_DATA.hoodie['#000000'].front, query: 'hoodie' },
  { name: 'Mugs', detail: 'A little more personal', image: PRODUCT_DATA.mug['#ffffff'].front, query: 'mug' },
  { name: 'Art prints', detail: 'Bring it off the screen', image: PRODUCT_DATA.poster['#ffffff'].front, query: 'poster' },
];

type FeaturedShop = { id: string; name: string; designer: string; image: string | null; slug: string };
type CuratedDesign = { id: string; name: string; preview: string; product: string; price: number; designer: string; pick: 'EDITOR’S PICK' | 'FEATURED' };
type LimitedEdition = { id: string; name: string; description: string; price: number; frontImage: string; backImage: string; extraImages: string[] };

const toShopSlug = (value: unknown): string =>
  typeof value === 'string' && value.trim() && value.trim().toLowerCase() !== 'null'
    ? value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

const Home: React.FC = () => {
  const [featuredShops, setFeaturedShops] = useState<FeaturedShop[]>([]);
  const [curatedDesigns, setCuratedDesigns] = useState<CuratedDesign[]>([]);
  const [isCuratedLoading, setIsCuratedLoading] = useState(true);
  const [limitedEditions, setLimitedEditions] = useState<LimitedEdition[]>([]);

  useEffect(() => {
    let active = true;
    fetch(apiUrl('/api/limited-editions')).then((response) => response.ok ? response.json() : []).then((rows: any[]) => {
      if (active) setLimitedEditions(rows.slice(0, 4).map((row) => ({ ...row, id: String(row.id), frontImage: row.front_image ?? row.frontImage, backImage: row.back_image ?? row.backImage, extraImages: row.extra_images ?? row.extraImages ?? [] })));
    }).catch(() => { if (active) setLimitedEditions([]); });
    fetch(apiUrl('/api/homepage-curation'))
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load the homepage picks.');
        return response.json();
      })
      .then((result: { shops?: any[]; designs?: any[] }) => {
        if (!active) return;
        setFeaturedShops((Array.isArray(result.shops) ? result.shops : [])
          .map((shop) => ({ ...shop, id: String(shop.id), slug: toShopSlug(shop.slug) || toShopSlug(shop.name), image: shop.image || null }))
          .filter((shop) => shop.slug && shop.slug !== 'null'));
        setCuratedDesigns((Array.isArray(result.designs) ? result.designs : []).map((design) => ({
          ...design, id: String(design.id), price: Number(design.price) || 0,
          pick: design.pick === 'EDITOR’S PICK' ? 'EDITOR’S PICK' : 'FEATURED',
        })));
      })
      .catch(() => {
        if (active) { setFeaturedShops([]); setCuratedDesigns([]); }
      })
      .finally(() => { if (active) setIsCuratedLoading(false); });
    return () => { active = false; };
  }, []);

  useSeo({ title: CROWNSTROKE_BASE.title, description: CROWNSTROKE_BASE.description, canonicalUrl: `${CROWNSTROKE_BASE.url}/`, ogImage: CROWNSTROKE_BASE.ogImage, robots: 'index,follow' });

  return (
    <Layout>
      <div className="home-page">
        <section className="home-hero">
          <div className="home-shell home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker"><span className="home-kicker-dot" /> CUSTOM PRINTS, MADE PERSONAL</p>
              <h1>Make it<br /><span>your own.</span></h1>
              <p className="home-lede">Find original pieces in independent designer shops, or create a one-off of your own.</p>
              <div className="home-actions">
                <Link to="/designer" className="home-button home-button-blue">Design a product <ArrowRight size={17} /></Link>
                <Link to="/shop" className="home-button home-button-quiet">Explore artist designs <ArrowUpRight size={17} /></Link>
              </div>
              <div className="home-note"><span>Choose a product. Add your design. We print it for you.</span></div>
            </div>

            <HomeHeroProductMockup />
          </div>
          <Link className="home-scroll-cue" to="/ways-to-make"><span>EXPLORE WAYS TO MAKE</span><ArrowUpRight size={14} /></Link>
        </section>

        <section className="home-curated-section">
          <div className="home-shell">
            <div className="home-curated-heading">
              <div><p className="home-kicker"><Star size={14} /> THE CROWNSTROKE EDIT</p><h2>Made to be<br /><em>seen.</em></h2><p>Original designs picked by our editors and featured by the Crownstroke team.</p></div>
              <Link to="/shop" className="home-curated-all">Explore the collection <ArrowRight size={17} /></Link>
            </div>
            {curatedDesigns.length ? <div className="home-curated-grid">{curatedDesigns.map((design, index) => <Link className="home-curated-card" to={`/shop?design=${encodeURIComponent(design.id)}`} key={design.id}>
              <div className={`home-curated-art home-curated-art-${index + 1}`}><img src={design.preview} alt={`${design.name}, created by ${design.designer}`} loading="lazy" decoding="async" /><span className="home-curated-badge"><Star size={11} /> {design.pick}</span><span className="home-curated-open"><ArrowUpRight size={17} /></span></div>
              <div className="home-curated-meta"><span>{design.product}</span><span>BY {design.designer}</span></div><div className="home-curated-title"><h3>{design.name}</h3><strong>KES {design.price.toLocaleString()}</strong></div>
            </Link>)}</div> : <div className="home-curated-empty" aria-live="polite">{isCuratedLoading ? 'Curating the latest picks…' : 'Our next featured designs are on their way.'}</div>}
          </div>
        </section>

        <section className="home-designers-section">
          <div className="home-shell home-designers-layout">
            <div className="home-designers-copy"><p className="home-kicker home-kicker-light">THE ARTIST MARKETPLACE</p><h2>Original art.<br /><span>Made by people.</span></h2><p>Independent artists open their own shops for you to discover and wear. Find your next favourite, or join the community and share your work.</p><div className="home-designer-actions"><Link to="/shop" className="home-button home-button-paper">Browse artist shops <ArrowRight size={17} /></Link><Link to="/designer-signup" className="home-light-link">Upload your artwork <ArrowUpRight size={16} /></Link></div></div>
            <div className="home-featured-designs home-featured-shops"><div className="home-board-top"><span>FEATURED DESIGNERS</span><span>SHOP ORIGINAL WORK</span></div><div className="home-featured-rail">{featuredShops.map((shop, index) => <Link to={'/shop/' + shop.slug} key={shop.id} className="home-featured-card home-shop-card"><div className={`home-shop-image home-shop-image-${index + 1}`}>{shop.image ? <img src={shop.image} alt={`${shop.name} shop by ${shop.designer}`} loading="lazy" decoding="async" /> : <span aria-hidden="true">{shop.name.trim().slice(0, 1).toUpperCase() || '✳'}</span>}<span className="home-featured-mark">✳</span></div><h3>{shop.name}</h3><p>By <b>{shop.designer}</b></p><span className="home-shop-visit">Visit shop <ArrowUpRight size={13} /></span></Link>)}</div><Link to="/shop" className="home-featured-all">View all shops <ArrowRight size={16} /></Link></div>
          </div>
        </section>

        <section className="home-products-section">
          <div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">MADE FOR YOUR IDEAS</p><h2>Choose your product.</h2><p className="home-canvas-description">Start with a blank and make it yours.</p></div><Link to="/designer" className="home-text-link">See every product <ArrowRight size={17} /></Link></div>
            <div className="home-product-grid">{products.map((product, index) => <Link key={product.query} to={`/designer?product=${product.query}`} className={`home-product-card home-product-card-${index + 1}`}><div className="home-product-image"><img src={product.image} alt={`${product.name} ready to customise`} loading="lazy" decoding="async" /><span className="home-product-arrow"><ArrowUpRight size={17} /></span></div><div className="home-product-info"><div><h3>{product.name}</h3><p>{product.detail}</p></div><span>0{index + 1}</span></div></Link>)}</div>
          </div>
        </section>

        {limitedEditions.length > 0 && <section className="home-limited-section"><div className="home-shell"><div className="home-section-head"><div><p className="home-kicker"><Sparkles size={14} /> SMALL RUN. BIG CHARACTER.</p><h2>Limited editions.</h2><p className="home-canvas-description">Special releases, made to stand out and made in limited numbers.</p></div><Link to="/shop" className="home-text-link">Shop all editions <ArrowRight size={17} /></Link></div><div className="home-limited-grid">{limitedEditions.map((item, index) => <Link className="home-limited-card" to={`/product/${encodeURIComponent(item.id)}`} key={item.id}><div className="home-limited-art"><img src={item.frontImage} alt={`${item.name}, front view`} loading="lazy" /><span className="home-limited-edition">LIMITED EDITION · 0{index + 1}</span><span className="home-limited-back"><img src={item.backImage} alt={`${item.name}, back view`} loading="lazy" /></span></div><div className="home-limited-info"><div><h3>{item.name}</h3><p>{item.description || 'A Crownstroke limited edition collectible.'}</p></div><strong>KES {Number(item.price).toLocaleString()}</strong></div></Link>)}</div></div></section>}

        <section className="home-promise-section"><div className="home-shell home-promise-grid"><div><p className="home-kicker">MADE WITH CARE</p><h2>Good ideas,<br /><em>beautifully printed.</em></h2></div><p className="home-promise-intro">A simple way to make your own products and find art made by independent designers.</p><div className="home-promise-item"><span><WandSparkles size={19} /></span><div><b>Personal by design</b><p>Your artwork and words, on products you’ll reach for.</p></div></div><div className="home-promise-item"><span><PackageCheck size={19} /></span><div><b>Printed to order</b><p>We make each piece after you place your order.</p></div></div><div className="home-promise-item"><span><Palette size={19} /></span><div><b>Independent artists</b><p>Discover original work from the people who made it.</p></div></div><div className="home-promise-item"><span><Upload size={19} /></span><div><b>Your art belongs here</b><p>Upload a design and share it with the community.</p></div></div></div></section>

        <section className="home-final-cta"><div className="home-shell home-final-inner"><div><p className="home-kicker home-kicker-light">EVERY GREAT THING STARTS SOMEWHERE</p><h2>What will you<br /><em>make yours?</em></h2></div><div><p>A fresh idea, a favourite artist, or just a tee that feels more like you. Find your starting point.</p><div className="home-actions"><Link to="/designer" className="home-button home-button-paper">Start designing <ArrowRight size={17} /></Link><Link to="/shop" className="home-light-link">Browse the shop <ArrowUpRight size={16} /></Link></div></div><Sparkles className="home-cta-spark" size={32} /></div></section>
      </div>
    </Layout>
  );
};

export default Home;


