import React from 'react';
import { ArrowRight, ArrowUpRight, Mail, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = [
  {
    title: 'Make it yours',
    links: [
      { name: 'Custom T-Shirts', path: '/designer?product=t-shirt' },
      { name: 'Long Sleeve Tees', path: '/designer?product=long-sleeve-tee' },
      { name: 'Tank Tops', path: '/designer?product=tank-top' },
      { name: 'Hoodies', path: '/designer?product=hoodie' },
      { name: 'Mugs & Drinkware', path: '/designer?product=mug' },
    ],
  },
  {
    title: 'Help & info',
    links: [
      { name: 'Pricing & Fees', path: '/pricing' },
      { name: 'Shipping Info', path: '/shipping' },
      { name: 'Return Policy', path: '/returns' },
      { name: 'Help Center', path: '/help' },
      { name: 'API for Developers', path: '/api' },
    ],
  },
  {
    title: 'Crownstroke',
    links: [
      { name: 'About Us', path: '/about' },
      { name: 'Sustainability', path: '/eco' },
      { name: 'Affiliate Program', path: '/affiliates' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
    ],
  },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer relative isolate overflow-hidden border-t border-white/20 bg-transparent text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(132,204,22,.08),transparent_36%),linear-gradient(180deg,rgba(7,12,20,.2),rgba(5,8,14,.38))]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-10 -z-10 h-72 w-72 rounded-full border border-white/[.04]" />

      <div className="mx-auto max-w-7xl px-5 pb-7 pt-14 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,.9fr)_1.6fr] lg:gap-20">
          <section className="max-w-md">
            <Link to="/" aria-label="Crownstroke home" className="group inline-flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300">
              <span className="grid h-12 w-12 place-items-center border border-lime-300/25 bg-lime-300/[.08] text-lime-200 transition-colors group-hover:bg-lime-300/[.14]">
                <img src="https://i.imgur.com/1PBylbz.png" alt="" className="h-8 w-8 object-contain brightness-0 invert" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-black leading-none tracking-[-.07em]">CROWN<span className="ml-1 text-lime-300">STROKE</span></span>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-[.28em] text-white/45">Made for your ideas</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/85">
              Turn your ideas into pieces worth keeping. Create a design, make it yours, and bring it into the world.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/designer" className="inline-flex min-h-11 items-center gap-2 bg-lime-300 px-4 text-xs font-extrabold text-slate-950 transition hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
                <Palette className="h-4 w-4" /> Start designing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/shop" className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 text-xs font-bold text-white/80 transition hover:border-white/35 hover:bg-white/[.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-lime-300">
                Browse the shop <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h2 className="mb-5 text-[10px] font-extrabold uppercase tracking-[.2em] text-lime-200">{section.title}</h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.path} className="inline-flex text-[13px] leading-5 text-white/80 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <section aria-labelledby="footer-newsletter-title" className="mt-14 grid gap-6 border-y border-white/10 py-7 sm:mt-16 sm:grid-cols-[1fr_auto] sm:items-center sm:py-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center border border-white/10 bg-white/[.04] text-lime-200"><Mail className="h-4 w-4" /></span>
            <div>
              <h2 id="footer-newsletter-title" className="text-sm font-bold text-white">Studio notes, coming soon</h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/80">We’re preparing occasional updates on new products and creative ideas. Newsletter signup will be available here soon.</p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-white/50" aria-label="Newsletter signup status: coming soon">
            <Mail className="h-3.5 w-3.5 text-white/45" /> Signup coming soon
          </span>
        </section>

        <div className="flex flex-col gap-5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/75">© {currentYear} Crownstroke Studio</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[.12em] text-white/75">
            <Link to="/privacy" className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">Privacy</Link>
            <Link to="/terms" className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">Terms</Link>
            <Link to="/cookies" className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300">Cookies</Link>
          </nav>
          <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-white/75">
            Made for your ideas
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
