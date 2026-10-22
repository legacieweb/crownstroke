import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const HERO_IMAGES = {
  artwork: 'Dream Bigger, Work Harder, Stay Focused.png',
  tee: 'Good Vibes Only Hoodie Model.png',
  mug: 'Better_Things_Ahead_Mug-removebg-preview.png',
};

/** The three hero images are intentionally sourced directly in this component. */
const HomeHeroProductMockup: React.FC = () => {

  return (
    <div className="home-stage" aria-label="Ready-made products featured in the homepage hero">
      <div className="home-stage-wash" />
      <span className="home-orbit home-orbit-one" />
      <span className="home-orbit home-orbit-two" />
      <Link to="/shop" className="home-print-sheet" aria-label="Explore ready-made designs">
        <img src={HERO_IMAGES.artwork} alt="Colorful framed art print" loading="lazy" decoding="async" />
        <span>READY MADE</span>
        <small>READY MADE</small>
      </Link>
      <Link to="/shop" className="home-shirt" aria-label="Explore ready-made designs">
        <img src={HERO_IMAGES.tee} alt="Ready-made signature T-shirt" loading="eager" decoding="async" />
      </Link>
      <Link to="/shop" className="home-product-chip" aria-label="Explore ready-made designs">
        <img src={HERO_IMAGES.mug} alt="Ready-made ceramic art mug" loading="lazy" decoding="async" />
        <div><b>READY MADE</b><span>Designer original</span></div>
        <span className="home-chip-check"><Check size={15} /></span>
      </Link>
      <span className="home-stage-caption">Your idea,<br />made tangible.</span>
    </div>
  );
};

export default HomeHeroProductMockup;
