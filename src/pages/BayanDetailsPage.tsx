import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateShareableLinks } from '../utils/bayan-logic';
import { ArrowLeft, ArrowRight, Download, Share2, Copy, Check, Calendar, Clock, BookOpen } from 'lucide-react';

export const BayanDetailsPage: React.FC = () => {
  const { t, lang, dir, selectedRecordingId, setSelectedRecordingId, recordings, setCurrentView } = useApp();
  const [copied, setCopied] = useState(false);

  const lecture = recordings.find((r) => r.id === selectedRecordingId) || recordings[0];
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  if (!lecture) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">بیان کی معلومات دستیاب نہیں ہیں۔</p>
        <button
          onClick={() => setCurrentView('recordings')}
          className="mt-4 px-4 py-2 bg-[#0F382A] text-white text-xs rounded-md"
        >
          {t.viewAllRecordings}
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `اسلامی بیان ملاحظہ فرمائیں: "${lecture.titleUrdu}"\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const related = recordings.filter((r) => r.id !== lecture.id).slice(0, 3);

  return (
    <div className="space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => setCurrentView('recordings')}
          className="text-xs font-semibold text-stone-600 hover:text-[#0F382A] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowIcon className="w-3.5 h-3.5" />
          <span>{t.navRecordings} کی طرف واپسی</span>
        </button>
      </div>

      {/* Main Video Viewport (Single-elevation, high fidelity) */}
      <div className="space-y-6">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-md">
          <video
            controls
            src={lecture.videoUrl}
            poster={lecture.thumbnailUrl}
            className="w-full h-full object-contain"
          >
            آپ کا براؤزر ویڈیو ٹیگ کو سپورٹ نہیں کرتا۔
          </video>
        </div>

        {/* Video Metadata & Actions Bar */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                <span className="font-semibold text-[#0F382A]">{lecture.categoryUrdu}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{lecture.recordedDate}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{lecture.duration}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-urdu font-bold text-[#0F382A] leading-snug">
                {lang === 'ur' ? lecture.titleUrdu : lecture.title}
              </h1>

              <p className="text-xs text-stone-500">
                مقرر: <span className="font-semibold text-stone-800">{lecture.speakerUrdu}</span>
              </p>
            </div>

            {/* Sharing & Download Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {lecture.downloadsAllowed && (
                <a
                  href={lecture.videoUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.downloadVideo}</span>
                </a>
              )}

              <button
                onClick={handleWhatsApp}
                className="px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareViaWhatsapp}</span>
              </button>

              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title={t.copyLink}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>

          {/* Description & Study Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C5A059] font-sans">
              خلاصۂ خطاب و علمی نکات
            </h3>
            <p className="text-stone-700 font-urdu leading-loose text-base">
              {lang === 'ur' ? lecture.descriptionUrdu : lecture.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Bayans */}
      {related.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-stone-200">
          <h2 className="text-xl font-urdu font-bold text-[#0F382A]">
            {t.relatedLectures}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <article
                key={rel.id}
                onClick={() => setSelectedRecordingId(rel.id)}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#C5A059]/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={rel.thumbnailUrl}
                    alt={rel.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 end-2 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {rel.duration}
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="text-[11px] text-stone-500 font-sans">
                    {rel.categoryUrdu}
                  </span>
                  <h4 className="text-base font-urdu font-semibold text-[#0F382A] leading-snug">
                    {lang === 'ur' ? rel.titleUrdu : rel.title}
                  </h4>
                </div>

                <div className="p-4 pt-0 text-xs font-semibold text-[#0F382A] flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.playLecture}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
