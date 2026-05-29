import React from 'react';
import Layout from '../components/layout/Layout';

const Cookies: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Cookie Policy
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Cookies</h2>
                <p>We use cookies to:</p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Keep you signed in</li>
                  <li>Remember your preferences</li>
                  <li>Improve our website</li>
                  <li>Analyze website traffic</li>
                  <li>Deliver targeted advertisements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Essential Cookies</h3>
                    <p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Analytics Cookies</h3>
                    <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Marketing Cookies</h3>
                    <p>These cookies are used to track visitors across websites. They are used to display ads that are relevant and engaging for the individual user.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Managing Cookies</h2>
                <p>
                  You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Cookie Policy, please contact us at privacy@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cookies;
