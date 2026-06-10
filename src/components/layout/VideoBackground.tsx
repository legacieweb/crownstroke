import React from 'react';

type VideoBackgroundProps = {
  videoUrl: string;
  overlayClassName?: string;
  className?: string;
};

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  overlayClassName = 'bg-gradient-to-b from-black/90 via-black/40 to-black/90',
  className,
}) => {
  return (
    <div className={`absolute inset-0 ${className ?? ''}`} aria-hidden="true">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
};

export default VideoBackground;

