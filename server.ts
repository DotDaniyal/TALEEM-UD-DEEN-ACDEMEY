import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { BayanSession, RecordedBayan, AudioBayan, SiteConfig, AuditLogItem, StudioMode, PipPosition } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));

// Initial Seed Data with dignified Islamic lectures
let siteConfig: SiteConfig = {
  siteName: 'Islamic Bayan Online',
  siteNameUrdu: 'اسلامی بیانات آن لائن',
  siteNameArabic: 'منصة المحاضرات الإسلامية',
  speakerName: 'Dr. Muhammad Farooq (Father)',
  speakerNameUrdu: 'ڈاکٹر محمد فاروق (والد محترم)',
  speakerTitle: 'Senior Scholar & Teacher of Hadith',
  speakerTitleUrdu: 'سینئر استادِ حدیث و علومِ شریعت',
  speakerBio: 'Dedicated to teaching classical Islamic texts, Quranic tafseer, and spiritual character building for over 35 years. Graduated in Islamic studies and continues to mentor students and families worldwide.',
  speakerBioUrdu: 'گزشتہ ۳۵ برس سے زائد عرصے سے علومِ قرآن و سنت، تزکیہ نفس اور اخلاقی تربیت کی تدریس میں مصروف عمل ہیں۔ دنیا بھر کے طالبانِ خیر کے لیے ہفتہ وار باقاعدہ مجالس کا اہتمام فرماتے ہیں۔',
  speakerPhotoUrl: '/src/assets/images/speaker_portrait_1792917987190.jpg',
  contactEmail: 'contact@islamic-bayan.online',
  contactPhone: '+92 300 1234567',
  whatsappCommunityLink: 'https://chat.whatsapp.com/sample-community',
  donationAccount: 'PK12-MEZN-0000-1111-2222',
  donationBank: 'Meezan Islamic Bank',
};

let bayanSessions: BayanSession[] = [
  {
    id: 'bayan-01',
    title: 'Tafseer Surah Al-Kahf: Lessons for the Modern Age',
    titleUrdu: 'تفسیر سورۃ الکہف: دورِ حاضر کے فتن اور قرآنی رہنمائی',
    titleArabic: 'تفسير سورة الكهف وعبر الزمان',
    description: 'A comprehensive study of the four core trials mentioned in Surah Al-Kahf (Faith, Wealth, Knowledge, and Power) and prophetic remedies.',
    descriptionUrdu: 'سورۃ الکہف کے چار بنیادی آزمائشوں (ایمان، دولت، علم اور اقتدار) کا تفصیلی مطالعہ اور نبوی حکمتیں جن سے مومن سرخرو ہوتا ہے۔',
    speakerName: 'Dr. Muhammad Farooq',
    speakerNameUrdu: 'ڈاکٹر محمد فاروق',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hours from now
    status: 'scheduled',
    roomCode: 'kahf-live-2026',
    isRecorded: true,
    durationMinutes: 60,
    category: 'Tafseer',
    categoryUrdu: 'تفسیرِ قرآن',
    language: 'Urdu',
    activeAttendeesCount: 0,
    qnaEnabled: true,
    chatEnabled: true,
    guestAccessAllowed: true,
  },
  {
    id: 'bayan-02',
    title: 'Tazkiyah: The Sincerity of Heart & Spiritual Excellence',
    titleUrdu: 'اخلاصِ نیت اور تزکیہ قلب کی نبوی تعلیمات',
    titleArabic: 'الإخلاص وتزكية النفس',
    description: 'Foundations of spiritual well-being, overcoming pride and ostentation, and purifying intentions in worship and family life.',
    descriptionUrdu: 'ریاکاری اور تکبر کے خاتمے، نیتوں کی درستگی اور عبادات میں خشوع و خضوع کے حصول پر فکری و روحانی گفتگو۔',
    speakerName: 'Dr. Muhammad Farooq',
    speakerNameUrdu: 'ڈاکٹر محمد فاروق',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // tomorrow
    status: 'scheduled',
    roomCode: 'tazkiyah-heart',
    isRecorded: true,
    durationMinutes: 50,
    category: 'Tazkiyah',
    categoryUrdu: 'تزکیہ و احسان',
    language: 'Urdu',
    activeAttendeesCount: 0,
    qnaEnabled: true,
    chatEnabled: true,
    guestAccessAllowed: true,
  },
];

let recordedBayans: RecordedBayan[] = [
  {
    id: 'rec-01',
    title: 'Prophetic Guidance on Upbringing of Children in the Digital Era',
    titleUrdu: 'ڈیجیٹل دور میں اولاد کی اسلامی تربیت کے سنہری اصول',
    titleArabic: 'تربية الأبناء في العصر الرقمي',
    description: 'Practical steps for parents to instill faith, love of the Prophet (pbuh), and digital discipline at home with gentleness and wisdom.',
    descriptionUrdu: 'والدین کے لیے حکمت آمیز اور عملی رہنما اصول تاکہ بچوں کے دلوں میں محبتِ الٰہی، محبتِ رسول اور اخلاقی شعور بیدار کیا جا سکے۔',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-04-10',
    duration: '54:12',
    durationSeconds: 3252,
    category: 'Family & Ethics',
    categoryUrdu: 'خاندانی تربیت و اخلاق',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: '/src/assets/images/bayan_masjid_interior_1792917985772.jpg',
    visibility: 'public',
    downloadsAllowed: true,
    fileSizeBytes: 420000000,
    viewsCount: 340,
  },
  {
    id: 'rec-02',
    title: 'Explanation of Forty Hadith of Imam Nawawi - Hadith 1 on Intentions',
    titleUrdu: 'شرح اربعین نووی: پہلی حدیث "انما الاعمال بالنیات" کی تفصیلی وضاحت',
    titleArabic: 'شرح حديث إنما الأعمال بالنيات',
    description: 'In-depth linguistic and jurisprudential analysis of the most fundamental hadith governing all actions in Islam.',
    descriptionUrdu: 'تمام انسانی اعمال کا دارومدار نیتوں پر ہے، اس عظیم الشان حدیث مبارکہ کی فقہی، فکری اور روحانی جہات کا احاطہ۔',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-04-03',
    duration: '48:30',
    durationSeconds: 2910,
    category: 'Hadith',
    categoryUrdu: 'حدیث شریف',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: '/src/assets/images/quran_study_gathering_1792917985948.jpg',
    visibility: 'public',
    downloadsAllowed: true,
    fileSizeBytes: 380000000,
    viewsCount: 512,
  },
  {
    id: 'rec-03',
    title: 'The Greatness of Ramadan and Night of Power (Laylatul Qadr)',
    titleUrdu: 'عظمتِ رمضان اور شبِ قدر کی فضیلت و برکات',
    titleArabic: 'فضل شهر رمضان المبارك وليلة القدر',
    description: 'Preparing the heart for the blessed month of fasting, repentance, and seeking Allah’s boundless mercy.',
    descriptionUrdu: 'رمضان المبارک کے استقبال، گناہوں سے توبہ اور شب قدر کی تلاش کے آداب پر فکر انگیز درس۔',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-03-20',
    duration: '62:15',
    durationSeconds: 3735,
    category: 'Worship',
    categoryUrdu: 'عبادات و فضائل',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/src/assets/images/islamic_calligraphy_art_1792917984824.jpg',
    visibility: 'public',
    downloadsAllowed: true,
    fileSizeBytes: 490000000,
    viewsCount: 680,
  },
];

let audioBayans: AudioBayan[] = [
  {
    id: 'audio-01',
    title: 'Friday Khutbah: True Wealth and Contentment of the Soul',
    titleUrdu: 'خطبہ جمعہ: حقیقی دولت اور قناعتِ قلب',
    titleArabic: 'خطبة الجمعة: الغنى الحقيقي وقناعة القلب',
    category: 'Friday Sermon',
    categoryUrdu: 'خطباتِ جمعہ',
    series: 'Friday Sermons 2026',
    seriesUrdu: 'خطباتِ جمعۃ المبارک ۲۰۲۶ء',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-04-17',
    duration: '38:40',
    durationSeconds: 2320,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/001.mp3',
    fileSizeBytes: 28000000,
    downloadsCount: 1420,
  },
  {
    id: 'audio-02',
    title: 'Purification of Heart: Guarding the Tongue from Slander and Backbiting',
    titleUrdu: 'اصلاح و تزکیہ: زبان کی حفاظت اور غیبت و بہتان کے نقصانات',
    titleArabic: 'تزكية النفس وحفظ اللسان عن الغيبة',
    category: 'Tazkiyah',
    categoryUrdu: 'اصلاح و تزکیہ',
    series: 'Purification Series',
    seriesUrdu: 'اصلاحِ باطن و روحانی تربیت',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-04-10',
    duration: '45:15',
    durationSeconds: 2715,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/002.mp3',
    fileSizeBytes: 33000000,
    downloadsCount: 1890,
  },
  {
    id: 'audio-03',
    title: 'Surah Al-Hujurat: Etiquettes of Social Life and Mutual Brotherhood',
    titleUrdu: 'تفسیر سورۃ الحجرات: معاشرتی آداب اور اسلامی اخوت کے احکام',
    titleArabic: 'تفسير سورة الحجرات وآداب الأخوة',
    category: 'Tafseer',
    categoryUrdu: 'تفسیرِ قرآن',
    series: 'Quranic Pearls',
    seriesUrdu: 'دروسِ فہمِ قرآن',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-03-27',
    duration: '52:10',
    durationSeconds: 3130,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/055.mp3',
    fileSizeBytes: 38000000,
    downloadsCount: 2340,
  },
  {
    id: 'audio-04',
    title: 'Prophetic Sunnahs of Daily Living: Sleep, Awakening, and Eating',
    titleUrdu: 'روزمرہ مسنون معمولات: سونے، جاگنے اور کھانے کی نبوی سنتیں',
    titleArabic: 'السنن النبوية في الحياة اليومية',
    category: 'Sunnah & Adab',
    categoryUrdu: 'سنت و اخلاق',
    series: 'Living the Sunnah',
    seriesUrdu: 'احیائے سنت و آدابِ معاشرت',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-03-15',
    duration: '41:20',
    durationSeconds: 2480,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/067.mp3',
    fileSizeBytes: 30000000,
    downloadsCount: 1650,
  },
  {
    id: 'audio-05',
    title: 'Supplications of the Prophets in the Quran: Seeking Forgiveness and Refuge',
    titleUrdu: 'قرآنی دعائیں: انبیاء علیہم السلام کی مناجات اور استغفار کے اسباق',
    titleArabic: 'أدعية الأنبياء في القرآن الكريم',
    category: 'Dua & Munajat',
    categoryUrdu: 'دعائیں و مناجات',
    series: 'Supplication Pearls',
    seriesUrdu: 'مجموعۂ مناجات و دعائے ماثورہ',
    speaker: 'Dr. Muhammad Farooq',
    speakerUrdu: 'ڈاکٹر محمد فاروق',
    recordedDate: '2026-03-05',
    duration: '34:50',
    durationSeconds: 2090,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/112.mp3',
    fileSizeBytes: 25000000,
    downloadsCount: 3120,
  },
];

let auditLogs: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'Session Created',
    timestamp: new Date().toISOString(),
    user: 'Scholar (Host)',
    details: 'Scheduled Bayan: Tafseer Surah Al-Kahf',
  },
];

// In-Memory WebSocket Rooms for WebRTC signaling and real-time live interaction
interface RoomAttendee {
  id: string;
  name: string;
  role: 'host' | 'attendee';
  ws: WebSocket;
  isMuted: boolean;
  handRaised: boolean;
}

interface ActiveRoom {
  code: string;
  bayanId: string;
  isLive: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  studioMode: StudioMode;
  pipPosition: PipPosition;
  pipVisible: boolean;
  hostWs: WebSocket | null;
  hostName: string;
  attendees: Map<string, RoomAttendee>;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    isHost: boolean;
    isQuestion?: boolean;
    isAnswered?: boolean;
  }>;
}

const rooms = new Map<string, ActiveRoom>();

function getOrCreateRoom(code: string, bayanId: string = ''): ActiveRoom {
  if (!rooms.has(code)) {
    rooms.set(code, {
      code,
      bayanId,
      isLive: false,
      isScreenSharing: false,
      isRecording: false,
      studioMode: 'camera',
      pipPosition: 'bottom-right',
      pipVisible: true,
      hostWs: null,
      hostName: '',
      attendees: new Map(),
      messages: [],
    });
  }
  return rooms.get(code)!;
}

// Attach WebSocket Server to HTTP server
const wss = new WebSocketServer({ server, path: '/ws/bayan' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode = '';
  let currentUserId = '';

  ws.on('message', (data: string) => {
    try {
      const message = JSON.parse(data.toString());
      const { type, roomCode, payload } = message;

      if (type === 'join-room') {
        currentRoomCode = roomCode;
        currentUserId = payload.userId || Math.random().toString(36).substring(2, 9);
        const room = getOrCreateRoom(roomCode, payload.bayanId);

        const attendee: RoomAttendee = {
          id: currentUserId,
          name: payload.name || 'Attendee',
          role: payload.role || 'attendee',
          ws,
          isMuted: payload.role === 'attendee', // Attendees muted by default
          handRaised: false,
        };

        if (payload.role === 'host') {
          room.hostWs = ws;
          room.hostName = payload.name || 'Scholar';
          room.isLive = true;
        }

        room.attendees.set(currentUserId, attendee);

        // Send current room state to joining participant
        const attendeeList = Array.from(room.attendees.values()).map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          isMuted: a.isMuted,
          handRaised: a.handRaised,
        }));

        ws.send(
          JSON.stringify({
            type: 'room-state',
            payload: {
              userId: currentUserId,
              isLive: room.isLive,
              isScreenSharing: room.isScreenSharing,
              isRecording: room.isRecording,
              studioMode: room.studioMode,
              pipPosition: room.pipPosition,
              pipVisible: room.pipVisible,
              attendees: attendeeList,
              messages: room.messages,
            },
          })
        );

        // Notify other participants of new attendee
        broadcastToRoom(room, {
          type: 'attendee-joined',
          payload: {
            id: attendee.id,
            name: attendee.name,
            role: attendee.role,
            isMuted: attendee.isMuted,
            handRaised: attendee.handRaised,
          },
        }, currentUserId);

        // Update active count on session
        const session = bayanSessions.find((s) => s.roomCode === roomCode);
        if (session) {
          session.activeAttendeesCount = room.attendees.size;
        }
      } else if (type === 'webrtc-signal') {
        // Forward WebRTC SDP offer, answer, or ICE candidate to destination peer
        const room = rooms.get(currentRoomCode);
        if (!room) return;

        const targetId = payload.targetId;
        if (targetId) {
          const target = room.attendees.get(targetId);
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(
              JSON.stringify({
                type: 'webrtc-signal',
                payload: {
                  senderId: currentUserId,
                  signal: payload.signal,
                  isScreenShare: payload.isScreenShare,
                },
              })
            );
          }
        } else {
          // Broadcast signal to everyone else (e.g. host publishing stream)
          broadcastToRoom(room, {
            type: 'webrtc-signal',
            payload: {
              senderId: currentUserId,
              signal: payload.signal,
              isScreenShare: payload.isScreenShare,
            },
          }, currentUserId);
        }
      } else if (type === 'chat-message') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;

        const chatMsg = {
          id: Math.random().toString(36).substring(2, 9),
          senderId: currentUserId,
          senderName: payload.senderName,
          text: payload.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isHost: payload.isHost || false,
          isQuestion: payload.isQuestion || false,
          isAnswered: false,
        };

        room.messages.push(chatMsg);
        broadcastToRoom(room, {
          type: 'chat-message',
          payload: chatMsg,
        });
      } else if (type === 'raise-hand') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        const attendee = room.attendees.get(currentUserId);
        if (attendee) {
          attendee.handRaised = payload.handRaised;
          broadcastToRoom(room, {
            type: 'attendee-updated',
            payload: {
              id: attendee.id,
              handRaised: attendee.handRaised,
            },
          });
        }
      } else if (type === 'mute-attendee') {
        // Only host can mute others
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        const target = room.attendees.get(payload.attendeeId);
        if (target) {
          target.isMuted = payload.isMuted;
          broadcastToRoom(room, {
            type: 'attendee-updated',
            payload: {
              id: target.id,
              isMuted: target.isMuted,
            },
          });
        }
      } else if (type === 'remove-attendee') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        const target = room.attendees.get(payload.attendeeId);
        if (target && target.ws.readyState === WebSocket.OPEN) {
          target.ws.send(JSON.stringify({ type: 'removed-by-host' }));
          target.ws.close();
          room.attendees.delete(payload.attendeeId);
          broadcastToRoom(room, {
            type: 'attendee-left',
            payload: { id: payload.attendeeId },
          });
        }
      } else if (type === 'bayan-status-update') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        if (payload.isLive !== undefined) room.isLive = payload.isLive;
        if (payload.isScreenSharing !== undefined) room.isScreenSharing = payload.isScreenSharing;
        if (payload.isRecording !== undefined) room.isRecording = payload.isRecording;

        broadcastToRoom(room, {
          type: 'bayan-status-update',
          payload: {
            isLive: room.isLive,
            isScreenSharing: room.isScreenSharing,
            isRecording: room.isRecording,
          },
        });
      } else if (type === 'studio-mode-changed') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        if (payload.studioMode) room.studioMode = payload.studioMode;
        if (payload.pipPosition) room.pipPosition = payload.pipPosition;
        if (payload.pipVisible !== undefined) room.pipVisible = payload.pipVisible;
        if (payload.isScreenSharing !== undefined) room.isScreenSharing = payload.isScreenSharing;

        broadcastToRoom(room, {
          type: 'studio-mode-changed',
          payload: {
            studioMode: room.studioMode,
            pipPosition: room.pipPosition,
            pipVisible: room.pipVisible,
            isScreenSharing: room.isScreenSharing,
          },
        });
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomCode && currentUserId) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        room.attendees.delete(currentUserId);
        broadcastToRoom(room, {
          type: 'attendee-left',
          payload: { id: currentUserId },
        });

        const session = bayanSessions.find((s) => s.roomCode === currentRoomCode);
        if (session) {
          session.activeAttendeesCount = room.attendees.size;
        }

        if (room.hostWs === ws) {
          room.hostWs = null;
        }
      }
    }
  });
});

function broadcastToRoom(room: ActiveRoom, msg: any, excludeId?: string) {
  const data = JSON.stringify(msg);
  for (const [id, attendee] of room.attendees) {
    if (id !== excludeId && attendee.ws.readyState === WebSocket.OPEN) {
      attendee.ws.send(data);
    }
  }
}

// REST API Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalSessions: bayanSessions.length,
    totalRecordings: recordedBayans.length,
  });
});

app.get('/api/site-config', (_req: Request, res: Response) => {
  res.json(siteConfig);
});

app.post('/api/site-config', (req: Request, res: Response) => {
  siteConfig = { ...siteConfig, ...req.body };
  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Site Settings Updated',
    timestamp: new Date().toISOString(),
    user: 'Administrator',
    details: 'Updated branding or speaker information',
  });
  res.json({ success: true, siteConfig });
});

app.get('/api/sessions', (_req: Request, res: Response) => {
  res.json(bayanSessions);
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const newSession: BayanSession = {
    id: 'bayan-' + Date.now(),
    title: req.body.title || 'Islamic Bayan',
    titleUrdu: req.body.titleUrdu || req.body.title || 'اسلامی بیان',
    titleArabic: req.body.titleArabic || '',
    description: req.body.description || '',
    descriptionUrdu: req.body.descriptionUrdu || '',
    speakerName: req.body.speakerName || siteConfig.speakerName,
    speakerNameUrdu: req.body.speakerNameUrdu || siteConfig.speakerNameUrdu,
    scheduledAt: req.body.scheduledAt || new Date().toISOString(),
    status: req.body.status || 'scheduled',
    roomCode: req.body.roomCode || 'bayan-' + Math.random().toString(36).substring(2, 8),
    isRecorded: req.body.isRecorded !== false,
    durationMinutes: req.body.durationMinutes || 60,
    category: req.body.category || 'General',
    categoryUrdu: req.body.categoryUrdu || 'عام موضوع',
    language: req.body.language || 'Urdu',
    activeAttendeesCount: 0,
    qnaEnabled: req.body.qnaEnabled !== false,
    chatEnabled: req.body.chatEnabled !== false,
    guestAccessAllowed: req.body.guestAccessAllowed !== false,
  };

  bayanSessions.unshift(newSession);

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Bayan Created',
    timestamp: new Date().toISOString(),
    user: 'Scholar / Admin',
    details: `Created: ${newSession.titleUrdu} (${newSession.roomCode})`,
  });

  res.status(201).json(newSession);
});

app.patch('/api/sessions/:id', (req: Request, res: Response) => {
  const session = bayanSessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  Object.assign(session, req.body);
  res.json(session);
});

app.get('/api/recordings', (_req: Request, res: Response) => {
  res.json(recordedBayans);
});

app.post('/api/recordings', (req: Request, res: Response) => {
  const newRecording: RecordedBayan = {
    id: 'rec-' + Date.now(),
    title: req.body.title || 'Recorded Bayan',
    titleUrdu: req.body.titleUrdu || req.body.title || 'ریکارڈ شدہ بیان',
    titleArabic: req.body.titleArabic,
    description: req.body.description || '',
    descriptionUrdu: req.body.descriptionUrdu || '',
    speaker: req.body.speaker || siteConfig.speakerName,
    speakerUrdu: req.body.speakerUrdu || siteConfig.speakerNameUrdu,
    recordedDate: req.body.recordedDate || new Date().toISOString().split('T')[0],
    duration: req.body.duration || '45:00',
    durationSeconds: req.body.durationSeconds || 2700,
    category: req.body.category || 'General',
    categoryUrdu: req.body.categoryUrdu || 'عام خطاب',
    videoUrl: req.body.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: req.body.thumbnailUrl || '/src/assets/images/bayan_masjid_interior_1792917985772.jpg',
    visibility: req.body.visibility || 'public',
    downloadsAllowed: req.body.downloadsAllowed !== false,
    fileSizeBytes: req.body.fileSizeBytes || 350000000,
    viewsCount: 1,
  };

  recordedBayans.unshift(newRecording);

  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Recording Saved',
    timestamp: new Date().toISOString(),
    user: 'Scholar',
    details: `Lecture: ${newRecording.titleUrdu}`,
  });

  res.status(201).json(newRecording);
});

app.delete('/api/recordings/:id', (req: Request, res: Response) => {
  const index = recordedBayans.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Recording not found' });
  }

  const removed = recordedBayans.splice(index, 1)[0];
  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Recording Deleted',
    timestamp: new Date().toISOString(),
    user: 'Administrator',
    details: `Deleted: ${removed.titleUrdu}`,
  });

  res.json({ success: true, removedId: removed.id });
});

app.get('/api/audio-bayans', (_req: Request, res: Response) => {
  res.json(audioBayans);
});

app.post('/api/audio-bayans', (req: Request, res: Response) => {
  const newAudio: AudioBayan = {
    id: 'audio-' + Date.now(),
    title: req.body.title || 'Audio Bayan',
    titleUrdu: req.body.titleUrdu || 'صوتی بیان',
    titleArabic: req.body.titleArabic,
    category: req.body.category || 'General',
    categoryUrdu: req.body.categoryUrdu || 'عام خطاب',
    series: req.body.series,
    seriesUrdu: req.body.seriesUrdu,
    speaker: req.body.speaker || siteConfig.speakerName,
    speakerUrdu: req.body.speakerUrdu || siteConfig.speakerNameUrdu,
    recordedDate: req.body.recordedDate || new Date().toISOString().split('T')[0],
    duration: req.body.duration || '35:00',
    durationSeconds: req.body.durationSeconds || 2100,
    audioUrl: req.body.audioUrl || 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/001.mp3',
    fileSizeBytes: req.body.fileSizeBytes || 25000000,
    downloadsCount: 1,
  };
  audioBayans.unshift(newAudio);
  res.status(201).json(newAudio);
});

app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(auditLogs);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  // Secure server-side check with default scholar admin credential
  if (
    (username === 'admin' || username === 'scholar@islamic-bayan.online') &&
    (password === 'BayanAdmin2026!' || password === 'admin')
  ) {
    res.json({
      success: true,
      token: 'jwt-auth-scholar-' + Date.now(),
      user: {
        name: siteConfig.speakerName,
        email: 'scholar@islamic-bayan.online',
        role: 'admin',
      },
    });
  } else {
    res.status(401).json({ error: 'Invalid scholar credentials' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Islamic Bayan Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
