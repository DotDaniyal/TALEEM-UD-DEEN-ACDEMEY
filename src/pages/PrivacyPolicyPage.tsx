import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Lock, EyeOff, Server, HelpCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { t, siteConfig } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-stone-200 pb-6 text-center space-y-2">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          رازداری اور ڈیٹا کا تحفظ
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A]">
          {t.privacyPolicy}
        </h1>
        <p className="text-xs text-stone-500 font-sans">
          آخری تجدید: اکتوبر 2026 | اسلامی اور قانونی تقاضوں کے مطابق
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-10 shadow-xs space-y-8 text-stone-800 text-sm leading-relaxed">
        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            <span>1. ہماری بنیادی ذمہ داری اور اسلامی دیانت</span>
          </h2>
          <p>
            یہ پلیٹ فارم والد محترم کے آن لائن بیانات اور دینی دروس کو پرامن، باعزت اور محفوظ ماحول میں نشر کرنے کے لیے بنایا گیا ہے۔ ہم شرکاء کی ذاتی معلومات، صوتی و بصری رازداری اور حرمت کو شرعی اور اخلاقی فریضہ سمجھتے ہیں۔
          </p>
        </section>

        {/* Section 2: Live Recording & Screen Sharing Disclosure */}
        <section className="space-y-3 p-5 bg-amber-50/60 border border-amber-200 rounded-lg">
          <h2 className="text-lg font-urdu font-semibold text-amber-900 flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-amber-700" />
            <span>2. بیانات کی ریکارڈنگ اور اسکرین شیئرنگ کی وضاحت</span>
          </h2>
          <p className="text-stone-800">
            <strong>واضح اعلان:</strong> ہمارے پلیٹ فارم پر کیمرہ کی سہولت موجود ہی نہیں ہے۔ صرف اور صرف مقررِ محترم (اسپیکر) کے مائیکروفون کی صوتی نشریات اور ان کی جانب سے باقاعدہ اجازت کے ساتھ شیئر کی جانے والی تعلیمی اسکرین کو ریکارڈ کیا جاتا ہے۔
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-700">
            <li>کسی بھی صارف یا اسپیکر سے کیمرہ کی اجازت طلب نہیں کی جاتی۔</li>
            <li>شرکاء کی اسکرین یا براؤزر کی ذاتی سرگرمیوں کو قطعی طور پر ریکارڈ نہیں کیا جاتا۔</li>
            <li>درس کے دوران ریکارڈنگ کا فعال اشارہ (REC) تمام حاضرین کی اسکرین پر واضح طور پر دکھایا جاتا ہے۔</li>
            <li>اگر کوئی شریک سوال و جواب کے دوران مائیک آن کر کے سوال پوچھے تو ان کی آواز ریکارڈ شدہ درس کا حصہ بن سکتی ہے، جس کی اجازت پہلے حاصل کی جاتی ہے۔</li>
          </ul>
        </section>

        {/* Section 3: Data Collection */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#C5A059]" />
            <span>3. ہم کون سا ڈیٹا حاصل کرتے ہیں؟</span>
          </h2>
          <p>
            ہم حاضرین سے کم سے کم ضروری معلومات حاصل کرتے ہیں:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-700">
            <li><strong>نام:</strong> مجلس میں شرکت کے وقت آپ کا فراہم کردہ شناختی نام جو حاضرین کی فہرست میں ظاہر ہوتا ہے۔</li>
            <li><strong>رابطہ فارم:</strong> رابطہ یا دعائیہ استفسار کے وقت فراہم کردہ نام اور ای میل تاکہ آپ کو جواب ارسال کیا جا سکے۔</li>
            <li><strong>تکنیکی لاگز:</strong> سیشن کے دوران رابطہ قائم رکھنے کے لیے عارضی آئی پی ایڈریس اور ویو پورٹ معلومات، جو مجلس ختم ہونے کے بعد خارج کر دی جاتی ہیں۔</li>
          </ul>
        </section>

        {/* Section 4: Storage & Protection */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C5A059]" />
            <span>4. ڈیٹا کا تحفظ اور عدم فروخت</span>
          </h2>
          <p>
            ہم شرکاء کا ڈیٹا کسی بھی اشتہاری کمپنی یا تیسری پارٹی کو کبھی فروخت نہیں کرتے اور نہ ہی تجارتی مقاصد کے لیے استعمال کرتے ہیں۔ ایڈمنسٹریٹر اور اسپیکر کے لاگ ان محفوظ انکرپٹڈ سیشنز کے ذریعے محفوظ ہیں۔
          </p>
        </section>

        {/* Section 5: Contact */}
        <section className="space-y-3 border-t border-stone-100 pt-6">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#C5A059]" />
            <span>5. سوالات اور حذف کی درخواست</span>
          </h2>
          <p>
            اگر آپ کا کوئی سوال ہو یا آپ اپنا کوئی سابقہ پیغام حذف کروانا چاہتے ہوں تو آپ بلا جھجھک <strong className="font-mono text-stone-900">{siteConfig.contactEmail}</strong> پر رابطہ فرما سکتے ہیں۔
          </p>
        </section>
      </div>
    </div>
  );
};
