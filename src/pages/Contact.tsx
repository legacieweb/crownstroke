import React from 'react';
import Layout from '../components/layout/Layout';

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Contact Us
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
                <p>
                  We'd love to hear from you! Whether you have a question about our products, need help with an order, or just want to say hello, we're here for you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Email</h3>
                    <p>support@crownstroke.com</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Phone</h3>
                    <p>+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Address</h3>
                    <p>123 Design Street, Creative City, CA 90210</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Business Hours</h2>
                <p>
                  We are available to assist you during the following hours:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM (PST)</li>
                  <li>Saturday: 10:00 AM - 4:00 PM (PST)</li>
                  <li>Sunday: Closed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                <p>
                  Before reaching out, you may want to check our Help Center for answers to common questions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Send Us a Message</h2>
                <p>
                  Please use the form below to send us a message. We will respond to your inquiry as soon as possible.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Follow Us</h2>
                <p>
                  Stay connected with us on social media for updates, new products, and design inspiration.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
