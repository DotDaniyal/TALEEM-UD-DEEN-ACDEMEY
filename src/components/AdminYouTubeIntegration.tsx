import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Tv,
  Key,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ListVideo,
  Film,
  Save,
  Activity,
  Layers,
  Search,
} from 'lucide-react';

export const AdminYouTubeIntegration: React.FC = () => {
  const {
    t,
    lang,
    youtubeState,
    updateYouTubeConfig,
    triggerYouTubeSync,
    toggleYouTubeVideoFeatured,
    toggleYouTubeVideoHidden,
    toggleYouTubePlaylistHidden,
  } = useApp();

  const config = youtubeState?.config;
  const videos = youtubeState?.videos || [];
  const playlists = youtubeState?.playlists || [];
  const syncLogs = youtubeState?.syncLogs || [];

  const [channelHandle, setChannelHandle] = useState(config?.channelHandle || '@MuftiFaisalHayat');
  const [apiKey, setApiKey] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(config?.autoSyncEnabled !== false);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(config?.syncIntervalMinutes || 30);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchVideoQuery, setSearchVideoQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateYouTubeConfig({
      channelHandle,
      apiKey: apiKey || undefined,
      autoSyncEnabled,
      syncIntervalMinutes: Number(syncIntervalMinutes),
    });
    setSaveStatus(t.settingsSaved);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerYouTubeSync();
    setIsSyncing(false);
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchVideoQuery.toLowerCase()) ||
      (v.titleUrdu && v.titleUrdu.toLowerCase().includes(searchVideoQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Top Banner Status */}
      <div className="bg-[#0F382A] text-white p-6 rounded-2xl border border-[#C5A059]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/20 text-[#C5A059] rounded-full text-xs font-semibold">
            <Tv className="w-3.5 h-3.5" />
            <span>YouTube Integration Engine</span>
          </div>
          <h2 className="text-xl font-bold">{config?.channelTitleUrdu || config?.channelTitle || 'Mufti Faisal Hayat Channel'}</h2>
          <p className="text-xs text-stone-300">
            {t.ytChannelHandleLabel}: <span className="font-mono text-[#C5A059]">{config?.channelHandle}</span> ({config?.channelId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0F382A] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? t.ytSyncing : t.ytSyncNow}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">{t.ytTotalVideos}</div>
          <div className="text-2xl font-black text-[#0F382A]">{videos.length}</div>
          <div className="text-[11px] text-stone-400">Long-form: {videos.filter((v) => !v.isShort).length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">{t.ytShorts}</div>
          <div className="text-2xl font-black text-rose-600">{videos.filter((v) => v.isShort).length}</div>
          <div className="text-[11px] text-stone-400">Vertical 60s clips</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">{t.ytTotalPlaylists}</div>
          <div className="text-2xl font-black text-[#C5A059]">{playlists.length}</div>
          <div className="text-[11px] text-stone-400">Series & Categorization</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="text-xs text-stone-500 font-medium">{t.ytLastSynced}</div>
          <div className="text-sm font-bold text-stone-800">
            {config?.lastSyncAt ? new Date(config.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Status: {config?.status || 'Active'}</div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#C5A059]" />
            {t.ytConfigureApi}
          </h3>
          {saveStatus && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              {saveStatus}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700">{t.ytChannelHandleLabel}</label>
            <input
              type="text"
              value={channelHandle}
              onChange={(e) => setChannelHandle(e.target.value)}
              placeholder="@MuftiFaisalHayat"
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F382A]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700">{t.ytApiKeyLabel}</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.hasApiKey ? '•••••••••••••••• (API Key active)' : 'Enter YouTube Data API v3 Key'}
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F382A]"
            />
            <p className="text-[11px] text-stone-500">
              Leave blank to use official Channel RSS feed auto-sync fallback.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700">{t.ytSyncIntervalLabel}</label>
            <select
              value={syncIntervalMinutes}
              onChange={(e) => setSyncIntervalMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F382A]"
            >
              <option value={15}>Every 15 Minutes</option>
              <option value={30}>Every 30 Minutes</option>
              <option value={60}>Every 60 Minutes</option>
              <option value={120}>Every 2 Hours</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F382A]" />
            </label>
            <span className="text-xs font-medium text-stone-800">{t.ytAutoSyncLabel}</span>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              {t.saveBayanButton}
            </button>
          </div>
        </form>
      </div>

      {/* Videos Management Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-[#0F382A]" />
              {t.ytAllVideos} ({videos.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Highlight featured bayans or hide specific videos from public display.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchVideoQuery}
              onChange={(e) => setSearchVideoQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0F382A]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-4 text-start">Video</th>
                <th className="p-4 text-start">Duration</th>
                <th className="p-4 text-start">Date</th>
                <th className="p-4 text-start">Featured</th>
                <th className="p-4 text-start">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredVideos.map((vid) => (
                <tr key={vid.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-16 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 truncate max-w-xs sm:max-w-md">
                        {lang === 'ur' && vid.titleUrdu ? vid.titleUrdu : vid.title}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        {vid.isShort && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 font-bold rounded text-[10px]">
                            Shorts
                          </span>
                        )}
                        <span>{vid.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-medium">{vid.duration}</td>

                  <td className="p-4 whitespace-nowrap">
                    {new Date(vid.publishedAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleYouTubeVideoFeatured(vid.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        vid.featured
                          ? 'bg-[#C5A059]/20 border-[#C5A059] text-[#0F382A]'
                          : 'bg-stone-100 border-stone-200 text-stone-400 hover:text-stone-700'
                      }`}
                      title="Toggle Featured"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                    </button>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleYouTubeVideoHidden(vid.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        vid.hidden
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      {vid.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {vid.hidden ? 'Hidden' : 'Public'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Logs Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#C5A059]" />
          {t.ytSyncLogs}
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {syncLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                log.status === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-2">
                  {log.status === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{log.message}</span>
                </div>
                {log.details && <div className="text-[11px] text-stone-500 pl-6">{log.details}</div>}
              </div>

              <span className="text-[11px] font-mono text-stone-500 shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
