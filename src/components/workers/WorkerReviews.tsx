import React from 'react';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface WorkerReviewsProps {
  reviews: Review[];
  overallRating: number;
  totalReviews: number;
}

export const WorkerReviews: React.FC<WorkerReviewsProps> = ({
  reviews,
  overallRating,
  totalReviews,
}) => {
  return (
    <div className="space-y-6">
      {/* Review Summary Scoreboard */}
      <Card className="bg-gradient-to-br from-slate-50 to-brand-50/30 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {overallRating.toFixed(1)}
            </div>
            <div>
              <RatingStars rating={overallRating} size="lg" showScore={false} />
              <p className="text-xs text-slate-500 mt-1">
                Based on {totalReviews} verified customer reviews
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around">
            <div className="text-center">
              <span className="block font-bold text-slate-900 text-sm">100%</span>
              <span>Punctuality</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-900 text-sm">98%</span>
              <span>Workmanship</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-900 text-sm">99%</span>
              <span>Cleanliness</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">No reviews recorded yet for this professional.</p>
        ) : (
          reviews.map((rev) => (
            <Card key={rev.id} padding="sm" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{rev.customerName}</h4>
                    <span className="text-xs text-slate-400">{rev.createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <RatingStars rating={rev.rating} size="sm" showScore={false} />
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    {rev.jobType}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg">
                "{rev.comment}"
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
