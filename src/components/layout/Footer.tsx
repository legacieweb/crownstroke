import React from 'react';
import { Palette, Github, Twitter, Instagram, Mail, ArrowRight, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { name: 'Custom T-Shirts', path: '/designer?product=t-shirt' },
        { name: 'Long Sleeve Tees', path: '/designer?product=long-sleeve-tee' },
        { name: 'Tank Tops', path: '/designer?product=tank-top' },
        { name: 'Hoodies', path: '/designer?product=hoodie' },
        { name: 'Mugs & Drinkware', path: '/designer?product=mug' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Pricing & Fees', path: '/pricing' },
        { name: 'Shipping Info', path: '/shipping' },
        { name: 'Return Policy', path: '/returns' },
        { name: 'Help Center', path: '/help' },
        { name: 'API for Developers', path: '/api' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Sustainability', path: '/eco' },
        { name: 'Affiliate Program', path: '/affiliates' },
        { name: 'Careers', path: '/careers' },
        { name: 'Contact', path: '/contact' },
      ],
    },
  ];

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden bg-transparent">
      {/* Glassmorphism Top Border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand section */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-14 flex items-center">
                <img 
                  src="https://i.imgur.com/1PBylbz.png" 
                  alt="Crownstroke Logo" 
                  className="h-full w-auto object-contain brightness-0 invert" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white leading-none tracking-tighter">
                  CROWN <span className="text-primary-500 italic">STROKE</span>
                </span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mt-1">
                  EST. 2024
                </span>
              </div>
            </Link>
            <p className="text-white/60 leading-relaxed font-medium">
              Redefining custom merchandise through elite artistry and state-of-the-art technology. Your legacy, beautifully printed.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-primary-500 hover:border-primary-500/50 border border-white/10 transition-all duration-500"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-8">
              <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-white/50 hover:text-primary-400 transition-all duration-300 font-medium hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Banner - Modern Glass Look */}
        <div className="relative p-1 bg-gradient-to-r from-primary-500/30 via-white/10 to-transparent rounded-[3rem] mb-24 group">
          <div className="bg-black/40 backdrop-blur-2xl rounded-[2.9rem] p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-md text-center lg:text-left space-y-4 relative z-10">
              <h3 className="text-4xl font-black text-white tracking-tighter">JOIN THE INNER CIRCLE</h3>
              <p className="text-white/60 font-medium">Get exclusive access to limited drops, artist interviews, and 10% off your first order.</p>
            </div>

            <div className="w-full lg:w-auto relative z-10">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 group-focus-within:border-primary-500/50 transition-all">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="bg-transparent border-none focus:ring-0 text-white placeholder-white/20 w-full sm:w-80 px-6 py-4 text-sm font-bold"
                />
                <button className="bg-white text-black hover:bg-primary-500 hover:text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2">
                  SUBSCRIBE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-white/30 text-[10px] font-black tracking-[0.2em] uppercase">
              © {currentYear} CROWN STROKE STUDIO
            </p>
            <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
              <Link to="/privacy" className="hover:text-white transition-all">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-all">Terms</Link>
              <Link to="/cookies" className="hover:text-white transition-all">Cookies</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
