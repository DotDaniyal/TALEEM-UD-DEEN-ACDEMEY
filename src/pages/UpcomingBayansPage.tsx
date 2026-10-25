import React from 'react';
import { useApp } from '../context/AppContext';
import { formatIslamicDateEstimate, generateShareableLinks } from '../utils/bayan-logic';
import { Calendar, Clock, Share2, Video, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export const UpcomingBayansPage: React.FC = () => {
  const { t, lang, dir, sessions, setSelectedRoomCode, setCurrentView } = useApp();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const handleJoin = (code: string) => {
    setSelectedRoomCode(code);
    setCurrentView('join');
  };

  const handleShare = (session: any) => {
    const links = generateShareableLinks(
      window.location.origin,
      session.roomCode,
      lang === 'ur' ? session.titleUrdu : session.title,
      lang
    );
    window.open(links.whatsappShareUrl, '_blank');
  };

  return (
    <div className="space-y-10">
      <div className="border-b border-stone-200 pb-6">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          جدول المواعید
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A] mt-1">
          {t.scheduledBayans}
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-sans max-w-2xl">
          آئندہ منعقد ہونے والی مجالس اور بیانات کا باضابطہ نظام الاوقات۔ اپنے اہل و عیال اور احباب کو پیشگی مطلع فرمائیں۔
        </p>
      </div>

      <div className="space-y-6">
        {sessions.map((session) => {
          const dateInfo = formatIslamicDateEstimate(session.scheduledAt);
          return (
            <div
              key={session.id}
              className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs hover:border-[#C5A059]/50 transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-sans">
                  <span className="flex items-center gap-1.5 text-[#0F382A] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{dateInfo.gregorianFormatted}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>تقریباً {dateInfo.hijriYearEstimate}ھ</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{session.durationMinutes} منٹ</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{session.categoryUrdu}</span>
                </div>

                <h3 className="text-2xl font-urdu font-bold text-[#0F382A] leading-snug">
                  {lang === 'ur' ? session.titleUrdu : session.title}
                </h3>

                <p className="text-sm text-stone-600 font-sans leading-relaxed">
                  {lang === 'ur' ? session.descriptionUrdu : session.description}
                </p>

                <div className="text-xs text-stone-500">
                  <span>مقرر: </span>
                  <span className="font-semibold text-stone-800">{session.speakerNameUrdu}</span>
                  <span className="ms-3 font-mono text-stone-400">کمرہ کوڈ: {session.roomCode}</span>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-end">
                <button
                  onClick={() => handleJoin(session.roomCode)}
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Video className="w-4 h-4" />
                  <span>{t.joinViaLink}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleShare(session)}
                  className="w-full py-2.5 px-4 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{t.shareViaWhatsapp}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
