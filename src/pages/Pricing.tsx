import React from 'react';
import Layout from '../components/layout/Layout';
import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

const Pricing: React.FC = () => {
  useSeo({
    title: 'Pricing & Fees | Crownstroke',
    description:
      'Transparent pricing for custom designs, ready-made drops, and customization services on Crownstroke.',
    canonicalUrl: `${CROWNSTROKE_BASE.url}/pricing`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  return (
    <Layout>
      <div className="min-h-screen py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
              Pricing & Fees
            </h1>
            
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Product Pricing</h2>
                <p>
                  Our pricing varies depending on the product type, size, and customization options. Here's an overview of our base prices:
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Custom T-Shirts</h3>
                    <p>Starting at KES 1,500</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Hoodies</h3>
                    <p>Starting at KES 3,500</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Mugs & Drinkware</h3>
                    <p>Starting at KES 1,200</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Caps & Hats</h3>
                    <p>Starting at KES 1,500</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Posters & Prints</h3>
                    <p>Starting at KES 1,800</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Customization Fees</h2>
                <p>
                  We offer a variety of customization options, each with its own fee:
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Single Color Print</h3>
                    <p>KES 500 per product</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Full Color Print</h3>
                    <p>KES 1,000 per product</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Custom Design Service</h3>
                    <p>KES 2,500 per design</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Shipping Fees</h2>
                <p>
                  Shipping fees are calculated based on your location and the size of your order. We offer the following shipping options:
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Standard Shipping</h3>
                    <p>KES 500 - 7-10 business days</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Expedited Shipping</h3>
                    <p>KES 1,200 - 3-5 business days</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Express Shipping</h3>
                    <p>KES 2,000 - 1-2 business days</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Discounts</h2>
                <p>
                  We offer discounts for bulk orders and special promotions. Here's what you need to know:
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Bulk Order Discounts</h3>
                    <p>10-20 items: 5% off</p>
                    <p>21-50 items: 10% off</p>
                    <p>51-100 items: 15% off</p>
                    <p>100+ items: 20% off</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Promotional Codes</h3>
                    <p>Check our website and social media for special promotional codes.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Taxes</h2>
                <p>
                  Sales tax will be calculated based on your shipping address and applicable tax laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Payment Methods</h2>
                <p>
                  We accept the following payment methods:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>Discover</li>
                  <li>PayPal</li>
                  <li>Apple Pay</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Refund Policy</h2>
                <p>
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
