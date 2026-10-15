import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mb-6">
        <Wrench className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
        404 - Page Not Found
      </h1>
      <p className="text-base text-slate-500 max-w-md mb-8">
        The home repair service or page you are looking for does not exist or has been relocated.
      </p>
      <div className="flex gap-4">
        <Link to="/">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/workers">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
            Find Workers
          </Button>
        </Link>
      </div>
    </div>
  );
};
