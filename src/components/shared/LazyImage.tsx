import React, { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  referrerPolicy?: string;
  onLoad?: () => void;
}

/**
 * LazyImage Component
 * Lazy loads images as they enter the viewport using Intersection Observer
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e0e0e0' width='400' height='300'/%3E%3C/svg%3E",
  className = "",
  referrerPolicy = "no-referrer",
  onLoad,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = src;
            img.onload = () => {
              setIsLoaded(true);
              onLoad?.();
            };
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, onLoad]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-75"} transition-opacity duration-300`}
      referrerPolicy={referrerPolicy as React.ImgHTMLAttributes<HTMLImageElement>['referrerPolicy']}
    />
  );
};

interface LazyImageGridProps {
  images: Array<{ id: string; url: string; alt: string; title?: string }>;
  className?: string;
  onImageClick?: (image: any) => void;
}

/**
 * LazyImageGrid Component
 * Grid of lazy-loaded images
 */
export const LazyImageGrid: React.FC<LazyImageGridProps> = ({
  images,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  onImageClick,
}) => {
  return (
    <div className={className}>
      {images.map((image) => (
        <div
          key={image.id}
          className="overflow-hidden rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onImageClick?.(image)}
        >
          <LazyImage
            src={image.url}
            alt={image.alt}
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
          />
          {image.title && (
            <div className="p-4 bg-white">
              <p className="font-semibold text-gray-900">{image.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface ProgressiveImageProps {
  src: string;
  lowResSrc?: string;
  alt: string;
  className?: string;
}

/**
 * ProgressiveImage Component
 * Shows low-res placeholder while high-res image loads
 */
export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowResSrc,
  alt,
  className = "",
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {lowResSrc && (
        <img
          src={lowResSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          referrerPolicy="no-referrer"
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setHighResLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          highResLoaded ? "opacity-100" : "opacity-0"
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
