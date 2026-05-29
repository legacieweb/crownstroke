import React from 'react';
import Layout from '../components/layout/Layout';

const Shipping: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Shipping Information
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping Options</h2>
                <p>
                  We offer various shipping options to meet your needs. All orders are processed and shipped from our fulfillment center in California.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Standard Shipping</h3>
                    <p>5-7 business days - KES 500</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Expedited Shipping</h3>
                    <p>3-5 business days - KES 1,200</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Express Shipping</h3>
                    <p>1-2 business days - KES 2,000</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Processing Time</h2>
                <p>
                  Orders are typically processed within 2-3 business days. Custom-designed products may take an additional 1-2 business days to process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">International Shipping</h2>
                <p>
                  We offer international shipping to most countries. Shipping times and fees vary depending on your location. International orders may be subject to customs duties and taxes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Tracking Your Order</h2>
                <p>
                  Once your order has been shipped, you will receive a confirmation email with tracking information. You can track your order using the tracking number provided.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping Restrictions</h2>
                <p>
                  We are unable to ship to certain countries due to legal restrictions. If you are located in a country we cannot ship to, you will be notified during the checkout process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping Address</h2>
                <p>
                  Please ensure that your shipping address is accurate and complete. We are not responsible for orders shipped to incorrect addresses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Damaged or Lost Packages</h2>
                <p>
                  If your package arrives damaged or is lost in transit, please contact us immediately. We will work with you to resolve the issue.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about shipping, please contact us at support@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;
