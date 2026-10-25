import React from 'react';
import { useApp } from '../context/AppContext';
import { Scale, Users, FileText, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-stone-200 pb-6 text-center space-y-2">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          مجلس کے ضوابط و شرائط
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A]">
          {t.termsAndConditions}
        </h1>
        <p className="text-xs text-stone-500 font-sans">
          آخری تجدید: اکتوبر 2026 | علمی و اخلاقی میثاق
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-10 shadow-xs space-y-8 text-stone-800 text-sm leading-relaxed">
        {/* Section 1: Decorum */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C5A059]" />
            <span>1. دینی مجالس کے آداب اور حسنِ اخلاق</span>
          </h2>
          <p>
            علمِ دین کی مجالس میں شرکت اللہ تعالی کے قرب اور روحانی تزکیہ کا ذریعہ ہے۔ تمام حاضرین سے توقع کی جاتی ہے کہ وہ گفتگو اور سوال و جواب کے دوران احترام، سنجیدگی اور ادب کا مکمل لحاظ رکھیں۔ کسی بھی قسم کی بدتمیزی، فرقہ وارانہ منافرت یا غیر اخلاقی گفتگو کی اجازت نہیں ہوگی۔
          </p>
        </section>

        {/* Section 2: Host Authority */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C5A059]" />
            <span>2. میزبان کے انتظامی اختیارات</span>
          </h2>
          <p>
            مجلس کے نظم و ضبط کو برقرار رکھنے کے لیے میزبان کو یہ مکمل شرعی اور انتظامی حق حاصل ہے کہ:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-700">
            <li>کسی بھی شریک کا مائیکروفون ضرورت پڑنے پر خاموش (Mute) کر دیں۔</li>
            <li>خلل ڈالنے والے یا نامناسب رویہ اختیار کرنے والے صارف کو مجلس سے خارج (Remove) کر دیں۔</li>
            <li>ضرورت کے تحت سوال و جواب یا گفتگو کو اعتدال پر لانے کے لیے ماڈریٹ کریں۔</li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property & Permissible Sharing */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A059]" />
            <span>3. علمی مواد اور نشرو اشاعت کے حقوق</span>
          </h2>
          <p>
            اس پلیٹ فارم پر موجود تمام بیانات، تفاسیر اور صوتی و بصری مواد دینی نفع اور تبلیغِ حق کے لیے عام کیے گئے ہیں۔ آپ ان لنکس اور ویڈیوز کو اپنے دوستوں، رشتہ داروں اور سوشل میڈیا پر بغیر کسی تحریف اور سیاق و سباق کو بگاڑے شیئر کر سکتے ہیں۔ تجارتی فروخت یا اپنے نام سے منسوب کرنے کی شرعاً اجازت نہیں ہے۔
          </p>
        </section>

        {/* Section 4: Service Availability */}
        <section className="space-y-3">
          <h2 className="text-lg font-urdu font-semibold text-[#0F382A] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C5A059]" />
            <span>4. انٹرنیٹ اور تکنیکی حدود</span>
          </h2>
          <p>
            اگرچہ ہم رابطہ کو مستحکم رکھنے کی پوری کوشش کرتے ہیں، تاہم انٹرنیٹ کے اتار چڑھاؤ یا بین الاقوامی بینڈوڈتھ کے مسائل کے باعث وقتی تعطل آ سکتا ہے۔ ایسے موقع پر دوبارہ رابطہ کا بٹن (Reconnect) استعمال فرمائیں۔
          </p>
        </section>
      </div>
    </div>
  );
};
