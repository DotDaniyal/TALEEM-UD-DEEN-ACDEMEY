import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YouTubeVideo } from '../types';
import { X, Share2, ExternalLink, Calendar, Clock, Eye, Check, Play, ThumbsUp } from 'lucide-react';

interface YouTubeVideoModalProps {
  video: YouTubeVideo;
  onClose: () => void;
}

export const YouTubeVideoModal: React.FC<YouTubeVideoModalProps> = ({ video, onClose }) => {
  const { t, lang, dir, setSelectedYouTubeVideo } = useApp();
  const [copied, setCopied] = useState(false);

  const displayTitle = lang === 'ur' && video.titleUrdu ? video.titleUrdu : video.title;
  const shareUrl = `https://www.youtube.com/watch?v=${video.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*${displayTitle}*\n${t.ytLibraryTitle}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-[#C5A059]/30 max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F382A] text-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="p-1.5 bg-[#C5A059]/20 text-[#C5A059] rounded-lg">
              <Play className="w-5 h-5 fill-current" />
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

        {/* Video Embed Frame */}
        <div className="relative w-full bg-black aspect-video shrink-0">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={displayTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">{displayTitle}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                  {new Date(video.publishedAt).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  {video.duration}
                </span>
                {video.viewCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                    {video.viewCount.toLocaleString()} {lang === 'ur' ? 'مشاہدات' : 'views'}
                  </span>
                )}
                {video.likeCount && video.likeCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#C5A059]" />
                    {video.likeCount.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                {t.shareViaWhatsapp}
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                {copied ? t.linkCopied : t.copyLink}
              </button>
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F382A] hover:bg-[#0B281E] rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                {t.ytWatchOnYouTube}
              </a>
            </div>
          </div>

          {/* Video Description */}
          {video.description && (
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                {t.ytVideoDetails}
              </h4>
              <p className="text-sm text-stone-800 whitespace-pre-line leading-relaxed dir-auto">
                {video.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
