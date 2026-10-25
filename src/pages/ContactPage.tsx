import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MessageCircle, Send, Check } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { t, siteConfig } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-3 border-b border-stone-200 pb-6">
        <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
          رابطہ و دعائیہ درخواستیں
        </div>
        <h1 className="text-3xl font-urdu font-bold text-[#0F382A]">
          {t.contactUs}
        </h1>
        <p className="text-sm text-stone-600 font-sans max-w-lg mx-auto">
          کسی علمی یا فقہی استفسار، دعائیہ درخواست یا مشورے کے لیے درج ذیل فارم کے ذریعے رابطہ فرما سکتے ہیں۔
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2">
            <Mail className="w-5 h-5 text-[#0F382A]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans">
              برقی پتہ (ای میل)
            </h4>
            <p className="text-xs font-mono text-stone-800 break-all">
              {siteConfig.contactEmail}
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2">
            <Phone className="w-5 h-5 text-[#0F382A]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans">
              رابطہ نمبر
            </h4>
            <p className="text-xs font-mono text-stone-800">
              {siteConfig.contactPhone}
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs space-y-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans">
              واٹس ایپ کمیونٹی
            </h4>
            <a
              href={siteConfig.whatsappCommunityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#0F382A] hover:underline block"
            >
              کمیونٹی میں شامل ہوں
            </a>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-stone-200 p-8 shadow-xs">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
              <Check className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-urdu text-base font-semibold text-emerald-900">
                {t.messageSentSuccess}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد بلال"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bilal@example.com"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                  {t.messageLabel}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اپنا پیغام، دعائیہ درخواست یا سوال تحریر فرمائیں..."
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendInquiry}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
