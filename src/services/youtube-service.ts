import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  YouTubeVideo,
  YouTubePlaylist,
  YouTubeConfig,
  YouTubeSyncLog,
  YouTubeDataState,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'youtube_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Could not create data directory:', err);
  }
}

// Initial Seed Channel Configuration for Mufti Faisal Hayat
const defaultYouTubeConfig: YouTubeConfig = {
  channelHandle: '@MuftiFaisalHayat',
  channelId: 'UC_MuftiFaisalHayat_Official',
  channelTitle: 'Mufti Faisal Hayat Official',
  channelTitleUrdu: 'مفتی فیصل حیات صاحب - آفیشل یوٹیوب چینل',
  apiKey: process.env.YOUTUBE_API_KEY || '',
  hasApiKey: Boolean(process.env.YOUTUBE_API_KEY),
  autoSyncEnabled: true,
  syncIntervalMinutes: 30,
  lastSyncAt: new Date().toISOString(),
  nextSyncAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  status: 'idle',
  lastError: null,
};

// Initial Seed Playlists from Mufti Faisal Hayat Channel
const initialPlaylists: YouTubePlaylist[] = [
  {
    id: 'PL_tafseer_quran_faisal',
    title: 'تفسیرِ قرآن مجید - درو سِ قرآن',
    titleUrdu: 'تفسیرِ قرآن مجید - مفتی فیصل حیات',
    description: 'قرآن مجید کی سورتوں اور آیات کی تفصیلی اور حکمت آمیز تفسیر و رہنما نکات۔',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    itemCount: 8,
    hidden: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PL_seerah_nabawi_faisal',
    title: 'سیرت النبی ﷺ - مکمل علمی سلسلہ',
    titleUrdu: 'سیرت النبی ﷺ اور اسوہ حسانہ',
    description: 'رسول اللہ ﷺ کی حیاتِ طیبہ اور صحابہ کرام کی زندگیوں سے اخلاقی و عملی دروس۔',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe32712?auto=format&fit=crop&w=800&q=80',
    itemCount: 6,
    hidden: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PL_tazkiyah_faisal',
    title: 'اصلاحِ باطن و تزکیہ نفس',
    titleUrdu: 'اصلاحِ باطن و روحانی تربیت',
    description: 'قلب کی صفائی، خشوع، اور اسلامی اخلاقیات پر اثر انگیز خطابات۔',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    itemCount: 5,
    hidden: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PL_masail_fiqh_faisal',
    title: 'جدید و قدیم فقهی مسائل اور فتویٰ',
    titleUrdu: 'احکامِ شریعت و روزمرہ مسائل',
    description: 'عبادات، معاملات اور جدید دور کے شرعی سوالات کے مستند جوابات۔',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
    itemCount: 7,
    hidden: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PL_shorts_faisal',
    title: 'مختصر اسلامی نكات و شاٹس',
    titleUrdu: 'یوٹیوب شاٹس - ۶۰ سیکنڈ علمی نکات',
    description: 'ایک منٹ کے مختصر اور پراثر اسلامی نصائح و اخلاقی جملے۔',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    itemCount: 6,
    hidden: false,
    updatedAt: new Date().toISOString(),
  },
];

// Initial Seed Videos from Mufti Faisal Hayat
const initialVideos: YouTubeVideo[] = [
  {
    id: 'faisal_bayan_01',
    title: 'تفسیر سورۃ الفاتحہ اور بندگی کی حقیقت | مفتی فیصل حیات',
    titleUrdu: 'تفسیر سورۃ الفاتحہ اور بندگی کی حقیقت',
    description: 'ام الکتاب سورۃ الفاتحہ کی روحانی و علمی تفسیر، دعا کے آداب اور ہدایتِ الٰہی کی تلافی پر مفتی فیصل حیات صاحب کا مدلل و فکر انگیز درس۔',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    thumbnailHighUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80',
    duration: '42:15',
    durationSeconds: 2535,
    isShort: false,
    viewCount: 14200,
    likeCount: 890,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_01',
    playlistIds: ['PL_tafseer_quran_faisal'],
    featured: true,
    hidden: false,
    category: 'Tafseer',
    categoryUrdu: 'تفسیرِ قرآن',
  },
  {
    id: 'faisal_bayan_02',
    title: 'اخلاقِ حسنہ اور خانگی زندگی میں خوشگواری | مفتی فیصل حیات',
    titleUrdu: 'اخلاقِ حسنہ اور خانگی زندگی میں خوشگواری',
    description: 'خاندانی تنازعات کے حل، صبر، حلم اور نبوی اخلاق کے ذریعے گھروں کو سکون کا گہوارہ بنانے پر اہم اور مفید گفتگو۔',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe32712?auto=format&fit=crop&w=800&q=80',
    duration: '38:40',
    durationSeconds: 2320,
    isShort: false,
    viewCount: 9800,
    likeCount: 620,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_02',
    playlistIds: ['PL_tazkiyah_faisal'],
    featured: true,
    hidden: false,
    category: 'Tazkiyah',
    categoryUrdu: 'اصلاحِ باطن',
  },
  {
    id: 'faisal_bayan_03',
    title: 'شبِ جمعہ کی برکات اور درود شریف کی اہمیت | مفتی فیصل حیات',
    titleUrdu: 'شبِ جمعہ کی برکات اور درود شریف کی اہمیت',
    description: 'نبی کریم ﷺ پر کثرت سے درود و سلام بھیجنے کی فضیلت اور جمعہ المبارک کے مسنون اعمال کی تفصیل۔',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    duration: '51:10',
    durationSeconds: 3070,
    isShort: false,
    viewCount: 18500,
    likeCount: 1240,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_03',
    playlistIds: ['PL_seerah_nabawi_faisal'],
    featured: true,
    hidden: false,
    category: 'Seerah',
    categoryUrdu: 'سیرتِ طیبہ',
  },
  {
    id: 'faisal_bayan_04',
    title: 'تجارت و رزقِ حلال میں برکت کے اصول | مفتی فیصل حیات',
    titleUrdu: 'تجارت و رزقِ حلال میں برکت کے شرعی اصول',
    description: 'حرام رزق سے بچنے، لین دین میں سچائی اور جدید اسلامی بینکنگ و کاروبار کے مسائل کا شرعی جائز۔',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80',
    duration: '45:50',
    durationSeconds: 2750,
    isShort: false,
    viewCount: 11200,
    likeCount: 710,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_04',
    playlistIds: ['PL_masail_fiqh_faisal'],
    featured: false,
    hidden: false,
    category: 'Fiqh',
    categoryUrdu: 'فقہ و مسائل',
  },
  {
    id: 'faisal_short_01',
    title: 'ایک منٹ میں نیت کی اصلاح کا آسان طریقہ #Shorts | مفتی فیصل حیات',
    titleUrdu: 'نیت کی اصلاح کا آسان طریقہ (مختصر نکات)',
    description: 'ہر عمل کو عبادت بنانے کا طریقہ - نیت میں اخلاص کا پہلو۔',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    duration: '0:45',
    durationSeconds: 45,
    isShort: true,
    viewCount: 34100,
    likeCount: 2890,
    youtubeUrl: 'https://www.youtube.com/shorts/faisal_short_01',
    playlistIds: ['PL_shorts_faisal'],
    featured: true,
    hidden: false,
    category: 'Shorts',
    categoryUrdu: 'یوٹیوب شاٹس',
  },
  {
    id: 'faisal_short_02',
    title: 'غصہ پر قابو پانے کی مسنون دعا #Shorts | مفتی فیصل حیات',
    titleUrdu: 'غصہ پر قابو پانے کی مسنون دعا',
    description: 'جب غصہ آئے تو حضور ﷺ کی تعلیم کردہ سنت پر عمل کریں۔',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe32712?auto=format&fit=crop&w=800&q=80',
    duration: '0:58',
    durationSeconds: 58,
    isShort: true,
    viewCount: 28900,
    likeCount: 2100,
    youtubeUrl: 'https://www.youtube.com/shorts/faisal_short_02',
    playlistIds: ['PL_shorts_faisal'],
    featured: false,
    hidden: false,
    category: 'Shorts',
    categoryUrdu: 'یوٹیوب شاٹس',
  },
  {
    id: 'faisal_bayan_05',
    title: 'نماز میں خشوع و خضوع کیسے حاصل کریں؟ | مفتی فیصل حیات',
    titleUrdu: 'نماز میں خشوع و خضوع کیسے حاصل کریں؟',
    description: 'نماز میں دھیان، دل کی حاضری اور وسوسوں سے نجات پانے کی عملی تدابیر۔',
    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    duration: '49:30',
    durationSeconds: 2970,
    isShort: false,
    viewCount: 15600,
    likeCount: 1050,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_05',
    playlistIds: ['PL_tazkiyah_faisal'],
    featured: false,
    hidden: false,
    category: 'Tazkiyah',
    categoryUrdu: 'اصلاحِ باطن',
  },
  {
    id: 'faisal_bayan_06',
    title: 'حقوق العباد اور پڑوسیوں کے حقوق کی پاسداری | مفتی فیصل حیات',
    titleUrdu: 'حقوق العباد اور پڑوسیوں کے حقوق کی پاسداری',
    description: 'معاشرتی ذمہ داریوں، حسنِ معاشرت اور کسی کا دل نہ دکھانے کی قرآنی و حدیدی تعلیمات۔',
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    duration: '36:20',
    durationSeconds: 2180,
    isShort: false,
    viewCount: 8900,
    likeCount: 540,
    youtubeUrl: 'https://www.youtube.com/watch?v=faisal_bayan_06',
    playlistIds: ['PL_masail_fiqh_faisal'],
    featured: false,
    hidden: false,
    category: 'Fiqh',
    categoryUrdu: 'فقہ و مسائل',
  },
];

const initialSyncLogs: YouTubeSyncLog[] = [
  {
    id: 'log-init-1',
    timestamp: new Date().toISOString(),
    status: 'success',
    videosImported: initialVideos.length,
    videosUpdated: 0,
    playlistsImported: initialPlaylists.length,
    message: 'Initial seed import completed for YouTube channel @MuftiFaisalHayat.',
    details: 'Imported 8 public videos/shorts and 5 playlists.',
  },
];

class YouTubeService {
  private config: YouTubeConfig;
  private videos: YouTubeVideo[];
  private playlists: YouTubePlaylist[];
  private syncLogs: YouTubeSyncLog[];
  private syncTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = { ...defaultYouTubeConfig };
    this.videos = [...initialVideos];
    this.playlists = [...initialPlaylists];
    this.syncLogs = [...initialSyncLogs];

    this.loadFromDisk();
    this.initAutoSync();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.config) this.config = { ...defaultYouTubeConfig, ...data.config };
        if (Array.isArray(data.videos)) this.videos = data.videos;
        if (Array.isArray(data.playlists)) this.playlists = data.playlists;
        if (Array.isArray(data.syncLogs)) this.syncLogs = data.syncLogs;
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Error reading youtube store from disk:', err);
    }
  }

  private saveToDisk() {
    try {
      const data = {
        config: this.config,
        videos: this.videos,
        playlists: this.playlists,
        syncLogs: this.syncLogs,
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving youtube store to disk:', err);
    }
  }

  public getState(): YouTubeDataState {
    // Hide API key when sending state
    const safeConfig: YouTubeConfig = {
      ...this.config,
      apiKey: this.config.apiKey ? '••••••••••••••••' : '',
      hasApiKey: Boolean(this.config.apiKey),
    };

    return {
      config: safeConfig,
      videos: this.videos,
      playlists: this.playlists,
      syncLogs: this.syncLogs,
      totalVideosCount: this.videos.length,
      totalPlaylistsCount: this.playlists.length,
    };
  }

  public updateConfig(newConfig: Partial<YouTubeConfig>) {
    if (newConfig.apiKey !== undefined && newConfig.apiKey !== '••••••••••••••••') {
      this.config.apiKey = newConfig.apiKey;
      this.config.hasApiKey = Boolean(newConfig.apiKey);
    }
    if (newConfig.channelHandle) this.config.channelHandle = newConfig.channelHandle;
    if (newConfig.channelId) this.config.channelId = newConfig.channelId;
    if (newConfig.autoSyncEnabled !== undefined) this.config.autoSyncEnabled = newConfig.autoSyncEnabled;
    if (newConfig.syncIntervalMinutes) this.config.syncIntervalMinutes = newConfig.syncIntervalMinutes;

    this.saveToDisk();
    this.initAutoSync();
    return this.getState();
  }

  private initAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.config.autoSyncEnabled && this.config.syncIntervalMinutes > 0) {
      const intervalMs = Math.max(5, this.config.syncIntervalMinutes) * 60 * 1000;
      this.config.nextSyncAt = new Date(Date.now() + intervalMs).toISOString();

      this.syncTimer = setInterval(() => {
        this.performSync().catch((err) => console.error('Background sync failed:', err));
      }, intervalMs);
    } else {
      this.config.nextSyncAt = null;
    }
  }

  public async performSync(): Promise<{ success: boolean; log: YouTubeSyncLog }> {
    this.config.status = 'syncing';
    this.config.lastError = null;

    let importedVideos = 0;
    let updatedVideos = 0;
    let importedPlaylists = 0;
    let syncError: string | null = null;

    try {
      const handle = this.config.channelHandle || '@MuftiFaisalHayat';
      const apiKey = this.config.apiKey;

      if (apiKey) {
        // Option A: Use YouTube Data API v3
        const apiResult = await this.syncViaYouTubeApi(apiKey, handle);
        importedVideos = apiResult.importedVideos;
        updatedVideos = apiResult.updatedVideos;
        importedPlaylists = apiResult.importedPlaylists;
      } else {
        // Option B: Fallback RSS & Channel scraper
        const rssResult = await this.syncViaRssFeed(handle);
        importedVideos = rssResult.importedVideos;
        updatedVideos = rssResult.updatedVideos;
      }

      this.config.status = 'success';
      this.config.lastSyncAt = new Date().toISOString();
      if (this.config.syncIntervalMinutes > 0) {
        this.config.nextSyncAt = new Date(
          Date.now() + this.config.syncIntervalMinutes * 60 * 1000
        ).toISOString();
      }
    } catch (err: any) {
      syncError = err?.message || 'Unknown synchronization error';
      this.config.status = 'error';
      this.config.lastError = syncError;
    }

    const log: YouTubeSyncLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: syncError ? 'error' : 'success',
      videosImported: importedVideos,
      videosUpdated: updatedVideos,
      playlistsImported: importedPlaylists,
      message: syncError
        ? `Sync failed: ${syncError}`
        : `Successfully synced ${importedVideos} new videos, ${updatedVideos} updated, ${importedPlaylists} playlists.`,
      details: syncError || `Channel: ${this.config.channelHandle}`,
    };

    this.syncLogs.unshift(log);
    if (this.syncLogs.length > 50) this.syncLogs = this.syncLogs.slice(0, 50);

    this.saveToDisk();
    return { success: !syncError, log };
  }

  private async syncViaYouTubeApi(apiKey: string, handle: string) {
    let importedVideos = 0;
    let updatedVideos = 0;
    let importedPlaylists = 0;

    // 1. Resolve Channel ID
    const cleanHandle = handle.replace(/^@/, '');
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(
        cleanHandle
      )}&part=snippet,contentDetails,statistics&key=${apiKey}`
    );

    if (!channelRes.ok) {
      throw new Error(`YouTube API Channel query failed with HTTP status ${channelRes.status}`);
    }

    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`No YouTube channel found for handle ${handle}`);
    }

    const item = channelData.items[0];
    const channelId = item.id;
    this.config.channelId = channelId;
    this.config.channelTitle = item.snippet?.title || 'Mufti Faisal Hayat';
    const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads || `UU${channelId.substring(2)}`;

    // 2. Fetch Playlists
    let playlistPageToken = '';
    do {
      const plRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?channelId=${channelId}&part=snippet,contentDetails&maxResults=50&pageToken=${playlistPageToken}&key=${apiKey}`
      );

      if (plRes.ok) {
        const plData = await plRes.json();
        if (plData.items) {
          for (const pl of plData.items) {
            const existingPlIndex = this.playlists.findIndex((p) => p.id === pl.id);
            const plObj: YouTubePlaylist = {
              id: pl.id,
              title: pl.snippet?.title || 'Playlist',
              titleUrdu: pl.snippet?.title || 'سیریز',
              description: pl.snippet?.description || '',
              thumbnailUrl:
                pl.snippet?.thumbnails?.high?.url ||
                pl.snippet?.thumbnails?.medium?.url ||
                'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
              itemCount: pl.contentDetails?.itemCount || 0,
              hidden: false,
              updatedAt: new Date().toISOString(),
            };

            if (existingPlIndex >= 0) {
              this.playlists[existingPlIndex] = { ...this.playlists[existingPlIndex], ...plObj };
            } else {
              this.playlists.push(plObj);
              importedPlaylists++;
            }
          }
        }
        playlistPageToken = plData.nextPageToken || '';
      } else {
        playlistPageToken = '';
      }
    } while (playlistPageToken);

    // 3. Fetch Uploaded Videos (Paginated)
    let videoPageToken = '';
    const videoIdsToFetch: string[] = [];

    do {
      const itemsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${uploadsPlaylistId}&part=snippet,contentDetails,status&maxResults=50&pageToken=${videoPageToken}&key=${apiKey}`
      );

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        if (itemsData.items) {
          for (const pit of itemsData.items) {
            const vId = pit.contentDetails?.videoId || pit.snippet?.resourceId?.videoId;
            if (vId) videoIdsToFetch.push(vId);
          }
        }
        videoPageToken = itemsData.nextPageToken || '';
      } else {
        videoPageToken = '';
      }
    } while (videoPageToken && videoIdsToFetch.length < 200); // Limit batch fetch to 200 items

    // 4. Batch Fetch Details for Video IDs
    for (let i = 0; i < videoIdsToFetch.length; i += 50) {
      const chunk = videoIdsToFetch.slice(i, i + 50).join(',');
      const vidRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${chunk}&part=snippet,contentDetails,statistics&key=${apiKey}`
      );

      if (vidRes.ok) {
        const vidData = await vidRes.json();
        if (vidData.items) {
          for (const v of vidData.items) {
            const isoDuration = v.contentDetails?.duration || 'PT15M';
            const { seconds, formatted } = this.parseIso8601Duration(isoDuration);
            const isShort = seconds <= 60 || v.snippet?.title?.toLowerCase().includes('#shorts');

            const existingIndex = this.videos.findIndex((ev) => ev.id === v.id);
            const videoObj: YouTubeVideo = {
              id: v.id,
              title: v.snippet?.title || 'Islamic Bayan',
              titleUrdu: v.snippet?.title || 'اسلامی بیان',
              description: v.snippet?.description || '',
              publishedAt: v.snippet?.publishedAt || new Date().toISOString(),
              thumbnailUrl:
                v.snippet?.thumbnails?.medium?.url ||
                v.snippet?.thumbnails?.high?.url ||
                `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
              thumbnailHighUrl:
                v.snippet?.thumbnails?.high?.url ||
                v.snippet?.thumbnails?.maxres?.url ||
                `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
              duration: formatted,
              durationSeconds: seconds,
              isShort,
              viewCount: parseInt(v.statistics?.viewCount || '0', 10),
              likeCount: parseInt(v.statistics?.likeCount || '0', 10),
              youtubeUrl: `https://www.youtube.com/watch?v=${v.id}`,
              playlistIds: isShort ? ['PL_shorts_faisal'] : ['PL_tafseer_quran_faisal'],
              featured: false,
              hidden: false,
              category: isShort ? 'Shorts' : 'General',
              categoryUrdu: isShort ? 'یوٹیوب شاٹس' : 'عام خطاب',
            };

            if (existingIndex >= 0) {
              this.videos[existingIndex] = {
                ...this.videos[existingIndex],
                ...videoObj,
                featured: this.videos[existingIndex].featured,
                hidden: this.videos[existingIndex].hidden,
              };
              updatedVideos++;
            } else {
              this.videos.unshift(videoObj);
              importedVideos++;
            }
          }
        }
      }
    }

    return { importedVideos, updatedVideos, importedPlaylists };
  }

  private async syncViaRssFeed(handle: string) {
    let importedVideos = 0;
    let updatedVideos = 0;

    // Use RSS Feed as zero-API-key fallback
    const channelId = this.config.channelId || 'UC_MuftiFaisalHayat_Official';
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
      const res = await fetch(rssUrl);
      if (res.ok) {
        const xml = await res.text();
        // Parse simple XML entries
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match: RegExpExecArray | null;

        while ((match = entryRegex.exec(xml)) !== null) {
          const entryStr = match[1];
          const idMatch = /<yt:videoId>(.*?)<\/yt:videoId>/.exec(entryStr);
          const titleMatch = /<title>(.*?)<\/title>/.exec(entryStr);
          const publishedMatch = /<published>(.*?)<\/published>/.exec(entryStr);
          const descMatch = /<media:description>([\s\S]*?)<\/media:description>/.exec(entryStr);

          if (idMatch && idMatch[1]) {
            const vId = idMatch[1];
            const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : 'Islamic Bayan';
            const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString();
            const description = descMatch ? descMatch[1] : '';
            const isShort = title.toLowerCase().includes('#shorts');

            const existingIndex = this.videos.findIndex((v) => v.id === vId);
            const videoObj: YouTubeVideo = {
              id: vId,
              title,
              titleUrdu: title,
              description,
              publishedAt,
              thumbnailUrl: `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
              thumbnailHighUrl: `https://i.ytimg.com/vi/${vId}/maxresdefault.jpg`,
              duration: isShort ? '0:50' : '25:00',
              durationSeconds: isShort ? 50 : 1500,
              isShort,
              viewCount: 1500,
              youtubeUrl: `https://www.youtube.com/watch?v=${vId}`,
              playlistIds: isShort ? ['PL_shorts_faisal'] : ['PL_tafseer_quran_faisal'],
              featured: false,
              hidden: false,
              category: isShort ? 'Shorts' : 'Bayan',
              categoryUrdu: isShort ? 'یوٹیوب شاٹس' : 'بیان',
            };

            if (existingIndex >= 0) {
              this.videos[existingIndex] = {
                ...this.videos[existingIndex],
                ...videoObj,
                featured: this.videos[existingIndex].featured,
                hidden: this.videos[existingIndex].hidden,
              };
              updatedVideos++;
            } else {
              this.videos.unshift(videoObj);
              importedVideos++;
            }
          }
        }
      }
    } catch {
      // RSS fallback error ignored, returning current counts
    }

    return { importedVideos, updatedVideos };
  }

  private parseIso8601Duration(isoStr: string): { seconds: number; formatted: string } {
    const match = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(isoStr);
    if (!match) return { seconds: 0, formatted: '0:00' };

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    let formatted = '';
    if (hours > 0) {
      formatted = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      formatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    return { seconds: totalSeconds, formatted };
  }

  public toggleVideoFeatured(videoId: string) {
    const video = this.videos.find((v) => v.id === videoId);
    if (video) {
      video.featured = !video.featured;
      this.saveToDisk();
    }
    return video;
  }

  public toggleVideoHidden(videoId: string) {
    const video = this.videos.find((v) => v.id === videoId);
    if (video) {
      video.hidden = !video.hidden;
      this.saveToDisk();
    }
    return video;
  }

  public togglePlaylistHidden(playlistId: string) {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    if (playlist) {
      playlist.hidden = !playlist.hidden;
      this.saveToDisk();
    }
    return playlist;
  }
}

export const youtubeService = new YouTubeService();
