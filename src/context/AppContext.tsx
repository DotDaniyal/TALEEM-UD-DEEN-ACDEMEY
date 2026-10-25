import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, BayanSession, RecordedBayan, AudioBayan, SiteConfig, AuditLogItem } from '../types';
import { useTranslation } from '../utils/translations';

export type PageView =
  | 'home'
  | 'live'
  | 'join'
  | 'upcoming'
  | 'recordings'
  | 'audio-library'
  | 'recording-details'
  | 'speaker'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'admin-login'
  | 'admin-dashboard';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: ReturnType<typeof useTranslation>;
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  selectedRecordingId: string | null;
  setSelectedRecordingId: (id: string | null) => void;
  selectedRoomCode: string;
  setSelectedRoomCode: (code: string) => void;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => Promise<void>;
  sessions: BayanSession[];
  refreshSessions: () => Promise<void>;
  createSession: (data: Partial<BayanSession>) => Promise<BayanSession>;
  updateSessionStatus: (id: string, status: 'scheduled' | 'live' | 'ended') => Promise<void>;
  recordings: RecordedBayan[];
  refreshRecordings: () => Promise<void>;
  saveRecording: (recording: Partial<RecordedBayan>) => Promise<RecordedBayan>;
  deleteRecording: (id: string) => Promise<void>;
  audioBayans: AudioBayan[];
  refreshAudioBayans: () => Promise<void>;
  currentAudioTrack: AudioBayan | null;
  setCurrentAudioTrack: (track: AudioBayan | null) => void;
  audioPlaying: boolean;
  setAudioPlaying: (playing: boolean) => void;
  isAdmin: boolean;
  adminToken: string | null;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  auditLogs: AuditLogItem[];
  bannerNotice: string | null;
  setBannerNotice: (msg: string | null) => void;
}

const defaultSiteConfig: SiteConfig = {
  siteName: 'Islamic Bayan Online',
  siteNameUrdu: 'اسلامی بیانات آن لائن',
  siteNameArabic: 'منصة المحاضرات الإسلامية',
  speakerName: 'Dr. Muhammad Farooq (Father)',
  speakerNameUrdu: 'ڈاکٹر محمد فاروق (والد محترم)',
  speakerTitle: 'Senior Scholar & Teacher of Hadith',
  speakerTitleUrdu: 'سینئر استادِ حدیث و علومِ شریعت',
  speakerBio: 'Dedicated to teaching classical Islamic texts, Quranic tafseer, and spiritual character building for over 35 years. Graduated in Islamic studies and continues to mentor students and families worldwide.',
  speakerBioUrdu: 'گزشتہ ۳۵ برس سے زائد عرصے سے علومِ قرآن و سنت، تزکیہ نفس اور اخلاقی تربیت کی تدریس میں مصروف عمل ہیں۔ دنیا بھر کے طالبانِ خیر کے لیے باقاعدہ مجالس کا اہتمام فرماتے ہیں۔',
  speakerPhotoUrl: '/src/assets/images/speaker_portrait_1792917987190.jpg',
  contactEmail: 'contact@islamic-bayan.online',
  contactPhone: '+92 300 1234567',
  whatsappCommunityLink: 'https://chat.whatsapp.com/sample-community',
  donationAccount: 'PK12-MEZN-0000-1111-2222',
  donationBank: 'Meezan Islamic Bank',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Urdu is default language per user requirements
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('islamic_bayan_lang');
    return (saved === 'ar' || saved === 'en' || saved === 'ur') ? saved : 'ur';
  });

  const [currentView, setCurrentView] = useState<PageView>('home');
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>('kahf-live-2026');
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [sessions, setSessions] = useState<BayanSession[]>([]);
  const [recordings, setRecordings] = useState<RecordedBayan[]>([]);
  const [audioBayans, setAudioBayans] = useState<AudioBayan[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioBayan | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('islamic_bayan_token'));
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const t = useTranslation(lang);
  const dir = t.dir as 'rtl' | 'ltr';

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('islamic_bayan_lang', newLang);
  };

  // Sync document direction and lang
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  // Initial data loading from server
  const refreshSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const refreshRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const refreshAudioBayans = async () => {
    try {
      const res = await fetch('/api/audio-bayans');
      if (res.ok) {
        const data = await res.json();
        setAudioBayans(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const refreshSiteConfig = async () => {
    try {
      const res = await fetch('/api/site-config');
      if (res.ok) {
        const data = await res.json();
        setSiteConfig(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const refreshAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    refreshSessions();
    refreshRecordings();
    refreshAudioBayans();
    refreshSiteConfig();
    refreshAuditLogs();

    // Check URL parameters for direct join links like /join?session=xyz
    const params = new URLSearchParams(window.location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      setSelectedRoomCode(sessionParam);
      setCurrentView('join');
    }
  }, []);

  const updateSiteConfig = async (configUpdate: Partial<SiteConfig>) => {
    try {
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configUpdate),
      });
      if (res.ok) {
        const data = await res.json();
        setSiteConfig(data.siteConfig);
        setBannerNotice(t.settingsSaved);
      }
    } catch {
      setSiteConfig((prev) => ({ ...prev, ...configUpdate }));
    }
  };

  const createSession = async (data: Partial<BayanSession>): Promise<BayanSession> => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create session');
    const created = await res.json();
    setSessions((prev) => [created, ...prev]);
    return created;
  };

  const updateSessionStatus = async (id: string, status: 'scheduled' | 'live' | 'ended') => {
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const saveRecording = async (recData: Partial<RecordedBayan>): Promise<RecordedBayan> => {
    const res = await fetch('/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recData),
    });
    if (!res.ok) throw new Error('Failed to save recording');
    const saved = await res.json();
    setRecordings((prev) => [saved, ...prev]);
    return saved;
  };

  const deleteRecording = async (id: string) => {
    const res = await fetch(`/api/recordings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete recording');
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const loginAdmin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('islamic_bayan_token', token);
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('islamic_bayan_token');
    setCurrentView('home');
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        dir,
        t,
        currentView,
        setCurrentView,
        selectedRecordingId,
        setSelectedRecordingId,
        selectedRoomCode,
        setSelectedRoomCode,
        siteConfig,
        updateSiteConfig,
        sessions,
        refreshSessions,
        createSession,
        updateSessionStatus,
        recordings,
        refreshRecordings,
        saveRecording,
        deleteRecording,
        isAdmin: !!adminToken,
        adminToken,
        loginAdmin,
        logoutAdmin,
        auditLogs,
        bannerNotice,
        setBannerNotice,
        audioBayans,
        refreshAudioBayans,
        currentAudioTrack,
        setCurrentAudioTrack,
        audioPlaying,
        setAudioPlaying,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
