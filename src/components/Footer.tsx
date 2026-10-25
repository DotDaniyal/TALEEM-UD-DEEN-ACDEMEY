import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { t, setCurrentView } = useApp();

  return (
    <footer className="bg-[#0B281E] text-stone-300 border-t border-[#C5A059]/30 mt-20 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Column 1: Platform Purpose */}
          <div className="md:col-span-2">
            <span className="font-urdu text-xl font-bold text-[#C5A059] block mb-2">
              {t.siteName}
            </span>
            <p className="text-sm text-stone-300 leading-relaxed max-w-md font-sans">
              {t.tagline}
            </p>
            <p className="text-xs text-stone-400 mt-3 leading-relaxed max-w-md">
              منصة علمية وتزكوية مخصصة لبث المحاضرات والدروس الإسلامية المباشرة ونشر التسجيلات العلمية، نسأل الله الإخلاص والقبول.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-4">
              صفحات المنصة
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('live')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navLive}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('upcoming')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navUpcoming}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('recordings')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navRecordings}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('speaker')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.navSpeaker}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Admin Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A059] mb-4">
              معلومات وقوانين
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-300">
              <li>
                <button
                  onClick={() => setCurrentView('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.privacyPolicy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.termsAndConditions}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.contactUs}
                </button>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => setCurrentView('admin-login')}
                  className="text-xs text-[#C5A059] hover:underline cursor-pointer"
                >
                  {t.adminStudio}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Quiet Copyright & Prophetic Salutation */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="font-arabic text-stone-400">
            اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
          </p>
          <p>© {new Date().getFullYear()} {t.siteName}. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
};
