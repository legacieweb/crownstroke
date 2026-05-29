import React from 'react';
import Layout from '../components/layout/Layout';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Privacy Policy
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
                <p>
                  At Crownstroke, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website or services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Contact information (name, email address, phone number, address)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (credit/debit card details, billing address)</li>
                  <li>Design preferences and customization details</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Process your orders and payments</li>
                  <li>Deliver products and services</li>
                  <li>Communicate with you about your orders and account</li>
                  <li>Improve our website and services</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Information Sharing</h2>
                <p>
                  We may share your information with third-party service providers who help us operate our business, such as payment processors, shipping companies, and marketing partners. We do not sell your personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
