import React from 'react';

type PaintBackgroundProps = {
  overlayClassName?: string;
  className?: string;
  media?: string | null;
  mediaType?: 'image' | 'video' | null;
};

/** Shared optional media background with lightweight CSS paint washes behind it. */
const PaintBackground: React.FC<PaintBackgroundProps> = ({
  overlayClassName = 'bg-gradient-to-b from-black/20 via-black/10 to-black/20',
  className,
  media,
  mediaType,
}) => (
  <div className={className ?? 'absolute inset-0'} aria-hidden="true">
    {media && mediaType === 'video'
      ? <video src={media} autoPlay muted loop playsInline preload="auto" className="site-bg-image site-bg-video absolute inset-0 h-full w-full object-cover" />
      : media && <img src={media} alt="" className="site-bg-image absolute inset-0 h-full w-full object-cover" decoding="async" />}
    <div className="site-paint-wash site-paint-wash-one" />
    <div className="site-paint-wash site-paint-wash-two" />
    <div className={`absolute inset-0 ${overlayClassName}`} />
  </div>
);

export default PaintBackground;
