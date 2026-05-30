import React from 'react';
import Layout from '../components/layout/Layout';

const API: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
              API for Developers
            </h1>
            
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to Our API Documentation</h2>
                <p>
                  Our API allows developers to integrate Crownstroke's custom design platform into their own applications. With our API, you can create custom products, manage orders, and more.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
                <p>To start using our API, you'll need to:</p>
                <ol className="mt-4 space-y-2 list-decimal list-inside">
                  <li>Sign up for a developer account</li>
                  <li>Create an API key</li>
                  <li>Read our documentation</li>
                  <li>Start making API calls</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">API Endpoints</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Products</h3>
                    <p>Get information about available products and customization options.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Designs</h3>
                    <p>Create, edit, and manage custom designs.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Orders</h3>
                    <p>Place orders and track their status.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Users</h3>
                    <p>Manage user accounts and preferences.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                <p>
                  Our API uses API keys for authentication. You must include your API key in the Authorization header of every request.
                </p>
                <div className="mt-4 bg-white/5 p-4 rounded-lg overflow-x-auto border border-white/10">
                  <code className="text-sm text-primary-400">Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Rate Limits</h2>
                <p>
                  Our API has rate limits to ensure fair usage. The default rate limit is 100 requests per minute. If you need to increase your rate limit, please contact us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Response Format</h2>
                <p>
                  All API responses are in JSON format. Error responses include an error message and error code.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Documentation</h2>
                <p>
                  For detailed documentation, including endpoint descriptions, parameters, and examples, please visit our API documentation page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Support</h2>
                <p>
                  If you have any questions or need help with our API, please contact us at api@crownstroke.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default API;
