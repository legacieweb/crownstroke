import React from 'react';
import Layout from '../components/layout/Layout';

const Returns: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Return Policy
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Returns and Refunds</h2>
                <p>
                  We want you to be completely satisfied with your purchase. If you're not happy with your order, we offer a hassle-free return policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Return Period</h2>
                <p>
                  You have 30 days from the date of delivery to initiate a return. Returns must be in their original condition and packaging.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Return Process</h2>
                <p>To initiate a return, please follow these steps:</p>
                <ol className="mt-4 space-y-2 list-decimal list-inside">
                  <li>Contact us at returns@crownstroke.com to request a return authorization.</li>
                  <li>Pack your items securely in the original packaging.</li>
                  <li>Include the return authorization number in the package.</li>
                  <li>Ship the package to the address provided.</li>
                  <li>Once we receive your return, we will process your refund.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Refund Policy</h2>
                <p>
                  Refunds will be issued to the original payment method. Please allow 7-10 business days for the refund to appear on your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Exceptions</h2>
                <p>
                  Custom-designed products are not eligible for returns unless there is a manufacturing defect or error in the order. If you receive a damaged or incorrect product, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Return Shipping</h2>
                <p>
                  You are responsible for the cost of return shipping unless the item is defective or there was an error in the order.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about returns or refunds, please contact us at returns@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
