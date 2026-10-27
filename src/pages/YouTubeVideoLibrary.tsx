import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { YouTubeVideo, YouTubePlaylist } from '../types';
import { YouTubeVideoModal } from '../components/YouTubeVideoModal';
import { YouTubePlaylistModal } from '../components/YouTubePlaylistModal';
import {
  Search,
  Filter,
  Play,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  ListVideo,
  Eye,
  ExternalLink,
  Film,
  CheckCircle2,
  Tv,
} from 'lucide-react';

export const YouTubeVideoLibrary: React.FC = () => {
  const {
    t,
    lang,
    dir,
    youtubeState,
    triggerYouTubeSync,
    selectedYouTubeVideo,
    setSelectedYouTubeVideo,
    selectedYouTubePlaylist,
    setSelectedYouTubePlaylist,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'shorts' | 'playlists'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');
  const [isSyncing, setIsSyncing] = useState(false);

  const videos = youtubeState?.videos || [];
  const playlists = youtubeState?.playlists || [];
  const config = youtubeState?.config;

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerYouTubeSync();
    setIsSyncing(false);
  };

  // Filtered and Sorted Videos
  const processedVideos = useMemo(() => {
    let result = videos.filter((v) => !v.hidden);

    // Filter by tab
    if (activeTab === 'featured') {
      result = result.filter((v) => v.featured);
    } else if (activeTab === 'shorts') {
      result = result.filter((v) => v.isShort);
    } else if (activeTab === 'all') {
      result = result.filter((v) => !v.isShort);
    }

    // Filter by playlist
    if (selectedPlaylistId !== 'all') {
      result = result.filter((v) => v.playlistIds.includes(selectedPlaylistId));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.titleUrdu && v.titleUrdu.toLowerCase().includes(q)) ||
          v.description.toLowerCase().includes(q)
      );
    }

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      } else if (sortBy === 'views') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      }
      return 0;
    });
  }, [videos, activeTab, selectedPlaylistId, searchQuery, sortBy]);

  const visiblePlaylists = useMemo(() => {
    return playlists.filter((p) => !p.hidden);
  }, [playlists]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Hero Banner Header */}
      <section className="relative bg-[#0F382A] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C5A059]/30 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-[#C5A059]_1px,transparent_1px] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 rounded-full text-xs font-semibold">
              <Tv className="w-3.5 h-3.5" />
              <span>{config?.channelHandle || '@MuftiFaisalHayat'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {t.ytLibraryTitle}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              {t.ytLibrarySubtitle}
            </p>
          </div>

          {/* Sync Status Badge & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-xs shrink-0">
            <div className="text-xs space-y-1">
              <div className="text-stone-300">
                {t.ytLastSynced}{' '}
                <span className="text-white font-medium">
                  {config?.lastSyncAt
                    ? new Date(config.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </span>
              </div>
              <div className="text-stone-300">
                {t.ytTotalVideos}: <span className="text-[#C5A059] font-bold">{videos.length}</span> |{' '}
                {t.ytTotalPlaylists}: <span className="text-[#C5A059] font-bold">{playlists.length}</span>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5A059] hover:bg-[#b08d4a] text-[#0F382A] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t.ytSyncing : t.ytSyncNow}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#0F382A] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Film className="w-4 h-4" />
              {t.ytAllVideos} ({videos.filter((v) => !v.isShort).length})
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'bg-[#0F382A] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              {t.ytFeatured} ({videos.filter((v) => v.featured).length})
            </button>

            <button
              onClick={() => setActiveTab('shorts')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'shorts'
                  ? 'bg-[#0F382A] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Film className="w-4 h-4 text-rose-500" />
              {t.ytShorts} ({videos.filter((v) => v.isShort).length})
            </button>

            <button
              onClick={() => setActiveTab('playlists')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'playlists'
                  ? 'bg-[#0F382A] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <ListVideo className="w-4 h-4 text-[#C5A059]" />
              {t.ytPlaylists} ({visiblePlaylists.length})
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab !== 'playlists' && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F382A]"
                />
              </div>

              {/* Playlist Filter Dropdown */}
              <select
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F382A]"
              >
                <option value="all">{t.allCategories}</option>
                {visiblePlaylists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {lang === 'ur' && pl.titleUrdu ? pl.titleUrdu : pl.title}
                  </option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F382A]"
              >
                <option value="newest">{lang === 'ur' ? 'جدید ترین' : 'Newest First'}</option>
                <option value="oldest">{lang === 'ur' ? 'قدیم ترین' : 'Oldest First'}</option>
                <option value="views">{lang === 'ur' ? 'سب سے زیادہ دیکھے گئے' : 'Most Viewed'}</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1, 2, 3: Videos Grid / Shorts Grid */}
        {activeTab !== 'playlists' && (
          <div>
            {processedVideos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                <Film className="w-12 h-12 mx-auto text-stone-300" />
                <h3 className="text-base font-bold text-stone-700">
                  {lang === 'ur' ? 'کوئی ویڈیو موصول نہیں ہوئی۔' : 'No videos found matching your filters.'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'ur' ? 'تلاش کی عبارت تبدیل کریں یا تمام ویڈیوز ملاحظہ فرمائیں۔' : 'Try searching for a different keyword.'}
                </p>
              </div>
            ) : activeTab === 'shorts' ? (
              /* Shorts Layout (Vertical 9:16 Aspect) */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {processedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedYouTubeVideo(vid)}
                    className="group bg-white rounded-2xl border border-stone-200 hover:border-[#0F382A] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[9/16] bg-stone-900 overflow-hidden">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors flex flex-col justify-between p-3">
                        <div className="self-end px-2 py-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                          Shorts
                        </div>
                        <div className="space-y-1 text-white">
                          <p className="text-xs font-bold line-clamp-2 leading-snug">
                            {lang === 'ur' && vid.titleUrdu ? vid.titleUrdu : vid.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-300">
                            <Clock className="w-3 h-3 text-[#C5A059]" />
                            <span>{vid.duration}</span>
                            {vid.viewCount > 0 && (
                              <span>• {vid.viewCount.toLocaleString()} views</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Standard Video Cards Grid (16:9 Aspect) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedYouTubeVideo(vid)}
                    className="group bg-white rounded-2xl border border-stone-200 hover:border-[#0F382A]/50 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video bg-stone-900 overflow-hidden">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#0F382A]/90 text-[#C5A059] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Pill */}
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-xs font-mono font-medium rounded-md backdrop-blur-xs">
                        {vid.duration}
                      </span>

                      {/* Category Tag */}
                      {vid.categoryUrdu && (
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-[#0F382A]/90 text-[#FAF7F2] text-[11px] font-medium rounded-md backdrop-blur-xs border border-[#C5A059]/30">
                          {vid.categoryUrdu}
                        </span>
                      )}
                    </div>

                    {/* Meta Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-stone-900 group-hover:text-[#0F382A] transition-colors leading-snug line-clamp-2">
                          {lang === 'ur' && vid.titleUrdu ? vid.titleUrdu : vid.title}
                        </h3>
                        {vid.description && (
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                          {new Date(vid.publishedAt).toLocaleDateString()}
                        </span>
                        {vid.viewCount > 0 && (
                          <span className="flex items-center gap-1 text-stone-600">
                            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                            {vid.viewCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Playlists Grid */}
        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedYouTubePlaylist(pl)}
                className="group bg-white rounded-2xl border border-stone-200 hover:border-[#0F382A]/50 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video bg-stone-900 overflow-hidden">
                  <img
                    src={pl.thumbnailUrl}
                    alt={pl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="p-3 bg-[#0F382A]/90 text-white rounded-2xl flex items-center gap-2 group-hover:scale-105 transition-transform shadow-md">
                      <ListVideo className="w-5 h-5 text-[#C5A059]" />
                      <span className="text-xs font-bold">{t.ytPlayPlaylist}</span>
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                    {pl.itemCount} {lang === 'ur' ? 'ویڈیوز' : 'Videos'}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-[#0F382A] transition-colors">
                    {lang === 'ur' && pl.titleUrdu ? pl.titleUrdu : pl.title}
                  </h3>
                  {pl.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {pl.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      {selectedYouTubeVideo && (
        <YouTubeVideoModal
          video={selectedYouTubeVideo}
          onClose={() => setSelectedYouTubeVideo(null)}
        />
      )}

      {/* Playlist Modal Viewer */}
      {selectedYouTubePlaylist && (
        <YouTubePlaylistModal
          playlist={selectedYouTubePlaylist}
          videos={videos}
          onClose={() => setSelectedYouTubePlaylist(null)}
          onSelectVideo={(v) => setSelectedYouTubeVideo(v)}
        />
      )}
    </div>
  );
};
