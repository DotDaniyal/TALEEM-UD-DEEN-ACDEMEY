import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { filterAudioLectures, formatDuration } from '../utils/bayan-logic';
import { AudioBayan } from '../types';
import {
  Headphones,
  Play,
  Pause,
  Download,
  Share2,
  Search,
  Filter,
  Check,
  Radio,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';

export const AudioLibraryPage: React.FC = () => {
  const {
    audioBayans,
    currentAudioTrack,
    setCurrentAudioTrack,
    audioPlaying,
    setAudioPlaying,
    lang,
    siteConfig,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', titleUrdu: 'تمام بیانات', titleEn: 'All Lectures' },
    { id: 'Juma Khutbah', titleUrdu: 'خطباتِ جمعۃ المبارک', titleEn: 'Friday Sermons' },
    { id: 'Quranic Tafseer', titleUrdu: 'تفسیرِ قرآنِ مجید', titleEn: 'Quranic Tafseer' },
    { id: 'Tazkiyah', titleUrdu: 'تزکیہ نفس و اصلاحِ باطن', titleEn: 'Purification & Tazkiyah' },
    { id: 'Sunnah & Adab', titleUrdu: 'سنتِ نبوی و آدابِ معاشرت', titleEn: 'Sunnah & Etiquette' },
    { id: 'Dua & Munajat', titleUrdu: 'مناجات و دعائے سحر', titleEn: 'Supplications' },
  ];

  const filteredAudios = filterAudioLectures(audioBayans, searchQuery, selectedCategory);

  const handleTogglePlay = (audio: AudioBayan) => {
    if (currentAudioTrack?.id === audio.id) {
      setAudioPlaying(!audioPlaying);
    } else {
      setCurrentAudioTrack(audio);
      setAudioPlaying(true);
    }
  };

  const handleShareAudio = (audio: AudioBayan) => {
    const text = `${audio.titleUrdu} - ${audio.speakerUrdu}\nسننے کے لیے ربط:\n${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: audio.titleUrdu, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(audio.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0F382A] text-stone-100 rounded-2xl p-6 sm:p-10 border border-[#C5A059]/30 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/20 border border-[#C5A059]/40 rounded-full text-xs text-[#FAF7F2]">
            <Headphones className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="font-urdu">صوتی کتب خانہ و خطبات (Audio Archive)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-urdu text-white tracking-tight">
            علمی و اصلاحی صوتی بیانات کا مبارک ذخیرہ
          </h1>

          <p className="text-sm sm:text-base text-stone-300 font-urdu leading-relaxed">
            محترم والد صاحب کے اصلاحی دروس، تفاسیرِ کلام اللہ، اور خطباتِ جمعہ کی اعلیٰ معیاری صوتی فائلز۔ جنہیں آپ براہِ راست سن سکتے ہیں اور آف لائن مطالعے کے لیے ڈاؤن لوڈ بھی کر سکتے ہیں۔
          </p>

          <div className="flex items-center gap-6 pt-2 text-xs text-[#C5A059] font-mono">
            <div>
              <span className="font-bold text-white text-base">{audioBayans.length}</span>
              <span className="ms-1.5 font-urdu text-stone-300">مجموعی بیانات</span>
            </div>
            <div>
              <span className="font-bold text-white text-base">5</span>
              <span className="ms-1.5 font-urdu text-stone-300">موضوعاتی ابواب</span>
            </div>
            <div>
              <span className="font-bold text-white text-base">MP3</span>
              <span className="ms-1.5 font-urdu text-stone-300">براہ راست ڈاؤن لوڈ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute start-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بیان کے عنوان، موضوع یا آیت سے تلاش فرمائیں..."
            className="w-full ps-10 pe-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 text-xs shrink-0 flex items-center gap-1 font-sans">
            <Filter className="w-3.5 h-3.5" />
            <span>موضوع:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs font-urdu ${
                selectedCategory === cat.id
                  ? 'bg-[#0F382A] text-white font-bold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {lang === 'ur' ? cat.titleUrdu : cat.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* Audio List Grid */}
      {filteredAudios.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200 space-y-3">
          <Headphones className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-semibold font-urdu text-stone-700">کوئی صوتی بیان دستیاب نہیں ملا</h3>
          <p className="text-xs text-stone-500 font-sans">
            براہ کرم تلاش کا لفظ تبدیل کریں یا دوسرے زمرے کا انتخاب فرمائیں۔
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAudios.map((audio) => {
            const isThisPlaying = currentAudioTrack?.id === audio.id && audioPlaying;
            const isThisSelected = currentAudioTrack?.id === audio.id;

            return (
              <div
                key={audio.id}
                className={`bg-white rounded-xl border p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isThisSelected
                    ? 'border-[#C5A059] shadow-sm bg-stone-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Left: Play button + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => handleTogglePlay(audio)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95 ${
                      isThisPlaying
                        ? 'bg-[#C5A059] text-stone-900'
                        : 'bg-[#0F382A] text-white hover:bg-[#0B281E]'
                    }`}
                    title={isThisPlaying ? 'روکیں' : 'سنیں'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ms-0.5" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-[#0F382A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-urdu">
                        {audio.categoryUrdu}
                      </span>
                      {audio.seriesUrdu && (
                        <span className="text-[11px] text-stone-600 font-urdu flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#C5A059]" />
                          <span>{audio.seriesUrdu}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-urdu text-stone-900 truncate">
                      {audio.titleUrdu}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-stone-500 font-sans">
                      <span className="flex items-center gap-1 font-urdu">
                        <span>مقرر:</span>
                        <strong className="text-stone-700">{audio.speakerUrdu}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{audio.duration}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{audio.recordedDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={audio.audioUrl}
                    download={`${audio.titleUrdu.replace(/\s+/g, '_')}.mp3`}
                    className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="ایم پی تھری ڈاؤن لوڈ کریں"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span className="font-urdu">ڈاؤن لوڈ MP3</span>
                  </a>

                  <button
                    onClick={() => handleShareAudio(audio)}
                    className="p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    title="شیئر کریں"
                  >
                    {copiedId === audio.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
