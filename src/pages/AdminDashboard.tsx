import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateRoomCode } from '../utils/bayan-logic';
import { AdminYouTubeIntegration } from '../components/AdminYouTubeIntegration';
import {
  Video,
  Plus,
  Trash2,
  Settings,
  Calendar,
  Disc,
  Activity,
  LogOut,
  Save,
  Check,
  Share2,
  Copy,
  ExternalLink,
  Tv,
  Database,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    t,
    lang,
    siteConfig,
    updateSiteConfig,
    sessions,
    createSession,
    updateSessionStatus,
    recordings,
    deleteRecording,
    logoutAdmin,
    auditLogs,
    setSelectedRoomCode,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bayans' | 'recordings' | 'youtube' | 'sheets' | 'branding' | 'system'>('bayans');
  const [sheetsState, setSheetsState] = useState<any>(null);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);

  const fetchSheetsState = async () => {
    try {
      const res = await fetch('/api/sheets/state');
      if (res.ok) {
        const data = await res.json();
        setSheetsState(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSheetsSync = async () => {
    setSheetsSyncing(true);
    try {
      const res = await fetch('/api/sheets/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSheetsState(data.state);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSheetsSyncing(false);
    }
  };

  // Form State for New Bayan
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitleUrdu, setNewTitleUrdu] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCategoryUrdu, setNewCategoryUrdu] = useState('تفسیرِ قرآن');
  const [newScheduledDate, setNewScheduledDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
  );
  const [newDescriptionUrdu, setNewDescriptionUrdu] = useState('');
  const [newDuration, setNewDuration] = useState(60);

  // Form State for Branding / Speaker config
  const [speakerNameUrdu, setSpeakerNameUrdu] = useState(siteConfig.speakerNameUrdu);
  const [speakerTitleUrdu, setSpeakerTitleUrdu] = useState(siteConfig.speakerTitleUrdu);
  const [speakerBioUrdu, setSpeakerBioUrdu] = useState(siteConfig.speakerBioUrdu);
  const [contactEmail, setContactEmail] = useState(siteConfig.contactEmail);
  const [contactPhone, setContactPhone] = useState(siteConfig.contactPhone);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Handle Create Bayan
  const handleCreateBayan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleUrdu.trim()) return;

    const roomCode = generateRoomCode('bayan');
    await createSession({
      title: newTitleEn || newTitleUrdu,
      titleUrdu: newTitleUrdu,
      category: 'Tafseer',
      categoryUrdu: newCategoryUrdu,
      scheduledAt: new Date(newScheduledDate).toISOString(),
      durationMinutes: newDuration,
      description: newDescriptionUrdu,
      descriptionUrdu: newDescriptionUrdu,
      roomCode,
      status: 'scheduled',
      isRecorded: true,
      guestAccessAllowed: true,
      qnaEnabled: true,
      chatEnabled: true,
    });

    setShowCreateModal(false);
    setNewTitleUrdu('');
    setNewTitleEn('');
    setNewDescriptionUrdu('');
  };

  // Launch Studio for a Session
  const handleLaunchStudio = (roomCode: string) => {
    setSelectedRoomCode(roomCode);
    setCurrentView('live');
  };

  // Handle Update Branding
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteConfig({
      speakerNameUrdu,
      speakerTitleUrdu,
      speakerBioUrdu,
      contactEmail,
      contactPhone,
    });
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  // Total storage calculated
  const totalStorageBytes = recordings.reduce((acc, r) => acc + (r.fileSizeBytes || 350000000), 0);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="bg-[#0F382A] text-stone-100 rounded-xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#C5A059] font-sans">
            لوحة التحكم الإدارية
          </div>
          <h1 className="text-2xl sm:text-3xl font-urdu font-bold text-white mt-1">
            {t.adminDashboard}
          </h1>
          <p className="text-xs text-stone-300 font-sans mt-1">
            خوش آمدید والد محترم! بیانات کا انعقاد، لائیو اسٹوڈیو کا انتظام اور علمی ذخیرے کی ترتیبات۔
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 text-xs font-semibold text-[#0F382A] bg-[#C5A059] hover:bg-[#d6b26c] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createNewBayan}</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="px-3.5 py-2.5 text-xs font-medium text-stone-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logoutButton}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Anti-slop zero pill tabs) */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('bayans')}
          className={`py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'bayans'
              ? 'bg-[#0F382A] text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>بیانات کا شیڈول ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recordings')}
          className={`py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'recordings'
              ? 'bg-[#0F382A] text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100'
          }`}
        >
          <Disc className="w-3.5 h-3.5" />
          <span>محفوظ بیانات ({recordings.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sheets');
            fetchSheetsState();
          }}
          className={`py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sheets'
              ? 'bg-[#0F382A] text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>گوگل شیٹس CMS (7 ورک شیٹس)</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-[#0F382A] text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>پلیٹ فارم و سوانح کی ترتیبات</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`py-2 px-4 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-[#0F382A] text-white font-semibold'
              : 'text-stone-600 hover:text-stone-900 bg-stone-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>سسٹم ہیلتھ و لاگز</span>
        </button>
      </div>

      {/* TAB: YOUTUBE INTEGRATION */}
      {activeTab === 'youtube' && <AdminYouTubeIntegration />}

      {/* TAB: GOOGLE SHEETS CMS */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#C5A059] font-sans font-bold">
                  GOOGLE SHEETS CLOUD CMS
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-700 font-semibold font-sans">
                  7 Worksheets Connected
                </span>
              </div>
              <h3 className="text-xl font-urdu font-bold text-[#0F382A] mt-1">
                گوگل شیٹس کلاؤڈ کنٹینٹ مینجمنٹ سسٹم
              </h3>
              <p className="text-xs text-stone-600 font-sans mt-0.5">
                فائل انضمام: {sheetsState?.config?.spreadsheetId || '1TaleemUdDeenAcademy_GoogleSheetsCMS_2026'}
              </p>
            </div>

            <button
              onClick={handleTriggerSheetsSync}
              disabled={sheetsSyncing}
              className="px-4 py-2.5 bg-[#0F382A] hover:bg-[#0B281E] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer shrink-0 disabled:bg-stone-300"
            >
              <RefreshCw className={`w-4 h-4 text-[#C5A059] ${sheetsSyncing ? 'animate-spin' : ''}`} />
              <span>{sheetsSyncing ? 'مزامنہ جاری ہے...' : '2-Way سنک ٹریگر کریں'}</span>
            </button>
          </div>

          {/* 7 Logical Worksheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(sheetsState?.worksheets || [
              { name: 'Videos', rowCount: 120, colCount: 14, fields: ['youtube_id', 'title', 'duration', 'media_url'] },
              { name: 'Playlists', rowCount: 18, colCount: 7, fields: ['playlist_id', 'title', 'video_count'] },
              { name: 'Playlist Videos', rowCount: 240, colCount: 4, fields: ['playlist_id', 'video_id', 'position'] },
              { name: 'Sync Settings', rowCount: 12, colCount: 4, fields: ['key', 'value', 'updated_at'] },
              { name: 'Sync Logs', rowCount: 45, colCount: 5, fields: ['id', 'timestamp', 'status', 'message'] },
              { name: 'Media Storage', rowCount: 32, colCount: 7, fields: ['id', 'video_id', 'storage_provider', 'cdn_url'] },
              { name: 'Import Jobs', rowCount: 10, colCount: 7, fields: ['id', 'job_type', 'status', 'progress'] },
            ]).map((ws: any) => (
              <div key={ws.name} className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-sans text-[#0F382A]">
                    📋 Worksheet: {ws.name}
                  </h4>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    Active
                  </span>
                </div>

                <div className="text-xs text-stone-600 font-mono flex items-center justify-between pt-1">
                  <span>ریکارڈز: {ws.rowCount} rows</span>
                  <span>کالمز: {ws.colCount} cols</span>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 font-sans tracking-wider block">
                    کالم فیلڈز:
                  </span>
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono text-stone-600">
                    {ws.fields.slice(0, 4).map((f: string) => (
                      <span key={f} className="bg-stone-100 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                    {ws.fields.length > 4 && (
                      <span className="text-stone-400">+{ws.fields.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: BAYANS MANAGEMENT */}
      {activeTab === 'bayans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-sans">
                    <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                      session.status === 'live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {session.status === 'live' ? 'براہِ راست جاری ہے' : 'طے شدہ'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{new Date(session.scheduledAt).toLocaleString()}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.categoryUrdu}</span>
                  </div>

                  <h3 className="text-xl font-urdu font-bold text-[#0F382A]">
                    {session.titleUrdu}
                  </h3>

                  <p className="text-xs text-stone-600 max-w-xl">
                    {session.descriptionUrdu}
                  </p>

                  <div className="text-xs font-mono text-stone-500 pt-1">
                    کمرہ کوڈ: <span className="font-bold text-stone-800">{session.roomCode}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleLaunchStudio(session.roomCode)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>اسٹوڈیو میں جائیں</span>
                  </button>

                  {session.status !== 'ended' && (
                    <button
                      onClick={() => updateSessionStatus(session.id, 'ended')}
                      className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-md transition-colors cursor-pointer"
                    >
                      مکمل نشان زد کریں
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECORDED BAYANS MANAGEMENT */}
      {activeTab === 'recordings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span>کل محفوظ بیانات: {recordings.length}</span>
              <span>مجموعی میموری: {totalStorageMB} MB</span>
            </div>

            <div className="divide-y divide-stone-100">
              {recordings.map((rec) => (
                <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      className="w-16 h-12 object-cover rounded bg-stone-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-urdu font-semibold text-[#0F382A]">
                        {rec.titleUrdu}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-sans">
                        <span>{rec.categoryUrdu}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rec.recordedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">عوامی</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (confirm(t.confirmDelete)) {
                          deleteRecording(rec.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING & SPEAKER PROFILE */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs max-w-3xl space-y-6">
          <h3 className="text-lg font-urdu font-bold text-[#0F382A]">
            والد محترم کا پروفائل اور دعوتی معلومات
          </h3>

          {configSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t.settingsSaved}</span>
            </div>
          )}

          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                مقررِ محترم کا نام (اردو)
              </label>
              <input
                type="text"
                required
                value={speakerNameUrdu}
                onChange={(e) => setSpeakerNameUrdu(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                علمی و تدریسی عنوان / خطاب
              </label>
              <input
                type="text"
                required
                value={speakerTitleUrdu}
                onChange={(e) => setSpeakerTitleUrdu(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                سوانح حیات و تعارف
              </label>
              <textarea
                rows={4}
                required
                value={speakerBioUrdu}
                onChange={(e) => setSpeakerBioUrdu(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                  ای میل پتہ
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 font-sans">
                  رابطہ نمبر
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>ترتیبات محفوظ کریں</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & AUDIT LOGS */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-sans">سرور کی کیفیت</span>
              <p className="text-xl font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>مستحکم اور فعال</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-sans">استعمال شدہ اسٹوریج</span>
              <p className="text-xl font-bold font-mono text-stone-900">{totalStorageMB} MB</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200 space-y-1">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-sans">WebRTC سگنلنگ</span>
              <p className="text-xl font-bold text-emerald-700">WebSocket لائیو</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-urdu font-bold text-[#0F382A]">
              سیکیورٹی اور سرگرمی لاگز (Audit Logs)
            </h3>
            <div className="divide-y divide-stone-100 text-xs font-sans">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-800">{log.action}: </span>
                    <span className="text-stone-600">{log.details}</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE BAYAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-stone-200 shadow-xl">
            <h3 className="text-xl font-urdu font-bold text-[#0F382A]">
              {t.createNewBayan}
            </h3>

            <form onSubmit={handleCreateBayan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-sans">
                  {t.bayanTitleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newTitleUrdu}
                  onChange={(e) => setNewTitleUrdu(e.target.value)}
                  placeholder="مثلاً: تفسیر سورۃ یوسف"
                  className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-sans">
                  موضوعاتی زمرہ
                </label>
                <select
                  value={newCategoryUrdu}
                  onChange={(e) => setNewCategoryUrdu(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                >
                  <option value="تفسیرِ قرآن">تفسیرِ قرآن</option>
                  <option value="حدیث شریف">حدیث شریف</option>
                  <option value="تزکیہ و احسان">تزکیہ و احسان</option>
                  <option value="خاندانی تربیت">خاندانی تربیت</option>
                  <option value="عبادات و فضائل">عبادات و فضائل</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-sans">
                    {t.scheduledDateLabel}
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newScheduledDate}
                    onChange={(e) => setNewScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-sans">
                    دورانیہ (منٹ)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-sans">
                  {t.bayanDescriptionLabel}
                </label>
                <textarea
                  rows={3}
                  value={newDescriptionUrdu}
                  onChange={(e) => setNewDescriptionUrdu(e.target.value)}
                  placeholder="بیان کے اہم موضوعاتی نکات..."
                  className="w-full px-4 py-2 text-xs bg-stone-50 border border-stone-300 rounded-md focus:outline-none focus:border-[#0F382A]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  {t.saveBayanButton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
