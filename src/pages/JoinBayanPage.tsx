import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateShareableLinks } from '../utils/bayan-logic';
import { Share2, Copy, Check, ArrowLeft, ArrowRight, Radio, Mic, Volume2 } from 'lucide-react';

export const JoinBayanPage: React.FC = () => {
  const { t, lang, dir, selectedRoomCode, setSelectedRoomCode, setCurrentView, sessions, siteConfig } = useApp();
  const [attendeeName, setAttendeeName] = useState('');
  const [copied, setCopied] = useState(false);
  const [audioTestPassed, setAudioTestPassed] = useState(true);

  const matchedSession = sessions.find((s) => s.roomCode === selectedRoomCode) || sessions[0];
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomCode.trim()) return;
    // Enter live bayan studio
    setCurrentView('live');
  };

  const handleCopyLink = () => {
    const links = generateShareableLinks(
      window.location.origin,
      selectedRoomCode,
      matchedSession?.titleUrdu || 'Islamic Bayan',
      lang
    );
    navigator.clipboard.writeText(links.joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const links = generateShareableLinks(
      window.location.origin,
      selectedRoomCode,
      matchedSession?.titleUrdu || 'Islamic Bayan',
      lang
    );
    window.open(links.whatsappShareUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          {t.joinPageTitle}
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A]">
          {matchedSession ? (lang === 'ur' ? matchedSession.titleUrdu : matchedSession.title) : t.joinViaLink}
        </h1>
        <p className="text-sm text-stone-600 font-sans max-w-lg mx-auto">
          {t.joinPageSubtitle}
        </p>
      </div>

      {/* Main Join Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs space-y-6">
        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-sans">
              {t.enterName}
            </label>
            <input
              type="text"
              required
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="مثلاً: محمد عبد اللہ"
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 font-sans">
              {t.enterRoomCode}
            </label>
            <input
              type="text"
              required
              value={selectedRoomCode}
              onChange={(e) => setSelectedRoomCode(e.target.value)}
              placeholder="bayan-code"
              className="w-full px-4 py-3 text-sm font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Pre-Join Permission Guidance */}
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#0F382A]">
              <Volume2 className="w-4 h-4 text-[#C5A059]" />
              <span>مجلس کے آداب اور آڈیو گائیڈ</span>
            </div>
            <p className="leading-relaxed">
              • درس کے دوران تمام شرکاء کے مائیک میزبان کی جانب سے خودکار طور پر بند رہتے ہیں تاکہ یکسوئی برقرار رہے۔
            </p>
            <p className="leading-relaxed">
              • سوال پوچھنے کے لیے اسٹوڈیو میں &quot;ہاتھ اٹھائیں&quot; کا بٹن استعمال فرمائیں۔
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-sm font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Radio className="w-4 h-4 text-[#C5A059]" />
            <span>{t.joinSessionButton}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </form>

        {/* Shareable Actions for Family / Contacts */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-500 font-sans">اس بیان کو دوسروں تک پہنچائیں:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="px-3 py-1.5 bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366]/20 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>واٹس ایپ</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.linkCopied : t.copyLink}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
