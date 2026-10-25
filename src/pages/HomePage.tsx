import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateTimeRemaining, generateShareableLinks } from '../utils/bayan-logic';
import { ArrowLeft, ArrowRight, Share2, Copy, Check, Video, Calendar, Clock, BookOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, lang, dir, setCurrentView, sessions, recordings, setSelectedRecordingId, setSelectedRoomCode, siteConfig } = useApp();
  const [copied, setCopied] = useState(false);

  // Find next upcoming or currently live session
  const activeSession = sessions.find((s) => s.status === 'live') || sessions[0];
  const [countdown, setCountdown] = useState<string>('00:00:00');

  useEffect(() => {
    if (!activeSession) return;
    const update = () => {
      const res = calculateTimeRemaining(activeSession.scheduledAt);
      setCountdown(res.formattedCountdown);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const handleShare = () => {
    if (!activeSession) return;
    const links = generateShareableLinks(
      window.location.origin,
      activeSession.roomCode,
      lang === 'ur' ? activeSession.titleUrdu : activeSession.title,
      lang
    );
    window.open(links.whatsappShareUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (!activeSession) return;
    const links = generateShareableLinks(
      window.location.origin,
      activeSession.roomCode,
      lang === 'ur' ? activeSession.titleUrdu : activeSession.title,
      lang
    );
    navigator.clipboard.writeText(links.joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinSession = (roomCode: string) => {
    setSelectedRoomCode(roomCode);
    setCurrentView('join');
  };

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-16">
      {/* SECTION 1: MARQUEE HERO WITH ARCHIVAL ARTWORK */}
      <section className="relative overflow-hidden bg-[#0F382A] text-stone-100 rounded-2xl border border-[#C5A059]/30 shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none islamic-pattern-dark" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch p-6 sm:p-10 lg:p-12 relative z-10">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C5A059]">
              <span>{t.heroKicker}</span>
              <span aria-hidden="true">·</span>
              <span>{siteConfig.speakerNameUrdu}</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-urdu font-bold leading-relaxed text-white text-balance">
              {t.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-300 leading-relaxed font-sans max-w-xl">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {activeSession && (
                <button
                  onClick={() => handleJoinSession(activeSession.roomCode)}
                  className="px-5 py-3 text-xs sm:text-sm font-semibold text-[#0F382A] bg-[#C5A059] hover:bg-[#d6b26c] rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Video className="w-4 h-4 shrink-0" />
                  <span>{t.joinLiveNow}</span>
                  <ArrowIcon className="w-4 h-4 shrink-0" />
                </button>
              )}

              <button
                onClick={handleShare}
                className="px-4 py-3 text-xs sm:text-sm font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>{t.shareViaWhatsapp}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-4 py-3 text-xs sm:text-sm font-medium text-stone-300 hover:text-white rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title={t.copyLink}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full h-64 sm:h-80 lg:h-full rounded-xl overflow-hidden border border-[#C5A059]/40 shadow-inner">
              <img
                src="/src/assets/images/islamic_calligraphy_art_1792917984824.jpg"
                alt="Classical Islamic geometric illumination"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                <span className="text-xs uppercase tracking-wider text-[#C5A059] font-sans">
                  {activeSession?.categoryUrdu || 'تفسیر و حکمت'}
                </span>
                <p className="font-urdu text-base sm:text-lg font-semibold text-white mt-1">
                  {lang === 'ur' ? activeSession?.titleUrdu : activeSession?.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Bayan Countdown Ribbon */}
        {activeSession && (
          <div className="border-t border-[#C5A059]/20 bg-[#0B281E]/90 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2 text-stone-300">
              <Clock className="w-4 h-4 text-[#C5A059] shrink-0" />
              <span>{t.nextLectureCountdown}</span>
              <span className="font-mono tabular-nums text-sm sm:text-base font-semibold text-[#C5A059] px-2 py-0.5 bg-black/30 rounded border border-[#C5A059]/30">
                {countdown}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-stone-400">
              <span>{activeSession.language}</span>
              <span aria-hidden="true">·</span>
              <span>{activeSession.durationMinutes} منٹ</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => handleJoinSession(activeSession.roomCode)}
                className="text-[#C5A059] hover:underline font-semibold cursor-pointer"
              >
                کمرہ نمبر: {activeSession.roomCode}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: SPEAKER INTRODUCTION & INTEGRITY */}
      <section className="bg-white rounded-xl border border-stone-200 p-8 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-[#C5A059]/40 shadow-md">
              <img
                src={siteConfig.speakerPhotoUrl || '/src/assets/images/speaker_portrait_1792917987190.jpg'}
                alt={siteConfig.speakerName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="text-xs uppercase tracking-widest text-stone-500 font-sans">
              {t.speakerIntroTitle}
            </div>

            <h2 className="text-2xl sm:text-3xl font-urdu font-bold text-[#0F382A]">
              {siteConfig.speakerNameUrdu}
            </h2>

            <p className="text-sm font-medium text-[#C5A059]">
              {siteConfig.speakerTitleUrdu}
            </p>

            <p className="text-stone-700 font-urdu leading-loose text-base">
              {siteConfig.speakerBioUrdu}
            </p>

            <div className="pt-2 flex items-center gap-6 text-sm">
              <button
                onClick={() => setCurrentView('speaker')}
                className="text-[#0F382A] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.learnMoreAboutSpeaker}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('contact')}
                className="text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                {t.contactUs}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECENT RECORDED BAYANS ARCHIVE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
              علمی ذخیرہ
            </div>
            <h2 className="text-2xl sm:text-3xl font-urdu font-bold text-[#0F382A] mt-1">
              {t.recordedArchive}
            </h2>
          </div>

          <button
            onClick={() => setCurrentView('recordings')}
            className="text-sm font-semibold text-[#0F382A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{t.viewAllRecordings}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recordings.slice(0, 3).map((lecture) => (
            <article
              key={lecture.id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#C5A059]/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={lecture.thumbnailUrl}
                    alt={lecture.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 end-2 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {lecture.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-xs text-stone-500 flex items-center gap-2">
                    <span>{lecture.categoryUrdu}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lecture.recordedDate}</span>
                  </div>

                  <h3 className="text-lg font-urdu font-semibold text-[#0F382A] leading-snug">
                    {lang === 'ur' ? lecture.titleUrdu : lecture.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {lang === 'ur' ? lecture.descriptionUrdu : lecture.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setSelectedRecordingId(lecture.id);
                    setCurrentView('recording-details');
                  }}
                  className="text-xs font-semibold text-[#0F382A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.playLecture}</span>
                </button>

                <span className="text-[11px] text-stone-400 font-sans">
                  {lecture.viewsCount} مشاہدات
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
