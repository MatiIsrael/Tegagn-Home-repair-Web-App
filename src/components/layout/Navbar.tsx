import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wrench, 
  Menu, 
  X, 
  User, 
  Briefcase, 
  ShieldCheck, 
  Search, 
  PlusCircle, 
  LogIn 
} from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  // React State: Controls whether the mobile navigation drawer is visible
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Condition & Function: Determines whether a given navigation link matches current route
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Event handler & Effect: Close mobile menu when user presses Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Array of navigation link objects
  const navLinks = [
    { name: 'Find Professionals', path: '/workers', icon: <Search className="w-4 h-4 text-accent-500" /> },
    { name: 'Customer Hub', path: '/customer/dashboard', icon: <User className="w-4 h-4 text-slate-400" /> },
    { name: 'Worker Portal', path: '/worker/dashboard', icon: <Briefcase className="w-4 h-4 text-slate-400" /> },
    { name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-xl p-1">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-accent-500 shadow-md shadow-navy-900/20 group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-navy-950 group-hover:text-accent-600 transition-colors">
                Tegagn
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                Home Services
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? 'bg-navy-50 text-navy-900 font-bold border border-navy-100'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/80'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" icon={<LogIn className="w-4 h-4" />}>
                Log In
              </Button>
            </Link>
            <Link to="/register/worker">
              <Button variant="accent" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                Join as a Pro
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button with Accessibility Attributes */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-navy-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation"
          className="relative z-50 md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl"
        >
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-navy-50 text-navy-900 font-bold border border-navy-100'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="md" className="w-full justify-center">
                Log In
              </Button>
            </Link>
            <Link to="/register/worker" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="accent" size="md" className="w-full justify-center font-bold">
                Join as a Pro
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
