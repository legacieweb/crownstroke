import React from 'react';
import Layout from '../components/layout/Layout';

const AffiliateProgram: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Affiliate Program
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Our Affiliate Program</h2>
                <p>
                  Join the Crownstroke Affiliate Program and earn commission by promoting our products. Share your passion for custom design with your audience and earn money for every sale you generate.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How It Works</h2>
                <p>It's simple to get started:</p>
                <ol className="mt-4 space-y-2 list-decimal list-inside">
                  <li>Sign up for our affiliate program</li>
                  <li>Get your unique affiliate link</li>
                  <li>Share the link with your audience</li>
                  <li>Earn commission on every sale</li>
                  <li>Track your progress in real-time</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Commission Structure</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Commission Rate</h3>
                    <p>Earn 10% commission on every sale you generate.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Cookie Duration</h3>
                    <p>30-day cookie duration means you get credit for sales made within 30 days of a visitor clicking your link.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Payouts</h3>
                    <p>Payouts are made monthly once you reach the KES 10,000 minimum threshold.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Benefits of Joining</h2>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>High commission rates</li>
                  <li>30-day cookie duration</li>
                  <li>Real-time tracking</li>
                  <li>Monthly payouts</li>
                  <li>Dedicated affiliate support</li>
                  <li>Promotional materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
                <p>To join our affiliate program, you must:</p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Have a valid website or social media presence</li>
                  <li>Comply with our terms and conditions</li>
                  <li>Promote our products in an ethical and responsible manner</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign Up</h2>
                <p>
                  Ready to join our affiliate program? Fill out our application form and we'll review it within 24-48 hours.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our affiliate program, please contact us at affiliates@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AffiliateProgram;
