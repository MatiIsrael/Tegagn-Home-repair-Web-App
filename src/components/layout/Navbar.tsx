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
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '../common/Button';
import { authService } from '../../services/api';

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

  // Get current session user
  const storedUser = authService.getStoredUser();

  // Navigation links: Customer Hub & Worker Portal appear ONLY after login/register
  const navLinks = [
    { name: 'Find Professionals', path: '/workers', icon: <Search className="w-4 h-4 text-accent-500" /> },
    ...(storedUser && storedUser.role === 'customer'
      ? [{ name: 'Customer Hub', path: '/customer/dashboard', icon: <User className="w-4 h-4 text-brand-600" /> }]
      : []),
    ...(storedUser && storedUser.role === 'worker'
      ? [{ name: 'Worker Portal', path: '/worker/dashboard', icon: <Briefcase className="w-4 h-4 text-amber-500" /> }]
      : []),
    ...(storedUser && storedUser.role === 'admin'
      ? [{ name: 'Admin Portal', path: '/admin', icon: <ShieldCheck className="w-4 h-4 text-sky-500" /> }]
      : []),
  ];

  const handleSignOut = () => {
    authService.logout();
    window.location.href = '/';
  };

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
            {storedUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    storedUser.role === 'customer'
                      ? '/customer/dashboard'
                      : storedUser.role === 'worker'
                      ? '/worker/dashboard'
                      : '/admin'
                  }
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 border border-slate-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Hello, {storedUser.firstName ? storedUser.firstName : storedUser.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    {storedUser.role}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
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
            {storedUser ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs text-slate-700">
                  Signed in as <strong>{storedUser.firstName || storedUser.email}</strong> ({storedUser.role})
                </div>
                <Button 
                  variant="outline" 
                  size="md" 
                  className="w-full justify-center text-rose-600 hover:bg-rose-50 border-rose-200"
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
