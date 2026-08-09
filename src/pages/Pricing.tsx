import React from 'react';
import Layout from '../components/layout/Layout';
import VideoBackground from '../components/layout/VideoBackground';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

const Pricing: React.FC = () => {
  useSeo({
    title: 'Product & Design Pricing | Crownstroke',
    description:
      'Transparent pricing for custom products, ready-made drops, and design services on Crownstroke.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/pricing`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  return (
    <Layout>
      <VideoBackground videoUrl="https://i.imgur.com/d2d8Llz.mp4" />
      <div className="min-h-screen py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
<h1 className="text-4xl md:text-5xl font-black text-white mb-8">
              Product &amp; Design Pricing
            </h1>
            
            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Product Pricing</h2>
                <p className="text-white/70">
                  Our pricing varies depending on the product type, size, and customization options. Here's an overview of our base prices:
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Custom T-Shirts</h3>
                    <p className="text-primary-400 font-black text-lg">Starting at KES 1,500</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Hoodies</h3>
                    <p className="text-primary-400 font-black text-lg">Starting at KES 3,500</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Mugs & Drinkware</h3>
                    <p className="text-primary-400 font-black text-lg">Starting at KES 1,200</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Caps & Hats</h3>
                    <p className="text-primary-400 font-black text-lg">Starting at KES 1,500</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Posters & Prints</h3>
                    <p className="text-primary-400 font-black text-lg">Starting at KES 1,800</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Design Service Fees</h2>
                <p className="text-white/70">
                  We offer professional design services with transparent pricing:
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Single Color Print</h3>
                    <p className="text-primary-400 font-black text-lg">KES 500 per product</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Full Color Print</h3>
                    <p className="text-primary-400 font-black text-lg">KES 1,000 per product</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Custom Design Service</h3>
                    <p className="text-primary-400 font-black text-lg">KES 2,500 per design</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Discounts</h2>
                <p className="text-white/70">
                  We offer discounts for bulk orders and special promotions. Here's what you need to know:
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Bulk Order Discounts</h3>
                    <div className="mt-2 space-y-1 text-white/70">
                      <p>10-20 items: <span className="text-primary-400 font-black">5% off</span></p>
                      <p>21-50 items: <span className="text-primary-400 font-black">10% off</span></p>
                      <p>51-100 items: <span className="text-primary-400 font-black">15% off</span></p>
                      <p>100+ items: <span className="text-primary-400 font-black">20% off</span></p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-white">Promotional Codes</h3>
                    <p className="text-white/70">Check our website and social media for special promotional codes.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Taxes</h2>
                <p className="text-white/70">
                  Sales tax will be calculated based on your shipping address and applicable tax laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Payment Methods</h2>
                <p className="text-white/70">
                  We accept the following payment methods:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-white/70">
                  <li>M-Pesa</li>
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Refund Policy</h2>
                <p className="text-white/70">
                  Please refer to our Return Policy for information on returns and refunds.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Pricing;
