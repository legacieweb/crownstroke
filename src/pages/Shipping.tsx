import React from 'react';
import Layout from '../components/layout/Layout';
import VideoBackground from '../components/layout/VideoBackground';

const Shipping: React.FC = () => {
  return (
    <Layout>
      <VideoBackground videoUrl="https://i.imgur.com/d2d8Llz.mp4" />
      <div className="min-h-screen py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
              Shipping Information
            </h1>
            
            <div className="space-y-8 text-white/80 leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Delivery Fees by Location</h2>
                <p className="text-white/70">
                  Shipping fees are calculated based on your location within Kenya. All orders are delivered directly to your doorstep.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-2xl border border-green-400/20">
                    <h3 className="font-bold text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Nairobi CBD Areas - FREE
                    </h3>
                    <p className="text-white/70 mt-1">Westlands, Kilimani, Karen, Muthaiga, Hurlingham, Parklands, Lavington, Gigiri, Runda, Kileleshwa, Loresho, Nyari, Spring Valley</p>
                  </div>
                  <div className="p-4 bg-primary-500/10 rounded-2xl border border-primary-400/20">
                    <h3 className="font-bold text-primary-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                      Nairobi County & Other Nairobi Areas - KES 150
                    </h3>
                    <p className="text-white/70 mt-1">Nairobi County (excluding CBD), Ruiru, Juja, Kikuyu, Athi River, Ongata Rongai, South C, South B, Umoja, Kayole, Mathare, Kasarani, Embakasi, Lang'ata, Dagoretti, Kariobangi, Githurai, Kibera</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-400/20">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      Other Kenyan Counties - KES 300
                    </h3>
                    <p className="text-white/70 mt-1">Mombasa, Kisumu, Nakuru, Eldoret, Thika, Kakamega, Kisii, Nyeri, Machakos, Embu, Garissa, Nanyuki, Lamu, Wajir, Turkana, Kitale, Malindi</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Delivery Time</h2>
                <p className="text-white/70">
                  Delivery times vary based on your location:
                </p>
                <div className="mt-4 space-y-2 text-white/70">
                  <p><span className="text-primary-400 font-bold">Nairobi CBD:</span> Same day - 1 business day</p>
                  <p><span className="text-primary-400 font-bold">Nairobi County:</span> 1-2 business days</p>
                  <p><span className="text-primary-400 font-bold">Other Counties:</span> 2-4 business days</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Processing Time</h2>
                <p className="text-white/70">
                  Orders are typically processed within 2-3 business days. Custom-designed products may take an additional 1-2 business days to process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Payment on Delivery</h2>
                <p className="text-white/70">
                  We offer a 60% deposit option at checkout. Pay the remaining 40% balance when your order arrives.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Tracking Your Order</h2>
                <p className="text-white/70">
                  Once your order has been shipped, you will receive a confirmation email with tracking information. You can track your order status in your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Shipping Restrictions</h2>
                <p className="text-white/70">
                  Currently, we only ship within Kenya. International shipping will be available soon.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                <p className="text-white/70">
                  If you have any questions about shipping, please contact us at support@crownstroke.com or through our contact page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;
