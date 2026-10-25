import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Award, Heart, CheckCircle2 } from 'lucide-react';

export const AboutSpeakerPage: React.FC = () => {
  const { t, siteConfig } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Editorial Header */}
      <div className="text-center space-y-3 border-b border-stone-200 pb-8">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          سیرت و تعارف
        </div>
        <h1 className="text-3xl sm:text-4xl font-urdu font-bold text-[#0F382A]">
          {siteConfig.speakerNameUrdu}
        </h1>
        <p className="text-sm font-medium text-[#C5A059] font-sans">
          {siteConfig.speakerTitleUrdu}
        </p>
      </div>

      {/* Main Biography Block */}
      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border-2 border-[#C5A059]/40 shadow-sm shrink-0">
            <img
              src={siteConfig.speakerPhotoUrl || '/src/assets/images/speaker_portrait_1792917987190.jpg'}
              alt={siteConfig.speakerName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4 text-start">
            <h2 className="text-xl font-urdu font-semibold text-[#0F382A]">
              علمی سفر اور دعوتی منہج
            </h2>
            <p className="text-stone-700 font-urdu leading-loose text-base">
              {siteConfig.speakerBioUrdu}
            </p>
            <p className="text-stone-600 font-sans text-xs leading-relaxed">
              تعلیمی منہج قرآن مجید کی سلیس تفسیر، مستند احادیث مبارکہ کے اسباق، اور انسان کے باطن کی اصلاح (تزکیہ نفس) پر مرکوز ہے۔
            </p>
          </div>
        </div>

        {/* Core Principles (Honest, authentic, scholarly) */}
        <div className="border-t border-stone-100 pt-8 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#C5A059] font-sans">
            دعوتی و تدریسی اصول
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
              <BookOpen className="w-5 h-5 text-[#0F382A]" />
              <h4 className="font-semibold text-stone-900 font-urdu text-sm">استناد و تحقیق</h4>
              <p className="text-stone-600 leading-relaxed">
                تمام بیانات میں صرف صحیح اور مستند روایات اور سلف صالحین کے متوارث فہم پر اعتماد کیا جاتا ہے۔
              </p>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
              <Heart className="w-5 h-5 text-[#0F382A]" />
              <h4 className="font-semibold text-stone-900 font-urdu text-sm">تزکیہ و اخلاص</h4>
              <p className="text-stone-600 leading-relaxed">
                علم کا اصل مقصد دل کی صفائی اور اللہ تعالی کے ساتھ تعلق کی استواری ہے۔
              </p>
            </div>

            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
              <Award className="w-5 h-5 text-[#0F382A]" />
              <h4 className="font-semibold text-stone-900 font-urdu text-sm">آسانی و اعتدال</h4>
              <p className="text-stone-600 leading-relaxed">
                نبوی اندازِ تدریس پر عمل کرتے ہوئے مسائل میں آسانی، حکمت اور شفقت کو ترجیح دی جاتی ہے۔
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
