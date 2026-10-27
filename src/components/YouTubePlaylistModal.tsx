import React from 'react';
import { useApp } from '../context/AppContext';
import { YouTubePlaylist, YouTubeVideo } from '../types';
import { X, Play, Clock, Calendar, ExternalLink, ListVideo } from 'lucide-react';

interface YouTubePlaylistModalProps {
  playlist: YouTubePlaylist;
  videos: YouTubeVideo[];
  onClose: () => void;
  onSelectVideo: (video: YouTubeVideo) => void;
}

export const YouTubePlaylistModal: React.FC<YouTubePlaylistModalProps> = ({
  playlist,
  videos,
  onClose,
  onSelectVideo,
}) => {
  const { t, lang } = useApp();

  const playlistVideos = videos.filter((v) => v.playlistIds.includes(playlist.id));
  const displayTitle = lang === 'ur' && playlist.titleUrdu ? playlist.titleUrdu : playlist.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-[#C5A059]/30 max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F382A] text-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="p-1.5 bg-[#C5A059]/20 text-[#C5A059] rounded-lg">
              <ListVideo className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-semibold truncate">{displayTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Banner */}
        <div className="p-6 bg-stone-100 border-b border-stone-200 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <img
            src={playlist.thumbnailUrl}
            alt={displayTitle}
            className="w-full sm:w-48 h-32 object-cover rounded-xl border border-stone-300 shadow-xs shrink-0"
          />
          <div className="space-y-2 flex-1">
            <h2 className="text-xl font-bold text-stone-900">{displayTitle}</h2>
            {playlist.description && (
              <p className="text-sm text-stone-600 line-clamp-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs font-medium text-stone-700">
              <span className="px-2.5 py-1 bg-[#0F382A]/10 text-[#0F382A] rounded-full">
                {playlistVideos.length} {lang === 'ur' ? 'ویڈیوز' : 'Videos'}
              </span>
              <a
                href={`https://www.youtube.com/playlist?list=${playlist.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#0F382A] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t.ytWatchOnYouTube}
              </a>
            </div>
          </div>
        </div>

        {/* Playlist Videos List */}
        <div className="p-6 overflow-y-auto space-y-3">
          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            {t.ytPlaylists} ({playlistVideos.length})
          </h4>

          {playlistVideos.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-sm">
              {lang === 'ur' ? 'اس پلے لسٹ میں کوئی ویڈیو دستیاب نہیں ہے۔' : 'No videos found in this playlist.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {playlistVideos.map((vid, idx) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    onClose();
                    onSelectVideo(vid);
                  }}
                  className="flex items-center gap-4 p-3 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#0F382A]/40 rounded-xl transition-all cursor-pointer group shadow-xs"
                >
                  <span className="text-xs font-bold text-stone-400 w-6 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-stone-900">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                      <Play className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded font-mono">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h5 className="text-sm font-semibold text-stone-900 truncate group-hover:text-[#0F382A] transition-colors">
                      {lang === 'ur' && vid.titleUrdu ? vid.titleUrdu : vid.title}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C5A059]" />
                        {new Date(vid.publishedAt).toLocaleDateString()}
                      </span>
                      {vid.viewCount > 0 && (
                        <span>{vid.viewCount.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
