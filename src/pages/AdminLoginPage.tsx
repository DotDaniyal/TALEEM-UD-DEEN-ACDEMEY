import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { t, dir, loginAdmin, setCurrentView } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('BayanAdmin2026!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error('صارف کا نام یا پاس ورڈ درست نہیں ہے۔');
      }

      const data = await res.json();
      loginAdmin(data.token);
      setCurrentView('admin-dashboard');
    } catch (err: any) {
      setError(err.message || 'لاگ ان میں خرابی پیش آگئی۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#0F382A]/10 border border-[#0F382A]/20 flex items-center justify-center text-[#0F382A]">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-urdu font-bold text-[#0F382A]">
          {t.adminLoginTitle}
        </h1>
        <p className="text-xs text-stone-500 font-sans">
          والد محترم اور منتظمین کے لیے مخصوص انتظامی پورٹل
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
              {t.adminUsername}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
              {t.adminPassword}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] disabled:opacity-50 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{loading ? 'توثیق جاری ہے...' : t.loginButton}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">نوٹ برائے ٹیسٹنگ:</p>
          <p>ڈیفالٹ ایڈمن پاس ورڈ: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">BayanAdmin2026!</code></p>
        </div>
      </div>
    </div>
  );
};
