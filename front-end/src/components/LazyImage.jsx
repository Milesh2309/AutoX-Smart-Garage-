import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = '16/9',
  priority = false,
  onLoad,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <div 
      ref={imgRef}
      className={`lazy-image-wrapper ${className}`}
      style={{ aspectRatio }}
    >
      {!isLoaded && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-skeleton"></div>
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={handleLoad}
          className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
