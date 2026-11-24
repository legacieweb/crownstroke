import React from 'react';

type PaintBackgroundProps = {
  overlayClassName?: string;
  className?: string;
  image?: string | null;
};

/** Lightweight animated CSS color washes; no video, poster, or image requests. */
const PaintBackground: React.FC<PaintBackgroundProps> = ({
  overlayClassName = 'bg-gradient-to-b from-black/20 via-black/10 to-black/20',
  className,
  image,
}) => (
  <div className={className ?? 'absolute inset-0'} aria-hidden="true">
    {image && <img src={image} alt="" className="site-bg-image absolute inset-0 h-full w-full object-cover" decoding="async" />}
    <div className="site-paint-wash site-paint-wash-one" />
    <div className="site-paint-wash site-paint-wash-two" />
    <div className={`absolute inset-0 ${overlayClassName}`} />
  </div>
);

export default PaintBackground;
