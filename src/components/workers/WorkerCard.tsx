import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { WorkerProfile } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import { authService } from '../../services/api';

interface WorkerCardProps {
  worker: WorkerProfile;
  isSample?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker }) => {
  const { user } = worker;
  const storedUser = authService.getStoredUser();
  const isCustomer = Boolean(storedUser && storedUser.role === 'customer');
  const bookUrl = isCustomer
    ? `/workers/${worker.id}?action=book`
    : `/customer/login?redirect=${encodeURIComponent(`/workers/${worker.id}?action=book`)}&notice=booking_required`;

  return (
    <Card 
      hoverEffect 
      padding="none" 
      className="overflow-hidden flex flex-col justify-between h-full border border-slate-200/90 group transition-all duration-200 hover:border-navy-300 hover:shadow-xl"
    >
      <div className="p-5 sm:p-6">
        {/* Header: Avatar, Name, Trade Badge */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="trade">{worker.trade}</Badge>
              {worker.isAvailable ? (
                <Badge variant="available" size="sm" icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />}>
                  Available
                </Badge>
              ) : (
                <Badge variant="busy" size="sm">
                  Booked
                </Badge>
              )}
            </div>

            <Link to={`/workers/${worker.id}`} className="block mt-1">
              <h3 className="font-bold text-lg text-navy-950 group-hover:text-accent-600 transition-colors truncate">
                {user.firstName} {user.lastName}
              </h3>
            </Link>

            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
              {worker.tradeTitle}
            </p>
          </div>
        </div>

        {/* Ratings and Stats */}
        <div className="flex items-center justify-between mt-4 py-2 px-3 bg-slate-50 rounded-xl text-xs">
          <RatingStars rating={worker.rating} reviewsCount={worker.reviewsCount} size="sm" />
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span className="flex items-center gap-1" title="Years of experience">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {worker.experienceYears} yrs
            </span>
            <span className="flex items-center gap-1" title="Completed jobs">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {worker.completedJobs} jobs
            </span>
          </div>
        </div>

        {/* Bio excerpt */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
          {worker.bio}
        </p>

        {/* Location & Service Areas */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
          <MapPin className="w-3.5 h-3.5 text-accent-600 shrink-0" />
          <span className="truncate">{worker.city}</span>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {worker.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
            >
              {skill}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400">
              +{worker.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Rate & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Rate</span>
          <span className="text-base font-bold text-navy-950">${worker.hourlyRate}</span>
          <span className="text-xs text-slate-500 font-normal">/hr</span>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/workers/${worker.id}`}>
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
              Profile
            </Button>
          </Link>
          <Link to={bookUrl}>
            <Button variant="accent" size="sm" icon={<Calendar className="w-3.5 h-3.5" />}>
              Book
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
