import React from 'react';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

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
  const { t } = useThemeLanguage();

  return (
    <div className="space-y-6">
      {/* Review Summary Scoreboard */}
      <Card className="bg-gradient-to-br from-slate-50 to-brand-50/30 dark:from-slate-800 dark:to-slate-800/60 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {overallRating.toFixed(1)}
            </div>
            <div>
              <RatingStars rating={overallRating} size="lg" showScore={false} />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {totalReviews} {t('verifiedClientReviews')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around">
            <div className="text-center">
              <span className="block font-bold text-slate-900 dark:text-white text-sm">100%</span>
              <span>{t('punctuality') || 'Punctuality'}</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-900 dark:text-white text-sm">98%</span>
              <span>{t('workmanship') || 'Workmanship'}</span>
            </div>
            <div className="text-center">
              <span className="block font-bold text-slate-900 dark:text-white text-sm">99%</span>
              <span>{t('cleanliness') || 'Cleanliness'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">{t('noReviewsYet') || 'No reviews recorded yet for this professional.'}</p>
        ) : (
          reviews.map((rev) => (
            <Card key={rev.id} padding="sm" className="space-y-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{rev.customerName}</h4>
                    <span className="text-xs text-slate-400">{rev.createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <RatingStars rating={rev.rating} size="sm" showScore={false} />
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    {t(rev.jobType) || rev.jobType}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-lg">
                "{rev.comment}"
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
