export type Language = 'ur' | 'ar' | 'en';

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
