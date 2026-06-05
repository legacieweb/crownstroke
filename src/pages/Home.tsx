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

import { useSeo } from '../hooks/useSeo';
import { CROWNSTROKE_BASE } from './SeoDefaults';

const Home: React.FC = () => {
  useSeo({
    title: CROWNSTROKE_BASE.title,
    description: CROWNSTROKE_BASE.description,
    canonicalUrl: `${CROWNSTROKE_BASE.url}/`,
    ogImage: CROWNSTROKE_BASE.ogImage,
    robots: 'index,follow'
  });

  return (
    <Layout>
      <Hero />
      <ArtCollections />
      <PopularProducts />
      <Offers />
      <Features />
      <PowerfulSimplicity />
      <DesignerPreview />
      <CTA />
    </Layout>
  );
};

export default Home;

