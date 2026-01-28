import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the loading animation after video ends or after 2 seconds (whichever comes first)
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 2000); // Reduced duration for shorter animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleVideoEnd = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="loading-animation-overlay">
      <div className="loading-video-container">
        <video
          autoPlay
          muted
          onEnded={handleVideoEnd}
          className="loading-video"
        >
          <source src="/img/web images/animeson/WhatsApp Video 2026-01-28 at 2.01.48 PM.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default LoadingAnimation;
