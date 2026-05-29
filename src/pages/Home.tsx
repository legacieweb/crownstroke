import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import PopularProducts from '../components/home/PopularProducts';
import Offers from '../components/home/Offers';
import ArtCollections from '../components/home/ArtCollections';
import DesignerPreview from '../components/home/DesignerPreview';
import CTA from '../components/home/CTA';

import PowerfulSimplicity from '../components/home/PowerfulSimplicity';

const Home: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <ArtCollections />
      <PopularProducts />
      <Offers />
      <PowerfulSimplicity />
      <DesignerPreview />
      <CTA />
    </Layout>
  );
};

export default Home;
