import React from 'react';
import { Star } from 'lucide-react';

export interface ReviewStarsProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeMap = {
  sm: { container: 'gap-1', star: 'w-4 h-4' },
  md: { container: 'gap-2', star: 'w-5 h-5' },
  lg: { container: 'gap-3', star: 'w-6 h-6' },
};

export const ReviewStars: React.FC<ReviewStarsProps> = ({
  value,
  size = 'md',
  editable = false,
  onChange,
  className = '',
}) => {
  const dimensions = sizeMap[size];

  return (
    <div className={`flex ${dimensions.container} ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        const isHovered = false;

        return (
          <button
            key={index}
            type="button"
            disabled={!editable}
            onClick={() => {
              if (editable && onChange) {
                onChange(starValue);
              }
            }}
            onKeyDown={(e) => {
              if (editable && onChange && (e.key === 'Enter' || e.key === ' ')) {
                onChange(starValue);
              }
            }}
            className={`${
              editable
                ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all'
                : 'cursor-default'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded`}
            aria-label={editable ? `Rate ${starValue} stars` : `${value} out of 5 stars`}
          >
            <Star
              className={`${dimensions.star} ${
                isFilled || isHovered
                  ? 'fill-primary text-primary'
                  : 'text-outline-variant'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
