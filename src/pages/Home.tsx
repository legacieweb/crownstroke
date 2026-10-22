import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Brush, PackageCheck, Palette, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomeHeroProductMockup from '../components/home/HomeHeroProductMockup';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';
import { PRODUCT_DATA } from '../data/seed';
import { db } from '../db';
import { designerDesigns, designers, shops } from '../db/schema';
import { eq } from 'drizzle-orm';

const products = [
  { name: 'T-shirts', detail: 'Your next favourite tee', image: PRODUCT_DATA['t-shirt']['#ffffff'].front, query: 't-shirt' },
  { name: 'Hoodies', detail: 'Made for the everyday', image: PRODUCT_DATA.hoodie['#000000'].front, query: 'hoodie' },
  { name: 'Mugs', detail: 'A little more personal', image: PRODUCT_DATA.mug['#ffffff'].front, query: 'mug' },
  { name: 'Art prints', detail: 'Bring it off the screen', image: PRODUCT_DATA.poster['#ffffff'].front, query: 'poster' },
];

type FeaturedDesign = { id: string; name: string; designer: string; preview: string; shopSlug: string; productId: string };

const toShopSlug = (value: unknown): string =>
  typeof value === 'string' && value.trim() && value.trim().toLowerCase() !== 'null'
    ? value.trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : '';

const Home: React.FC = () => {
  const [featuredDesigns, setFeaturedDesigns] = useState<FeaturedDesign[]>([]);

  useEffect(() => {
    let active = true;
    db.select({
      id: designerDesigns.id,
      name: designerDesigns.name,
      preview: designerDesigns.preview,
      productId: designerDesigns.productId,
      designer: designers.name,
      shopSlug: shops.slug,
      shopName: shops.name,
    })
      .from(designerDesigns)
      .innerJoin(designers, eq(designerDesigns.designerId, designers.id))
      .innerJoin(shops, eq(designerDesigns.shopId, shops.id))
      .limit(3)
      .then((designs) => {
        if (!active) return;
        const validDesigns = designs
          .map((design) => ({ ...design, shopSlug: toShopSlug(design.shopSlug) || toShopSlug(design.shopName) }))
          .filter((design) => design.shopSlug && design.shopSlug !== 'null');
        setFeaturedDesigns(validDesigns);
      })
      .catch(() => {
        if (active) setFeaturedDesigns([]);
      });
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
          <a className="home-scroll-cue" href="#ways-to-make"><span>TAKE A LOOK AROUND</span><ArrowDown size={14} /></a>
        </section>

        <section className="home-product-strip" id="ways-to-make" aria-label="Products you can customise">
          <div className="home-shell home-strip-inner"><p>PUT YOUR IDEA ON</p>{products.map((product) => <Link key={product.query} to={`/designer?product=${product.query}`} className="home-strip-item"><span>{product.name}</span><ArrowUpRight size={14} /></Link>)}</div>
        </section>

        <section className="home-custom-section">
          <div className="home-shell home-custom-grid">
            <div className="home-editorial-art">
              <div className="home-editorial-label">THE CROWNSTROKE STUDIO <span>✳</span> OPEN CANVAS</div>
              <img src={PRODUCT_DATA['t-shirt']['#000000'].front} alt="Black T-shirt product mockup in the custom design studio" loading="lazy" decoding="async" />
              <div className="home-art-note"><Brush size={16} /><span>YOUR ART, YOUR CALL</span></div>
              <div className="home-art-number">01 / 03</div>
            </div>
            <div className="home-editorial-copy">
              <p className="home-kicker">DESIGN YOUR OWN</p>
              <h2>From blank<br />to <em>one of one.</em></h2>
              <p>Choose a product, upload your artwork or add text, then arrange your design in the studio preview.</p>
              <ol className="home-steps"><li><span>01</span><div><b>Choose a product</b><small>Start with a T-shirt, hoodie, mug or print.</small></div></li><li><span>02</span><div><b>Add your design</b><small>Upload artwork or make something with text.</small></div></li><li><span>03</span><div><b>Place your order</b><small>We print your design and deliver it to you.</small></div></li></ol>
              <Link to="/designer" className="home-text-link">Start designing <ArrowRight size={17} /></Link>
            </div>
          </div>
        </section>

        <section className="home-designers-section">
          <div className="home-shell home-designers-layout">
            <div className="home-designers-copy"><p className="home-kicker home-kicker-light">THE ARTIST MARKETPLACE</p><h2>Original art.<br /><span>Made by people.</span></h2><p>Independent artists upload their designs for you to discover and wear. Find your next favourite, or join the community and share your work.</p><div className="home-designer-actions"><Link to="/shop" className="home-button home-button-paper">Browse artist designs <ArrowRight size={17} /></Link><Link to="/designer-signup" className="home-light-link">Upload your artwork <ArrowUpRight size={16} /></Link></div></div>
            <div className="home-featured-designs"><div className="home-board-top"><span>FEATURED DESIGNERS</span><span>SHOP ORIGINAL WORK</span></div><div className="home-featured-rail">{featuredDesigns.map((design, index) => <Link to={'/shop/' + design.shopSlug} key={design.id} className="home-featured-card"><div className={`home-featured-image home-featured-image-${index + 1}`}><img src={design.preview} alt={`${design.name}, by designer ${design.designer}`} loading="lazy" decoding="async" /><span className="home-featured-mark">✳</span></div><h3>{design.name}</h3><p>By <b>{design.designer}</b></p></Link>)}</div><Link to="/shop" className="home-featured-all">View all designs <ArrowRight size={16} /></Link></div>
          </div>
        </section>

        <section className="home-products-section">
          <div className="home-shell"><div className="home-section-head"><div><p className="home-kicker">MADE FOR YOUR IDEAS</p><h2>Choose your product.</h2><p className="home-canvas-description">Start with a blank and make it yours.</p></div><Link to="/designer" className="home-text-link">See every product <ArrowRight size={17} /></Link></div>
            <div className="home-product-grid">{products.map((product, index) => <Link key={product.query} to={`/designer?product=${product.query}`} className={`home-product-card home-product-card-${index + 1}`}><div className="home-product-image"><img src={product.image} alt={`${product.name} ready to customise`} loading="lazy" decoding="async" /><span className="home-product-arrow"><ArrowUpRight size={17} /></span></div><div className="home-product-info"><div><h3>{product.name}</h3><p>{product.detail}</p></div><span>0{index + 1}</span></div></Link>)}</div>
          </div>
        </section>

        <section className="home-promise-section"><div className="home-shell home-promise-grid"><div><p className="home-kicker">MADE WITH CARE</p><h2>Good ideas,<br /><em>beautifully printed.</em></h2></div><p className="home-promise-intro">A simple way to make your own products and find art made by independent designers.</p><div className="home-promise-item"><span><WandSparkles size={19} /></span><div><b>Personal by design</b><p>Your artwork and words, on products you’ll reach for.</p></div></div><div className="home-promise-item"><span><PackageCheck size={19} /></span><div><b>Printed to order</b><p>We make each piece after you place your order.</p></div></div><div className="home-promise-item"><span><Palette size={19} /></span><div><b>Independent artists</b><p>Discover original work from the people who made it.</p></div></div><div className="home-promise-item"><span><Upload size={19} /></span><div><b>Your art belongs here</b><p>Upload a design and share it with the community.</p></div></div></div></section>

        <section className="home-final-cta"><div className="home-shell home-final-inner"><div><p className="home-kicker home-kicker-light">EVERY GREAT THING STARTS SOMEWHERE</p><h2>What will you<br /><em>make yours?</em></h2></div><div><p>A fresh idea, a favourite artist, or just a tee that feels more like you. Find your starting point.</p><div className="home-actions"><Link to="/designer" className="home-button home-button-paper">Start designing <ArrowRight size={17} /></Link><Link to="/shop" className="home-light-link">Browse the shop <ArrowUpRight size={16} /></Link></div></div><Sparkles className="home-cta-spark" size={32} /></div></section>
      </div>
    </Layout>
  );
};

export default Home;


