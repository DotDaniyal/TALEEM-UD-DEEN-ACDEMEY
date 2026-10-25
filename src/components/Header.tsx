import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { lang, setLang, t, currentView, setCurrentView, isAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'live', label: t.navLive },
    { id: 'upcoming', label: t.navUpcoming },
    { id: 'recordings', label: t.navRecordings },
    { id: 'speaker', label: t.navSpeaker },
  ];

  const handleNavClick = (viewId: any) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#C5A059]/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-start focus-visible:outline-2 focus-visible:outline-[#0F382A] rounded-md shrink-0 cursor-pointer"
          aria-label={t.siteName}
        >
          <Logo size="md" siteNameUrdu={t.siteName} siteNameEn="Islamic Bayan Online" />
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-700 shrink-0"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#0F382A] font-semibold border-b-2 border-[#0F382A]'
                    : 'hover:text-[#0F382A] text-stone-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Selector & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center border border-stone-300 rounded-md bg-white p-0.5 text-xs text-stone-600">
            <button
              onClick={() => setLang('ur')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'ur'
                  ? 'bg-[#0F382A] text-white font-medium'
                  : 'hover:text-[#0F382A]'
              }`}
              title="اردو"
            >
              اردو
            </button>
            <button
              onClick={() => setLang('ar')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'ar'
                  ? 'bg-[#0F382A] text-white font-medium'
                  : 'hover:text-[#0F382A]'
              }`}
              title="العربية"
            >
              عربي
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#0F382A] text-white font-medium'
                  : 'hover:text-[#0F382A]'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Desktop Primary Action */}
          <div className="hidden sm:block">
            {isAdmin ? (
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] border border-[#0F382A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                {t.adminDashboard}
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('live')}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] border border-[#0F382A] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                {t.joinLiveNow}
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-700 hover:text-[#0F382A] rounded-md border border-stone-300 bg-white cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF7F2] px-4 py-4 space-y-2 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full text-start px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-200/50 rounded-md transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-stone-200">
            {isAdmin ? (
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#0F382A] rounded-md text-center"
              >
                {t.adminDashboard}
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('live')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-[#0F382A] rounded-md text-center"
              >
                {t.joinLiveNow}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
