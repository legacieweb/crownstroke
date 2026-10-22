import React, { useEffect, useRef, useState } from 'react';
import backgroundVideo from '../../../video.mp4';

export const DEFAULT_BG_VIDEO_URL = backgroundVideo;

type VideoBackgroundProps = {
  videoUrl?: string;
  overlayClassName?: string;
  className?: string;
  videoClassName?: string;
};

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl = DEFAULT_BG_VIDEO_URL,
  overlayClassName = 'bg-gradient-to-b from-black/20 via-black/10 to-black/20',
  className,
  videoClassName = 'w-full h-full object-cover',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    let idleCallbackId: number | undefined;
    const loadVideo = () => setSource(videoUrl);

    const requestIdle = (window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number }).requestIdleCallback;
    if (requestIdle) {
      idleCallbackId = requestIdle.call(window, loadVideo, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(loadVideo, 350);
    }
    setHasFailed(false);
    return () => {
      if (idleCallbackId !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleCallbackId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [videoUrl]);

  const handleVideoError = () => {
    setHasFailed(true);
  };

  return (
    <div className={className ?? 'absolute inset-0'} aria-hidden="true">
      {!hasFailed && <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        onCanPlay={() => { void videoRef.current?.play().catch(() => {}); }}
        onError={handleVideoError}
        className={videoClassName}
        aria-hidden="true"
        src={source || undefined}
      />}
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
};

export default VideoBackground;

