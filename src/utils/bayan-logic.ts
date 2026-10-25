/**
 * Pure helper and business logic functions for Islamic Bayan Online
 * Completely decoupled from React/DOM for deterministic unit testing.
 */

import { BayanSession, RecordedBayan, AudioBayan, PipPosition } from '../types';

/**
 * Generates a clean, readable and unguessable room code
 */
export function generateRoomCode(prefix: string = 'bayan'): string {
  const cleanPrefix = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10) || 'bayan';
  const randomChars = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36).slice(-4);
  return `${cleanPrefix}-${randomChars}-${timestamp}`;
}

/**
 * Generates direct joining web link and WhatsApp share message
 */
export function generateShareableLinks(
  appUrl: string,
  roomCode: string,
  title: string,
  lang: 'ur' | 'ar' | 'en' = 'ur'
): { joinUrl: string; whatsappShareUrl: string; shareText: string } {
  const baseUrl = appUrl ? appUrl.replace(/\/+$/, '') : 'https://islamic-bayan.online';
  const joinUrl = `${baseUrl}/join?session=${encodeURIComponent(roomCode)}`;

  let shareText = '';
  if (lang === 'ur') {
    shareText = `السلام علیکم ورحمۃ اللہ وبرکاتہ\nآپ کو اسلامی بیان میں شرکت کی پرخلوص دعوت دی جاتی ہے:\n\nعنوان: "${title}"\n\nبراہ راست شامل ہونے کے لیے اس لنک پر کلک کیجیے:\n${joinUrl}\n\n(کسی خاص ایپ کو ڈاؤن لوڈ کرنے کی ضرورت نہیں، براؤزر میں براہ راست چلے گا)`;
  } else if (lang === 'ar') {
    shareText = `السلام عليكم ورحمة الله وبركاته\nيسرنا دعوتكم لحضور الدرس والمحاضرة الإسلامية:\n\nالعنوان: "${title}"\n\nللانضمام مباشرة يرجى الضغط على الرابط التالي:\n${joinUrl}`;
  } else {
    shareText = `Assalamu Alaikum wa Rahmatullahi wa Barakatuh,\nYou are warmly invited to join the Islamic Bayan (lecture):\n\nTopic: "${title}"\n\nClick the link below to join directly in your browser:\n${joinUrl}\n\n(No app installation required)`;
  }

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return {
    joinUrl,
    whatsappShareUrl,
    shareText,
  };
}

export interface TimeRemainingResult {
  isPast: boolean;
  isNow: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
}

/**
 * Calculates countdown to a scheduled lecture
 */
export function calculateTimeRemaining(
  targetIsoDate: string,
  currentTimestamp: number = Date.now()
): TimeRemainingResult {
  const target = new Date(targetIsoDate).getTime();
  const diff = target - currentTimestamp;

  if (isNaN(diff)) {
    return {
      isPast: true,
      isNow: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: '00:00:00',
    };
  }

  if (diff <= 0) {
    const isNow = Math.abs(diff) < 2 * 60 * 60 * 1000;
    return {
      isPast: !isNow,
      isNow,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: '00:00:00',
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedCountdown = days > 0
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    isPast: false,
    isNow: false,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown,
  };
}

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Filter recorded video lectures by search query and category
 */
export function filterLectures(
  lectures: RecordedBayan[],
  query: string,
  category: string
): RecordedBayan[] {
  const q = query.trim().toLowerCase();
  const cat = category.trim().toLowerCase();

  return lectures.filter((lec) => {
    const matchesCat =
      cat === 'all' ||
      cat === '' ||
      lec.category.toLowerCase() === cat ||
      lec.categoryUrdu.toLowerCase() === cat;

    if (!matchesCat) return false;

    if (!q) return true;

    return (
      lec.title.toLowerCase().includes(q) ||
      lec.titleUrdu.toLowerCase().includes(q) ||
      (lec.titleArabic && lec.titleArabic.toLowerCase().includes(q)) ||
      lec.description.toLowerCase().includes(q) ||
      lec.descriptionUrdu.toLowerCase().includes(q) ||
      lec.speaker.toLowerCase().includes(q)
    );
  });
}

/**
 * Filter audio lectures by search keyword, category, and series
 */
export function filterAudioLectures(
  audios: AudioBayan[],
  query: string,
  category: string,
  series?: string
): AudioBayan[] {
  const q = query.trim().toLowerCase();
  const cat = category.trim().toLowerCase();
  const ser = series ? series.trim().toLowerCase() : '';

  return audios.filter((audio) => {
    const matchesCat =
      cat === 'all' ||
      cat === '' ||
      audio.category.toLowerCase() === cat ||
      audio.categoryUrdu.toLowerCase() === cat;

    if (!matchesCat) return false;

    if (ser && ser !== 'all') {
      const matchSeries =
        (audio.series && audio.series.toLowerCase() === ser) ||
        (audio.seriesUrdu && audio.seriesUrdu.toLowerCase() === ser);
      if (!matchSeries) return false;
    }

    if (!q) return true;

    return (
      audio.title.toLowerCase().includes(q) ||
      audio.titleUrdu.toLowerCase().includes(q) ||
      (audio.titleArabic && audio.titleArabic.toLowerCase().includes(q)) ||
      audio.speaker.toLowerCase().includes(q) ||
      audio.speakerUrdu.toLowerCase().includes(q)
    );
  });
}

/**
 * Resolves Tailwind positioning classes for Mode C Picture-in-Picture window
 */
export function getPipPositionClasses(position: PipPosition): string {
  switch (position) {
    case 'top-left':
      return 'top-4 start-4';
    case 'top-right':
      return 'top-4 end-4';
    case 'bottom-left':
      return 'bottom-16 start-4';
    case 'bottom-right':
    default:
      return 'bottom-16 end-4';
  }
}

/**
 * Screen share privacy verification helper
 */
export function validateScreenSharePrivacy(displaySurface?: string): {
  isFullDisplay: boolean;
  adviceUrdu: string;
  adviceEn: string;
} {
  const isFullDisplay = displaySurface === 'monitor';
  return {
    isFullDisplay,
    adviceUrdu: isFullDisplay
      ? 'آپ پوری کمپیوٹر اسکرین شیئر کر رہے ہیں۔ شرکاء اس اسکرین پر موجود تمام کھڑکیوں کو دیکھ سکتے ہیں۔'
      : 'آپ نے مخصوص براؤزر ٹیب یا ونڈو شیئر کی ہے، دیگر نجی ونڈوز پوشیدہ ہیں۔',
    adviceEn: isFullDisplay
      ? 'You are sharing your entire screen. Attendees can see all active windows on this display.'
      : 'You are sharing a specific tab or application window. Unrelated files remain private.',
  };
}

/**
 * Access control for recorded lectures
 */
export function canAccessRecording(
  visibility: 'public' | 'unlisted' | 'private',
  isAdmin: boolean,
  hasDirectLink: boolean = false
): boolean {
  if (isAdmin) return true;
  if (visibility === 'public') return true;
  if (visibility === 'unlisted' && hasDirectLink) return true;
  return false;
}

/**
 * Validation for creating or updating a Bayan session
 */
export function validateBayanSession(data: Partial<BayanSession>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title?.trim() && !data.titleUrdu?.trim()) {
    errors.push('Title in Urdu or English is required');
  }

  if (data.scheduledAt) {
    const scheduledTime = new Date(data.scheduledAt).getTime();
    if (isNaN(scheduledTime)) {
      errors.push('Invalid scheduled time format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats a Gregorian date with estimated Islamic Hijri year/month
 */
export function formatIslamicDateEstimate(isoDateString: string): {
  gregorianFormatted: string;
  hijriYearEstimate: number;
} {
  const date = new Date(isoDateString);
  const isValid = !isNaN(date.getTime());
  const effectiveDate = isValid ? date : new Date();

  const gregorianFormatted = effectiveDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const gYear = effectiveDate.getFullYear();
  const hijriYearEstimate = Math.floor((gYear - 622) * (33 / 32));

  return {
    gregorianFormatted,
    hijriYearEstimate,
  };
}
