import React from 'react';
import Layout from '../components/layout/Layout';

const Careers: React.FC = () => {
  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
              Careers
            </h1>
            
            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Join Our Team</h2>
                <p>
                  At Crownstroke, we're always looking for talented and passionate individuals to join our team. If you love design, technology, and innovation, we'd love to hear from you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Work with Us</h2>
                <ul className="mt-4 space-y-2 list-disc list-inside">
                  <li>Work on cutting-edge technology</li>
                  <li>Collaborative and creative work environment</li>
                  <li>Competitive salary and benefits</li>
                  <li>Opportunities for growth and advancement</li>
                  <li>Work-life balance</li>
                  <li>Make a meaningful impact</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Current Openings</h2>
                <p>We don't have any open positions at the moment. Please check back later or send us your resume for future consideration.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Culture</h2>
                <p>
                  We foster a culture of innovation, collaboration, and continuous learning. We believe in empowering our employees to take ownership of their work and make decisions that drive our company forward.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Benefits</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900">Health Insurance</h3>
                    <p>Comprehensive medical, dental, and vision coverage.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Retirement Plan</h3>
                    <p>401(k) with company match.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Paid Time Off</h3>
                    <p>Generous vacation and sick leave.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Remote Work</h3>
                    <p>Flexible remote work options.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Apply</h2>
                <p>
                  To apply for a position, please send your resume and cover letter to careers@crownstroke.com. We will review your application and get back to you if we find a match for your skills and experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Equal Opportunity Employer</h2>
                <p>
                  Crownstroke is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Careers;
