import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  reviewsCount?: number;
  showScore?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  reviewsCount,
  showScore = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-400">
        {Array.from({ length: maxStars }).map((_, index) => {
          const filled = index < Math.floor(rating);
          const isHalf = !filled && index < rating;

          return (
            <Star
              key={index}
              className={`${sizeClasses[size]} ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          );
        })}
      </div>

      {showScore && (
        <span className={`font-medium text-slate-800 ${textClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {reviewsCount !== undefined && (
        <span className={`text-slate-500 ${textClasses[size]}`}>
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
