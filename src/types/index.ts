export type Language = 'ur' | 'ar' | 'en';

export type StudioMode = 'camera' | 'screen' | 'pip';
export type PipPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface BayanSession {
  id: string;
  title: string;
  titleUrdu: string;
  titleArabic: string;
  description: string;
  descriptionUrdu: string;
  speakerName: string;
  speakerNameUrdu: string;
  scheduledAt: string; // ISO date string
  status: 'scheduled' | 'live' | 'ended';
  roomCode: string;
  isRecorded: boolean;
  recordingUrl?: string;
  durationMinutes: number;
  category: string;
  categoryUrdu: string;
  language: string;
  activeAttendeesCount: number;
  qnaEnabled: boolean;
  chatEnabled: boolean;
  guestAccessAllowed: boolean;
}

export interface RecordedBayan {
  id: string;
  title: string;
  titleUrdu: string;
  titleArabic?: string;
  description: string;
  descriptionUrdu: string;
  speaker: string;
  speakerUrdu: string;
  recordedDate: string;
  duration: string; // e.g., "48:20"
  durationSeconds: number;
  category: string;
  categoryUrdu: string;
  videoUrl: string;
  thumbnailUrl: string;
  audioOnlyUrl?: string;
  visibility: 'public' | 'unlisted' | 'private';
  downloadsAllowed: boolean;
  fileSizeBytes?: number;
  viewsCount: number;
}

export interface AudioBayan {
  id: string;
  title: string;
  titleUrdu: string;
  titleArabic?: string;
  category: string;
  categoryUrdu: string;
  series?: string;
  seriesUrdu?: string;
  speaker: string;
  speakerUrdu: string;
  recordedDate: string;
  duration: string;
  durationSeconds: number;
  audioUrl: string;
  fileSizeBytes?: number;
  downloadsCount: number;
}

export interface Attendee {
  id: string;
  name: string;
  role: 'host' | 'attendee';
  isMuted: boolean;
  isCameraOn: boolean;
  handRaised: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isHost: boolean;
  isQuestion?: boolean;
  isAnswered?: boolean;
}

export interface SiteConfig {
  siteName: string;
  siteNameUrdu: string;
  siteNameArabic: string;
  speakerName: string;
  speakerNameUrdu: string;
  speakerTitle: string;
  speakerTitleUrdu: string;
  speakerBio: string;
  speakerBioUrdu: string;
  speakerPhotoUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappCommunityLink: string;
  donationAccount?: string;
  donationBank?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

export interface YouTubeVideo {
  id: string; // YouTube Video ID (e.g., dQw4w9WgXcQ)
  title: string;
  titleUrdu?: string;
  description: string;
  publishedAt: string; // ISO date string
  thumbnailUrl: string;
  thumbnailHighUrl?: string;
  duration: string; // e.g., "14:20" or "0:45"
  durationSeconds: number;
  isShort: boolean;
  viewCount: number;
  likeCount?: number;
  youtubeUrl: string;
  playlistIds: string[];
  featured?: boolean;
  hidden?: boolean;
  category?: string;
  categoryUrdu?: string;
}

export interface YouTubePlaylist {
  id: string; // YouTube Playlist ID (e.g., PL...)
  title: string;
  titleUrdu?: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
  hidden?: boolean;
  updatedAt: string;
}

export interface YouTubeConfig {
  channelHandle: string; // e.g. "@MuftiFaisalHayat"
  channelId: string; // e.g. "UC..."
  channelTitle: string;
  channelTitleUrdu: string;
  apiKey: string; // Server side secret
  hasApiKey: boolean; // Safe boolean sent to frontend
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  lastError?: string | null;
}

export interface YouTubeSyncLog {
  id: string;
  timestamp: string;
  status: 'success' | 'partial' | 'error';
  videosImported: number;
  videosUpdated: number;
  playlistsImported: number;
  message: string;
  details?: string;
}

export interface YouTubeDataState {
  config: YouTubeConfig;
  videos: YouTubeVideo[];
  playlists: YouTubePlaylist[];
  syncLogs: YouTubeSyncLog[];
  totalVideosCount: number;
  totalPlaylistsCount: number;
}
