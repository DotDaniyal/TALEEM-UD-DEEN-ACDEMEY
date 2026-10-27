import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  BayanSession,
  RecordedBayan,
  AudioBayan,
  SiteConfig,
  AuditLogItem,
  YouTubeDataState,
  YouTubeConfig,
  YouTubeVideo,
  YouTubePlaylist,
  YouTubeSyncLog,
} from '../types';
import { useTranslation } from '../utils/translations';

export type PageView =
  | 'home'
  | 'live'
  | 'join'
  | 'upcoming'
  | 'recordings'
  | 'youtube-library'
  | 'audio-library'
  | 'recording-details'
  | 'youtube-video'
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

  // YouTube Integration Context Fields
  youtubeState: YouTubeDataState | null;
  refreshYouTubeState: () => Promise<void>;
  updateYouTubeConfig: (configUpdate: Partial<YouTubeConfig>) => Promise<void>;
  triggerYouTubeSync: () => Promise<{ success: boolean; log: YouTubeSyncLog }>;
  toggleYouTubeVideoFeatured: (videoId: string) => Promise<void>;
  toggleYouTubeVideoHidden: (videoId: string) => Promise<void>;
  toggleYouTubePlaylistHidden: (playlistId: string) => Promise<void>;
  selectedYouTubeVideo: YouTubeVideo | null;
  setSelectedYouTubeVideo: (video: YouTubeVideo | null) => void;
  selectedYouTubePlaylist: YouTubePlaylist | null;
  setSelectedYouTubePlaylist: (playlist: YouTubePlaylist | null) => void;
}

const defaultSiteConfig: SiteConfig = {
  siteName: 'TALEEM UD DEEN ACADEMY',
  siteNameUrdu: 'تعلیم الدین اکیڈمی',
  siteNameArabic: 'أكاديمية تعليم الدين',
  speakerName: 'Mufti Faisal Hayat',
  speakerNameUrdu: 'مفتی فیصل حیات',
  speakerTitle: 'Senior Islamic Scholar & Founder',
  speakerTitleUrdu: 'فاضلِ دین، استادِ حدیث و سرپرستِ اعلیٰ',
  speakerBio: 'Dedicated to teaching classical Islamic texts, Quranic tafseer, Hadith, and spiritual character building. Founder and principal director of Taleem Ud Deen Academy.',
  speakerBioUrdu: 'کئی دہائیوں سے قرآن و سنت، تفسیرِ قرآن، احادیثِ نبویہ اور تزکیہ نفس کی تدریس سے وابستہ ہیں۔ تعلیم الدین اکیڈمی کے بانی و سرپرست اعلیٰ ہیں۔',
  speakerPhotoUrl: '/src/assets/images/speaker_portrait_1792917987190.jpg',
  contactEmail: 'info@taleemuddeen.academy',
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

  // YouTube State
  const [youtubeState, setYoutubeState] = useState<YouTubeDataState | null>(null);
  const [selectedYouTubeVideo, setSelectedYouTubeVideo] = useState<YouTubeVideo | null>(null);
  const [selectedYouTubePlaylist, setSelectedYouTubePlaylist] = useState<YouTubePlaylist | null>(null);

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

  const refreshYouTubeState = async () => {
    try {
      const res = await fetch('/api/youtube/state');
      if (res.ok) {
        const data = await res.json();
        setYoutubeState(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const updateYouTubeConfig = async (configUpdate: Partial<YouTubeConfig>) => {
    try {
      const res = await fetch('/api/youtube/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configUpdate),
      });
      if (res.ok) {
        const data = await res.json();
        setYoutubeState(data);
        setBannerNotice(t.settingsSaved);
      }
    } catch (err) {
      console.error('Failed to update YouTube config:', err);
    }
  };

  const triggerYouTubeSync = async () => {
    try {
      const res = await fetch('/api/youtube/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setYoutubeState(data.state);
        return { success: data.success, log: data.log };
      }
      throw new Error('Sync endpoint returned error');
    } catch (err: any) {
      return {
        success: false,
        log: {
          id: 'log-err-' + Date.now(),
          timestamp: new Date().toISOString(),
          status: 'error',
          videosImported: 0,
          videosUpdated: 0,
          playlistsImported: 0,
          message: 'Failed to communicate with YouTube sync server.',
          details: err?.message,
        },
      };
    }
  };

  const toggleYouTubeVideoFeatured = async (videoId: string) => {
    try {
      await fetch(`/api/youtube/videos/${videoId}/featured`, { method: 'PATCH' });
      await refreshYouTubeState();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleYouTubeVideoHidden = async (videoId: string) => {
    try {
      await fetch(`/api/youtube/videos/${videoId}/hidden`, { method: 'PATCH' });
      await refreshYouTubeState();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleYouTubePlaylistHidden = async (playlistId: string) => {
    try {
      await fetch(`/api/youtube/playlists/${playlistId}/hidden`, { method: 'PATCH' });
      await refreshYouTubeState();
    } catch (err) {
      console.error(err);
    }
  };

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
    refreshYouTubeState();

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
        youtubeState,
        refreshYouTubeState,
        updateYouTubeConfig,
        triggerYouTubeSync,
        toggleYouTubeVideoFeatured,
        toggleYouTubeVideoHidden,
        toggleYouTubePlaylistHidden,
        selectedYouTubeVideo,
        setSelectedYouTubeVideo,
        selectedYouTubePlaylist,
        setSelectedYouTubePlaylist,
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
