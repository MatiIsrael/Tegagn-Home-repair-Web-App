import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, CheckCircle2, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 mt-auto border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-navy-800/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Direct Connection</h4>
              <p className="text-sm text-slate-400">
                Contact local trade professionals directly without middleman markups or service broker fees.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Transparent Rates</h4>
              <p className="text-sm text-slate-400">
                Compare hourly rates and specialty skills openly before booking appointments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-800 text-accent-500 flex items-center justify-center shrink-0 shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Essential Home Trades</h4>
              <p className="text-sm text-slate-400">
                From plumbing and electrical repairs to masonry, carpentry, painting, and cleaning.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">
          {/* Brand info */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-accent-500">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">Tegagn</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              Tegagn is an open home-repair marketplace connecting homeowners, tenants, and property managers directly with local independent trade professionals.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-accent-500" />
                <span>Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-500" />
                <span>+251 91 100 0000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-500" />
                <span>contact@tegagn.com</span>
              </div>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Services
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers?category=plumber" className="hover:text-accent-400 transition-colors">
                  Plumbing
                </Link>
              </li>
              <li>
                <Link to="/workers?category=electrician" className="hover:text-accent-400 transition-colors">
                  Electrical Work
                </Link>
              </li>
              <li>
                <Link to="/workers?category=construction" className="hover:text-accent-400 transition-colors">
                  Construction & Masonry
                </Link>
              </li>
              <li>
                <Link to="/workers?category=painter" className="hover:text-accent-400 transition-colors">
                  Painting & Finishing
                </Link>
              </li>
              <li>
                <Link to="/workers?category=carpenter" className="hover:text-accent-400 transition-colors">
                  Carpentry & Woodwork
                </Link>
              </li>
              <li>
                <Link to="/workers?category=cleaning" className="hover:text-accent-400 transition-colors">
                  Deep & Post-Repair Cleaning
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Marketplace
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/workers" className="hover:text-accent-400 transition-colors">
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link to="/register?role=worker" className="hover:text-accent-400 transition-colors flex items-center gap-1 text-accent-400 font-medium">
                  <span>Join as a Worker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="hover:text-accent-400 transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/worker/dashboard" className="hover:text-accent-400 transition-colors">
                  Worker Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-accent-400 transition-colors">
                  Admin Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture / Dev Info */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Architecture
            </h5>
            <div className="p-3 bg-navy-900/90 rounded-xl border border-navy-800 text-xs space-y-1.5 text-slate-300">
              <p className="font-bold text-accent-400">Django + PostgreSQL</p>
              <p className="text-slate-400 leading-relaxed">
                Frontend UI built with React & TypeScript, designed to pair with a custom Python Django REST API.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tegagn Home-Repair Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Platform Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
