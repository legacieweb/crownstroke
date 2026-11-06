import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, Mail, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../services/apiUrl';

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

const Footer: React.FC<{ showNewsletterSignup?: boolean }> = ({ showNewsletterSignup = true }) => {
  const currentYear = new Date().getFullYear();
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNewsletterStatus('');
    const form = event.currentTarget;
    const fields = new FormData(form);
    try {
      const response = await fetch(apiUrl('/api/newsletter-signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(fields.get('name') || ''),
          email: String(fields.get('email') || ''),
          website: String(fields.get('website') || ''),
        }),
      });
      const text = await response.text();
      let result: { message?: string; error?: string } = {};
      try { result = text ? JSON.parse(text) : {}; } catch { /* Keep proxy/server errors readable. */ }
      if (!response.ok) throw new Error(result.error || 'We could not sign you up just now. Please try again.');
      setNewsletterStatus(result.message || 'You’re subscribed. Check your inbox for a confirmation.');
      form.reset();
    } catch (error) {
      setNewsletterStatus(error instanceof Error ? error.message : 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="site-footer relative isolate overflow-hidden border-t border-white/10 bg-transparent text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-10 -z-10 h-72 w-72 rounded-full border border-white/[.04]" />

      <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-8 sm:pb-8 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="grid gap-9 lg:grid-cols-[minmax(260px,.9fr)_1.6fr] lg:gap-16">
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

        {showNewsletterSignup && <section aria-labelledby="footer-newsletter-title" className="mt-10 grid gap-5 border-y border-white/10 py-6 sm:mt-12 sm:py-7 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center border border-white/10 bg-white/[.04] text-lime-200"><Mail className="h-4 w-4" /></span>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-lime-200">A note from the studio</p>
              <h2 id="footer-newsletter-title" className="mt-1 text-lg font-black tracking-tight text-white">Studio notes</h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-white/65">Occasional updates on new products, creative ideas, and independent work worth discovering.</p>
            </div>
          </div>
          <form onSubmit={handleNewsletterSignup} className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <label className="sr-only" htmlFor="footer-newsletter-name">Name (optional)</label>
            <input id="footer-newsletter-name" name="name" maxLength={100} autoComplete="name" placeholder="Your name (optional)" className="h-11 min-w-0 border border-white/15 bg-white/[.04] px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-lime-200/50" />
            <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
            <input id="footer-newsletter-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email address" className="h-11 min-w-0 border border-white/15 bg-white/[.04] px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-lime-200/50" />
            <button type="submit" disabled={isSubmitting} className="inline-flex h-11 items-center justify-center gap-2 bg-lime-300 px-4 text-xs font-extrabold text-slate-950 transition hover:bg-lime-200 disabled:cursor-wait disabled:opacity-60 sm:col-span-2 lg:col-span-1">
              {isSubmitting ? 'Joining…' : 'Sign me up'} <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <label aria-hidden="true" className="hidden">Leave this field empty<input tabIndex={-1} name="website" autoComplete="off" /></label>
            {newsletterStatus && <p role="status" className={`text-xs leading-5 sm:col-span-2 lg:col-span-3 ${newsletterStatus.toLowerCase().includes('could not') || newsletterStatus.toLowerCase().includes('failed') || newsletterStatus.toLowerCase().includes('enter a valid') ? 'text-rose-200' : 'text-emerald-200'}`}>{newsletterStatus}</p>}
          </form>
        </section>}

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
