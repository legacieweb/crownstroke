import React from 'react';
import Layout from '../components/layout/Layout';

const HelpCenter: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Help Center
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Our Help Center</h2>
                <p>
                  Here you'll find answers to frequently asked questions about our products, services, and policies. If you can't find what you're looking for, please don't hesitate to contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Management</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">How do I create an account?</h3>
                    <p>You can create an account by clicking on the "Sign Up" button in the top right corner of our website.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">How do I reset my password?</h3>
                    <p>Click on "Forgot Password" on the login page and follow the instructions to reset your password.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">How do I update my account information?</h3>
                    <p>Log in to your account and navigate to the "Account Settings" page to update your information.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Ordering</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">How do I place an order?</h3>
                    <p>Select a product, customize it using our designer tool, and follow the checkout process.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">How do I track my order?</h3>
                    <p>Once your order has been shipped, you will receive a confirmation email with tracking information.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Can I cancel or modify my order?</h3>
                    <p>Orders can be canceled or modified within 24 hours of placement. Please contact us at support@crownstroke.com.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Customization</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">How do I customize a product?</h3>
                    <p>Select a product and click on the "Customize" button to access our designer tool.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">What file formats are supported?</h3>
                    <p>We support JPG, PNG, and SVG file formats.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">What is the maximum file size?</h3>
                    <p>The maximum file size for uploaded images is 10MB.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping and Returns</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">How long does shipping take?</h3>
                    <p>Shipping times vary depending on your location and the shipping method selected.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">What is your return policy?</h3>
                    <p>You have 30 days from the date of delivery to initiate a return. Please refer to our Return Policy for more information.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">How do I return an item?</h3>
                    <p>Contact us at returns@crownstroke.com to request a return authorization.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you can't find the answer to your question in our Help Center, please contact us at support@crownstroke.com. We're here to help!
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpCenter;
