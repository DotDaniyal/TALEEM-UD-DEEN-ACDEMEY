import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterLectures } from '../utils/bayan-logic';
import { Search, BookOpen, Clock, Calendar, Play } from 'lucide-react';

export const RecordedBayansPage: React.FC = () => {
  const { t, lang, recordings, setSelectedRecordingId, setCurrentView } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', labelUrdu: 'تمام خطابات', labelEn: 'All Lectures' },
    { id: 'Tafseer', labelUrdu: 'تفسیرِ قرآن', labelEn: 'Tafseer' },
    { id: 'Hadith', labelUrdu: 'حدیث شریف', labelEn: 'Hadith' },
    { id: 'Tazkiyah', labelUrdu: 'تزکیہ و احسان', labelEn: 'Tazkiyah' },
    { id: 'Family & Ethics', labelUrdu: 'خاندانی تربیت', labelEn: 'Family' },
    { id: 'Worship', labelUrdu: 'عبادات و فضائل', labelEn: 'Worship' },
  ];

  const filtered = filterLectures(recordings, searchQuery, selectedCategory);

  const handleSelectRecording = (id: string) => {
    setSelectedRecordingId(id);
    setCurrentView('recording-details');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          آرشیو المحاضرات
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A] mt-1">
          {t.recordedArchive}
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-sans max-w-2xl">
          والد محترم کے ماضی میں دیے گئے علمی خطابات، تفاسیر اور دروس کا تصدیق شدہ ذخیرہ۔
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Functional Category Filter Tabs (Zero pill discipline) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-white text-[#0F382A] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {lang === 'ur' ? c.labelUrdu : c.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full ps-9 pe-4 py-2 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
          />
        </div>
      </div>

      {/* Lectures Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 p-8">
          <p className="text-sm text-stone-500 font-sans">
            اس تلاش کے مطابق کوئی بیان دستیاب نہیں۔ براہ کرم کوئی دوسرا لفظ تلاش فرمائیں۔
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lecture) => (
            <article
              key={lecture.id}
              onClick={() => handleSelectRecording(lecture.id)}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-[#C5A059]/60 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={lecture.thumbnailUrl}
                    alt={lecture.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#0F382A]/90 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ms-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 end-2 bg-black/80 text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {lecture.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-xs text-stone-500 flex items-center gap-2 font-sans">
                    <span>{lecture.categoryUrdu}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{lecture.recordedDate}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-urdu font-semibold text-[#0F382A] leading-snug group-hover:text-[#0B281E]">
                    {lang === 'ur' ? lecture.titleUrdu : lecture.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {lang === 'ur' ? lecture.descriptionUrdu : lecture.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-4">
                <span className="text-xs text-stone-500 font-sans">
                  مقرر: {lecture.speakerUrdu}
                </span>

                <span className="text-xs font-semibold text-[#0F382A] flex items-center gap-1 group-hover:underline">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.playLecture}</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
