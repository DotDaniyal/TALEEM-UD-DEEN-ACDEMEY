import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { BayanSession, RecordedBayan, AudioBayan, SiteConfig, AuditLogItem } from './src/types';
import { youtubeService } from './src/services/youtube-service.js';
import { sheetsService } from './src/services/sheets-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));

// Initial Seed Data - Taleem Ud Deen Academy
let siteConfig: SiteConfig = {
  siteName: 'TALEEM UD DEEN ACADEMY',
  siteNameUrdu: 'تعلیم الدین اکیڈمی',
  siteNameArabic: 'أكاديمية تعليم الدين',
  speakerName: 'Mufti Faisal Hayat',
  speakerNameUrdu: 'مفتی فیصل حیات',
  speakerTitle: 'Senior Islamic Scholar & Founder',
  speakerTitleUrdu: 'فاضلِ دین، استادِ حدیث و سرپرستِ اعلیٰ',
  speakerBio: 'Dedicated to teaching classical Islamic texts, Quranic tafseer, Hadith, and spiritual character building. Founder and principal director of Taleem Ud Deen Academy.',
  speakerBioUrdu: 'کئی دہائیوں سے قرآن و سنت، تفسیرِ قرآن، احادیثِ نبویہ اور تزکیہ نفس کی تدریس سے وابستہ ہیں۔ تعلیم الدین اکیڈمی کے بانی و سرپرست اعلیٰ ہیں۔',
  speakerPhotoUrl: '/src/assets/images/speaker_portrait_1792917987190.jpg',
  contactEmail: 'info@taleemuddeen.academy',
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
    speakerName: 'Mufti Faisal Hayat',
    speakerNameUrdu: 'مفتی فیصل حیات',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
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
    speakerName: 'Mufti Faisal Hayat',
    speakerNameUrdu: 'مفتی فیصل حیات',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
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
    speaker: 'Mufti Faisal Hayat',
    speakerUrdu: 'مفتی فیصل حیات',
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
    speaker: 'Mufti Faisal Hayat',
    speakerUrdu: 'مفتی فیصل حیات',
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
    speaker: 'Mufti Faisal Hayat',
    speakerUrdu: 'مفتی فیصل حیات',
    recordedDate: '2026-04-17',
    duration: '38:40',
    durationSeconds: 2320,
    audioUrl: 'https://cdn.islamicfinder.org/audio/quran/abdulbaset-mujawwad/001.mp3',
    fileSizeBytes: 28000000,
    downloadsCount: 1420,
  },
];

let auditLogs: AuditLogItem[] = [
  {
    id: 'log-1',
    action: 'Taleem Ud Deen Academy Platform Initialized',
    timestamp: new Date().toISOString(),
    user: 'System Administrator',
    details: 'Initial live studio, YouTube sync, and Google Sheets CMS readiness',
  },
];

// Q&A Question item structure
export interface ModeratedQuestion {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'answered';
  pinned: boolean;
}

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
  questionsOpen: boolean;
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
  }>;
  questionsQueue: ModeratedQuestion[];
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
      questionsOpen: true,
      hostWs: null,
      hostName: '',
      attendees: new Map(),
      messages: [],
      questionsQueue: [],
    });
  }
  return rooms.get(code)!;
}

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
          isMuted: payload.role === 'attendee',
          handRaised: false,
        };

        if (payload.role === 'host') {
          room.hostWs = ws;
          room.hostName = payload.name || 'Mufti Faisal Hayat';
          room.isLive = true;
        }

        room.attendees.set(currentUserId, attendee);

        const attendeeList = Array.from(room.attendees.values()).map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          isMuted: a.isMuted,
          handRaised: a.handRaised,
        }));

        // Send room state. For non-hosts, only send APPROVED or PINNED questions.
        const approvedQuestions = room.questionsQueue.filter(
          (q) => q.status === 'approved' || q.status === 'answered' || q.pinned
        );

        ws.send(
          JSON.stringify({
            type: 'room-state',
            payload: {
              userId: currentUserId,
              isLive: room.isLive,
              isScreenSharing: room.isScreenSharing,
              isRecording: room.isRecording,
              questionsOpen: room.questionsOpen,
              attendees: attendeeList,
              messages: room.messages,
              questions: payload.role === 'host' ? room.questionsQueue : approvedQuestions,
            },
          })
        );

        broadcastToRoom(
          room,
          {
            type: 'attendee-joined',
            payload: {
              id: attendee.id,
              name: attendee.name,
              role: attendee.role,
              isMuted: attendee.isMuted,
              handRaised: attendee.handRaised,
            },
          },
          currentUserId
        );

        const session = bayanSessions.find((s) => s.roomCode === roomCode);
        if (session) {
          session.activeAttendeesCount = room.attendees.size;
        }
      } else if (type === 'submit-question') {
        // Listener submits a written question for moderation
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        if (!room.questionsOpen) {
          ws.send(JSON.stringify({ type: 'question-error', message: 'Questions are currently closed by host.' }));
          return;
        }

        const newQ: ModeratedQuestion = {
          id: 'q-' + Math.random().toString(36).substring(2, 9),
          senderName: payload.senderName || 'Anonymous',
          text: payload.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'pending',
          pinned: false,
        };

        room.questionsQueue.unshift(newQ);

        // Send update to host with full queue
        if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
          room.hostWs.send(
            JSON.stringify({
              type: 'questions-queue-update',
              payload: { questions: room.questionsQueue },
            })
          );
        }

        // Send acknowledgment to sender
        ws.send(
          JSON.stringify({
            type: 'question-submitted',
            payload: newQ,
          })
        );
      } else if (type === 'moderate-question') {
        // Host approves, rejects, marks answered, pins, or deletes
        const room = rooms.get(currentRoomCode);
        if (!room) return;

        const { questionId, action } = payload;
        const qIndex = room.questionsQueue.findIndex((q) => q.id === questionId);
        if (qIndex !== -1) {
          if (action === 'approve') {
            room.questionsQueue[qIndex].status = 'approved';
          } else if (action === 'reject') {
            room.questionsQueue[qIndex].status = 'rejected';
          } else if (action === 'answer') {
            room.questionsQueue[qIndex].status = 'answered';
          } else if (action === 'pin') {
            room.questionsQueue[qIndex].pinned = !room.questionsQueue[qIndex].pinned;
          } else if (action === 'delete') {
            room.questionsQueue.splice(qIndex, 1);
          }
        }

        // Broadcast approved questions to listeners
        const approvedQuestions = room.questionsQueue.filter(
          (q) => q.status === 'approved' || q.status === 'answered' || q.pinned
        );

        broadcastToRoom(room, {
          type: 'approved-questions-update',
          payload: { questions: approvedQuestions },
        });

        // Send full queue update to host
        if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
          room.hostWs.send(
            JSON.stringify({
              type: 'questions-queue-update',
              payload: { questions: room.questionsQueue },
            })
          );
        }
      } else if (type === 'toggle-questions-open') {
        const room = rooms.get(currentRoomCode);
        if (!room) return;
        room.questionsOpen = payload.questionsOpen;
        broadcastToRoom(room, {
          type: 'questions-open-status',
          payload: { questionsOpen: room.questionsOpen },
        });
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
        };

        room.messages.push(chatMsg);
        broadcastToRoom(room, {
          type: 'chat-message',
          payload: chatMsg,
        });
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
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
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
    appName: 'TALEEM UD DEEN ACADEMY',
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
    details: 'Updated Taleem Ud Deen Academy site branding',
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
    action: 'Bayan Scheduled',
    timestamp: new Date().toISOString(),
    user: 'Mufti Faisal Hayat / Admin',
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
    details: `Saved: ${newRecording.titleUrdu}`,
  });

  res.status(201).json(newRecording);
});

app.delete('/api/recordings/:id', (req: Request, res: Response) => {
  const index = recordedBayans.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Recording not found' });
  }

  const removed = recordedBayans.splice(index, 1)[0];
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

// Google Sheets CMS Endpoints
app.get('/api/sheets/state', (_req: Request, res: Response) => {
  res.json(sheetsService.getState());
});

app.post('/api/sheets/config', (req: Request, res: Response) => {
  const updated = sheetsService.updateConfig(req.body);
  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Google Sheets Config Updated',
    timestamp: new Date().toISOString(),
    user: 'Administrator',
    details: `Updated spreadsheet ID: ${req.body.spreadsheetId || 'unchanged'}`,
  });
  res.json(updated);
});

app.post('/api/sheets/sync', (_req: Request, res: Response) => {
  const result = sheetsService.performSync();
  auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'Google Sheets CMS Sync Triggered',
    timestamp: new Date().toISOString(),
    user: 'Administrator',
    details: result.message,
  });
  res.json({ ...result, state: sheetsService.getState() });
});

// YouTube Integration REST Endpoints
app.get('/api/youtube/state', (_req: Request, res: Response) => {
  res.json(youtubeService.getState());
});

app.post('/api/youtube/config', (req: Request, res: Response) => {
  const updated = youtubeService.updateConfig(req.body);
  res.json(updated);
});

app.post('/api/youtube/sync', async (_req: Request, res: Response) => {
  const result = await youtubeService.performSync();
  res.json({ ...result, state: youtubeService.getState() });
});

app.patch('/api/youtube/videos/:id/featured', (req: Request, res: Response) => {
  const video = youtubeService.toggleVideoFeatured(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
});

app.patch('/api/youtube/videos/:id/hidden', (req: Request, res: Response) => {
  const video = youtubeService.toggleVideoHidden(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
});

app.patch('/api/youtube/playlists/:id/hidden', (req: Request, res: Response) => {
  const playlist = youtubeService.togglePlaylistHidden(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlist);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (
    (username === 'admin' || username === 'info@taleemuddeen.academy') &&
    (password === 'BayanAdmin2026!' || password === 'admin')
  ) {
    res.json({
      success: true,
      token: 'jwt-auth-taleemuddeen-' + Date.now(),
      user: {
        name: siteConfig.speakerName,
        email: 'info@taleemuddeen.academy',
        role: 'admin',
      },
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
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
    console.log(`Taleem Ud Deen Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
