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
  LogIn,
  LogOut
} from 'lucide-react';
import { Button } from '../common/Button';
import { authService } from '../../services/api';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';
import { LanguageThemeControls } from '../common/LanguageThemeControls';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useThemeLanguage();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const [storedUser, setStoredUser] = useState(() => authService.getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setStoredUser(authService.getStoredUser());
    };
    window.addEventListener('tegagn_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('tegagn_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    setStoredUser(authService.getStoredUser());
  }, [location.pathname]);

  const navLinks = [
    { name: t('findPros'), path: '/workers', icon: <Search className="w-4 h-4 text-accent-500" /> },
    ...(storedUser && storedUser.role === 'customer'
      ? [{ name: t('customerHub'), path: '/customer/dashboard', icon: <User className="w-4 h-4 text-brand-600" /> }]
      : []),
    ...(storedUser && storedUser.role === 'worker'
      ? [{ name: t('workerPortal'), path: '/worker/dashboard', icon: <Briefcase className="w-4 h-4 text-amber-500" /> }]
      : []),
    ...(storedUser && storedUser.role === 'admin'
      ? [{ name: t('adminPortal'), path: '/admin', icon: <ShieldCheck className="w-4 h-4 text-sky-500" /> }]
      : []),
  ];

  const handleSignOut = () => {
    authService.logout();
    setStoredUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-xl p-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500 dark:bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t('brandName')}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {t('homeServices')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? 'bg-navy-50 dark:bg-slate-800 text-navy-900 dark:text-white font-bold border border-navy-100 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Header Area: Language/Nightmode Controls + Supabase + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* The 3-Language (EN / አማ / ORO) & Night Mode Switcher */}
            <LanguageThemeControls />

            {/* Desktop Auth Buttons */}
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
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {storedUser.firstName ? storedUser.firstName : storedUser.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t(storedUser.role)}
                  </span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors px-2 py-1"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageThemeControls />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-navy-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer"
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
          className="relative z-50 md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl"
        >
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-navy-50 dark:bg-slate-800 text-navy-900 dark:text-white font-bold border border-navy-100 dark:border-slate-700'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {storedUser ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  {t('signedInAs')} <strong>{storedUser.firstName || storedUser.email}</strong> ({t(storedUser.role)})
                </div>
                <Button 
                  variant="outline" 
                  size="md" 
                  className="w-full justify-center text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50"
                  icon={<LogOut className="w-4 h-4" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="accent" size="md" className="w-full justify-center font-bold">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
