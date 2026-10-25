import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/bayan-logic';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  Download,
  Headphones,
} from 'lucide-react';

export const AudioPlayerBar: React.FC = () => {
  const {
    currentAudioTrack,
    setCurrentAudioTrack,
    audioPlaying,
    setAudioPlaying,
  } = useApp();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !currentAudioTrack) return;
    if (audioPlaying) {
      audioRef.current.play().catch(() => {
        // Autoplay may be restricted until user gesture
      });
    } else {
      audioRef.current.pause();
    }
  }, [audioPlaying, currentAudioTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentAudioTrack?.durationSeconds || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!currentAudioTrack) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0F382A] text-stone-100 border-t border-[#C5A059]/40 shadow-2xl px-4 py-3">
      <audio
        ref={audioRef}
        src={currentAudioTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setAudioPlaying(false)}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-urdu font-bold truncate text-white">
              {currentAudioTrack.titleUrdu}
            </h4>
            <p className="text-[11px] text-stone-300 font-urdu truncate">
              {currentAudioTrack.speakerUrdu} · {currentAudioTrack.categoryUrdu}
            </p>
          </div>
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSkip(-10)}
              className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="10 سیکنڈ پیچھے"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAudioPlaying(!audioPlaying)}
              className="w-9 h-9 rounded-full bg-[#C5A059] text-stone-900 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
              title={audioPlaying ? 'وقفہ' : 'سنیں'}
            >
              {audioPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ms-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="10 سیکنڈ آگے"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2 w-full text-[11px] font-mono text-stone-300">
            <span className="w-10 text-end">{formatDuration(Math.floor(currentTime))}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-[#C5A059] cursor-pointer h-1.5 bg-stone-700 rounded-lg"
            />
            <span className="w-10">{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          {/* Speed Toggle */}
          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-1 text-[11px] font-mono rounded bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 cursor-pointer"
            title="رفتار تبدیل کریں"
          >
            {playbackRate}x
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'آواز کھولیں' : 'آواز بند کریں'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Download */}
          <a
            href={currentAudioTrack.audioUrl}
            download={`${currentAudioTrack.titleUrdu.replace(/\s+/g, '_')}.mp3`}
            className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="ڈاؤن لوڈ MP3"
          >
            <Download className="w-4 h-4 text-[#C5A059]" />
          </a>

          {/* Close Player */}
          <button
            onClick={() => {
              setAudioPlaying(false);
              setCurrentAudioTrack(null);
            }}
            className="p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer ms-1"
            title="پلیئر بند کریں"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
