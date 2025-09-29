import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

interface ImageGridProps {
  images: string[];
  className?: string;
}

export function ImageGrid({ images, className = '' }: ImageGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  // Filter out images that failed to load
  const validImages = images.filter((_, index) => !imageErrors[index]);
  const imageCount = validImages.length;

  if (imageCount === 0) {
    return (
      <div className="my-2 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <ImageIcon className="w-4 h-4" />
        <span>Images could not be loaded</span>
      </div>
    );
  }

  // Single image - display normally
  if (imageCount === 1) {
    return (
      <div className={`my-2 ${className}`}>
        <img
          src={validImages[0]}
          alt="Embedded content"
          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
          loading="lazy"
          onError={() => handleImageError(0)}
          onClick={(e) => handleImageClick(validImages[0], e)}
        />
      </div>
    );
  }

  // Multiple images - use grid layout
  const gridClass = cn(
    'my-2 grid gap-2',
    className,
    {
      'grid-cols-2': imageCount === 2 || imageCount === 4,
      'grid-cols-2 grid-rows-2': imageCount === 3,
    }
  );

  return (
    <div className={gridClass}>
      {images.map((url, index) => {
        if (imageErrors[index]) return null;

        // For 3 images: first image spans 2 columns
        const isFirstOfThree = imageCount === 3 && index === 0;
        const imageClass = cn(
          'w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity',
          {
            'col-span-2': isFirstOfThree,
            'aspect-square': !isFirstOfThree && imageCount > 2,
            'aspect-auto': imageCount === 2,
          }
        );

        return (
          <div
            key={index}
            className={cn('overflow-hidden rounded-lg', {
              'col-span-2': isFirstOfThree,
            })}
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className={imageClass}
              loading="lazy"
              onError={() => handleImageError(index)}
              onClick={(e) => handleImageClick(url, e)}
            />
          </div>
        );
      })}
    </div>
  );
}