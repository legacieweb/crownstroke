import React from 'react';
import Layout from '../components/layout/Layout';

const Sustainability: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Sustainability
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Commitment</h2>
                <p>
                  At Crownstroke, we recognize the importance of sustainability and are committed to reducing our environmental impact. We believe that creating beautiful products should not come at the cost of our planet.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Sustainable Materials</h2>
                <p>
                  We are dedicated to using sustainable materials in our products. Our cotton is sourced from organic farms, and we prioritize recycled materials whenever possible. We also partner with suppliers who share our commitment to environmental responsibility.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Eco-Friendly Production</h2>
                <p>
                  Our production process is designed with sustainability in mind. We use water-based inks that are non-toxic and environmentally friendly. Our printing techniques minimize waste and energy consumption.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Packaging</h2>
                <p>
                  We use 100% recyclable packaging for all our products. Our shipping boxes are made from recycled materials, and we avoid unnecessary plastic packaging. We are continuously looking for ways to reduce our packaging footprint.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Carbon Neutral Shipping</h2>
                <p>
                  We offset the carbon emissions from all our shipping. We partner with carbon offset projects that focus on reforestation, renewable energy, and energy efficiency.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Continuous Improvement</h2>
                <p>
                  We are committed to continuously improving our sustainability practices. We regularly assess our supply chain and operations to identify areas for improvement and implement new technologies that reduce our environmental impact.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Us</h2>
                <p>
                  We believe that sustainability is a shared responsibility. We encourage our customers to join us in our efforts by choosing eco-friendly products and recycling their packaging.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Sustainability;
