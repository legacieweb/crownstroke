import React from 'react';
import { ArrowRight, ArrowUpRight, Brush, ShoppingBag, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { PRODUCT_DATA } from '../data/seed';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

const products = [
  { id: 't-shirt', name: 'T-shirts', note: 'An everyday favourite', image: PRODUCT_DATA['t-shirt']['#ffffff'].front },
  { id: 'hoodie', name: 'Hoodies', note: 'Make a little more room for your art', image: PRODUCT_DATA.hoodie['#000000'].front },
  { id: 'mug', name: 'Mugs', note: 'A small canvas for a big idea', image: PRODUCT_DATA.mug['#ffffff'].front },
  { id: 'poster', name: 'Art prints', note: 'Give your walls something to say', image: PRODUCT_DATA.poster['#ffffff'].front },
];

const WaysToMake: React.FC = () => {
  useSeo({
    title: 'Ways to Make | Crownstroke',
    description: 'Choose a blank product to customize, create a one-off design, or discover work from independent artists.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/ways-to-make`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow',
  });

  return (
    <Layout>
      <main className="min-h-screen bg-transparent px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 px-6 py-12 shadow-2xl backdrop-blur sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:px-20">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-400/15 blur-3xl" />
            <p className="relative text-[10px] font-black uppercase tracking-[.28em] text-primary-200">Ways to make</p>
            <h1 className="relative mt-4 max-w-3xl text-4xl font-black leading-[.98] tracking-tight text-white sm:text-6xl lg:text-7xl">Start with an idea.<br /><span className="text-primary-200">Make it yours.</span></h1>
            <p className="relative mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">Create something personal from a blank product, or find an original made by an independent designer.</p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link to="/designer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-300 px-5 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-primary-200">Open the design studio <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10">Browse artist designs <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          </section>

          <section className="mt-14 sm:mt-20" aria-labelledby="choose-product-title">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[.24em] text-primary-200">Choose a starting point</p><h2 id="choose-product-title" className="mt-2 text-3xl font-black text-white sm:text-4xl">Pick your canvas.</h2></div>
              <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/65 transition hover:text-white">All products <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((product, index) => (
                <Link key={product.id} to={`/designer?product=${product.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/45 transition hover:-translate-y-1 hover:border-primary-200/50 hover:bg-slate-950/70">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5"><img src={product.image} alt={`${product.name} blank product`} loading="lazy" decoding="async" className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/75 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/75">0{index + 1}</span></div>
                  <div className="p-4 sm:p-5"><h3 className="text-base font-black text-white sm:text-lg">{product.name}</h3><p className="mt-1 min-h-10 text-xs leading-5 text-white/50">{product.note}</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-200">Customize <ArrowUpRight className="h-4 w-4" /></span></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-4 sm:mt-20 md:grid-cols-3">
            {[
              { icon: Brush, title: 'Make it personal', text: 'Add your artwork, type, and colour in the studio.', to: '/designer', action: 'Start designing' },
              { icon: ShoppingBag, title: 'Find your artist', text: 'Shop original designs and meet the people behind them.', to: '/shop', action: 'Explore the marketplace' },
              { icon: WandSparkles, title: 'Bring it to life', text: 'Choose your product and we make it to order.', to: '/pricing', action: 'See how it works' },
            ].map(({ icon: Icon, title, text, to, action }) => (
              <Link key={title} to={to} className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-white/20 hover:bg-white/[.06] sm:p-7">
                <Icon className="h-5 w-5 text-primary-200" /><h3 className="mt-5 text-lg font-black text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/75">{action}<ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </Layout>
  );
};

export default WaysToMake;
