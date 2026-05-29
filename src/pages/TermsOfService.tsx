import React from 'react';
import Layout from '../components/layout/Layout';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Terms of Service
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
                <p>
                  Welcome to Crownstroke. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Registration</h2>
                <p>
                  To use certain features of our platform, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Customization and Orders</h2>
                <p>
                  You may customize products using our design tools. By placing an order, you agree to pay the specified price, including shipping and handling fees. We reserve the right to refuse any order at our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
                <p>
                  All content on our website, including designs, logos, and images, are the property of Crownstroke or its licensors. You retain ownership of the designs you create using our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Payment Terms</h2>
                <p>
                  We accept various forms of payment. Payment is due at the time of order placement. We may use third-party payment processors to handle transactions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping and Delivery</h2>
                <p>
                  We will ship your order to the address you provided. Delivery times may vary depending on your location. You are responsible for providing accurate shipping information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Returns and Refunds</h2>
                <p>
                  Please refer to our Return Policy for information on returns and refunds. We reserve the right to determine eligibility for returns and refunds on a case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
                <p>
                  Crownstroke shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
                <p>
                  We may update these Terms of Service from time to time. We will notify you of any changes by posting the new terms on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at support@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
