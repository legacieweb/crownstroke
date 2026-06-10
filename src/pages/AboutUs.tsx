import React from 'react';
import Layout from '../components/layout/Layout';

const AboutUs: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
              About Us
            </h1>
            
            <div className="space-y-8 text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
                <p>
                  Crownstroke was founded with a simple mission: to empower creators to turn their ideas into reality. We believe that everyone has a unique story to tell, and we're here to help you share it with the world through custom-designed products.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">What We Do</h2>
                <p>
                  We provide a powerful and easy-to-use platform for designing and ordering custom products. From t-shirts and hoodies to mugs and posters, our state-of-the-art designer tools make it simple to create professional-looking products in minutes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Our Values</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-white">Creativity</h3>
                    <p className="text-gray-400">We believe in the power of creativity and self-expression.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Quality</h3>
                    <p className="text-gray-400">We are committed to providing high-quality products and services.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Sustainability</h3>
                    <p className="text-gray-400">We prioritize environmentally friendly practices in everything we do.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Customer Satisfaction</h3>
                    <p className="text-gray-400">Our customers are our top priority, and we strive to exceed their expectations.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
                <p className="text-gray-300">
                  We are a passionate team of designers, developers, and entrepreneurs who love what we do. Our diverse backgrounds and expertise allow us to create innovative solutions that meet the needs of our customers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Join Us</h2>
                <p className="text-gray-300">
                  Whether you're a designer looking to sell your creations or a customer looking for unique products, we'd love to have you join our community. Start creating today and see what you can make!
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
