# Taleem Ud Deen Academy - Platform Blueprint & Free-Cloud Architecture

Comprehensive implementation plan for **TALEEM UD DEEN ACADEMY** featuring a camera-free audio & screen-sharing live bayan studio, 7-worksheet Google Sheets CMS, complete YouTube channel migration (`@MuftiFaisalHayat`), daily auto-synchronization, and zero-unapproved-cost cloud architecture.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All design decisions and functional requirements have been synthesized from the master prompt and your confirmed Phase 1 preferences.

- **Confirmed Choice 1: Daily YouTube Sync Schedule**: The automated background background sync job runs every 24 hours (daily) to fetch new public bayans, shorts, and playlists from YouTube while preserving free API quota limits. Manual "Sync Now" is always available in the Admin Dashboard.
- **Confirmed Choice 2: Free Cloud Media Storage Strategy**: Audio recordings and uploaded media use S3/R2 storage driver compatibility with automatic fallback to local server storage (`/data/uploads` and `/data/recordings`), guaranteeing zero storage fees on free tiers.
- **Confirmed Choice 3: Homepage Experience**: Features a Hero Live Audio Status Card (displaying live audio state or next scheduled bayan), accompanied by a tabbed multi-view video/bayan grid with instant category search and filter controls.
- **Confirmed Choice 4: Camera-Free Live Studio**: Strictly camera-free studio for Mufti Faisal Hayat using high-quality microphone audio capture and native browser screen sharing (`getDisplayMedia`), integrated with a pre-moderation Q&A queue.

---

## 1. Overview & Core Concept

### What It Does
**TALEEM UD DEEN ACADEMY** is an Islamic learning platform and live bayan studio. It offers:
1. **Live Audio & Screen-Sharing Studio**: A camera-free live broadcasting environment for Mufti Faisal Hayat with microphone audio visualizer, screen sharing, live audio recording, and real-time pre-moderation audience Q&A.
2. **Google Sheets Cloud CMS**: Full multi-worksheet CMS synchronization across 7 Google Sheets worksheets (`Videos`, `Playlists`, `Playlist Videos`, `Sync Settings`, `Sync Logs`, `Media Storage`, `Import Jobs`) managed via server-side Service Account or API Keys.
3. **Automated YouTube Integration**: Full channel import and automated daily synchronization for `@MuftiFaisalHayat` covering long-form bayans, Shorts, live streams, and playlists.
4. **Bilingual RTL Support**: Full support for English, Urdu, and Arabic with direction-aware layout (`rtl` and `ltr`).

### Target Audience & Persona
- **Listeners & Students**: Seeking authentic Islamic lectures, live bayan streaming, downloadable audio, and interactive Q&A submission.
- **Academy Host (Mufti Faisal Hayat)**: Wants a simple 1-click camera-free live studio with microphone controls, screen sharing, and simple Q&A moderation.
- **Administrator**: Wants full control over video content, playlist organization, sync frequency, and Google Sheets CMS settings without paid subscriptions.

### Key Value
Delivers a professional, highly accessible Islamic educational platform operating strictly within free cloud tiers, with zero mandatory monthly fees or camera requirement.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Listener Browsing & Audio Playback**:
   - Visitor arrives on homepage and sees the Hero Live Audio Status card. If live, 1-click joins the audio stream; if offline, displays the next scheduled bayan countdown.
   - Visitor searches or filters bayans by category, playlist, or topic in Urdu/English.
   - Listens via sticky persistent bottom audio player with audio download options.

2. **Camera-Free Live Bayan Session (Host)**:
   - Mufti Faisal Hayat opens `/studio` (or clicks "Live Studio" in Admin).
   - Selects microphone input, tests audio visualizer level, optionally shares screen (presentation/quran text), and clicks **Start Bayan**.
   - Audience questions appear in real-time in the host pre-moderation queue. Host can **Approve**, **Pin**, **Answer**, **Reject**, or **Delete** questions.
   - Clicks **Start Recording** to record audio locally/cloud, then **End Bayan**.

3. **Google Sheets CMS & YouTube Sync (Admin)**:
   - Admin navigates to `/admin` -> **Google Sheets CMS**.
   - Views connection status, configures Spreadsheet ID, tests read/write across all 7 worksheets, and triggers manual **Sync Now**.
   - Manages videos, feature tags, custom mp3 links, and sync settings.

### Visual Identity & Theme
- **Aesthetic Direction**: Curatorial, editorial Islamic institutional design inspired by traditional typography and clean contemporary layout.
- **Color Palette**:
  - *Dominant Canvas (60%)*: Soft warm alabaster (`#FBF9F5`) and deep midnight dark mode (`#0F172A`).
  - *Structural Surfaces (30%)*: Muted parchment surfaces (`#F7F4EE` / `#1E293B`) with 1px hairline dividers (`#E2E8F0` / `#334155`).
  - *Curatorial Accents (10%)*: Deep Emerald/Forest Ink (`#065F46` / `#059669`) and Gold Parchment highlights (`#D97706`).
- **Typography & Hierarchy**:
  - Display Font: `Amiri` / `Noto Naskh Arabic` for Arabic/Urdu, paired with `Plus Jakarta Sans` for clean body prose.
  - Direction Support: Automatic `dir="rtl"` toggling when Urdu or Arabic language is selected.
- **Zero-Pill Metadata**: Categories and dates rendered as unboxed inline text with typographic dot separators (`·`).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Camera-Free Audio + Screen Sharing Architecture
- **Chosen Approach**: Utilize browser WebRTC signaling (`getUserMedia` with `{ video: false, audio: true }` and `getDisplayMedia`) with server-side WebSocket broadcasting.
- **Why**: Protects privacy, eliminates camera setup friction for the speaker, reduces bandwidth consumption by 85%, and stays well within free cloud resource limits.
- **Alternatives Considered**: Video camera streaming was rejected based on explicit requirement for zero camera usage.

### Decision 2: Google Sheets CMS Driver
- **Chosen Approach**: Server-side REST endpoints (`/api/sheets/state`, `/api/sheets/config`, `/api/sheets/sync`) with dual support for Google Sheets API Service Accounts and Public Sheet CSV fallbacks.
- **Why**: Provides a free, user-friendly CMS where non-technical admins can edit bayans in Google Sheets directly.
- **Alternatives Considered**: Paid headless CMS solutions were rejected to maintain zero-cost guarantee.

### Decision 3: Automated Daily YouTube Sync
- **Chosen Approach**: Background cron schedule running every 24 hours (`0 0 * * *`) that queries the YouTube Data API v3 and updates local database cache + Google Sheets.
- **Why**: YouTube API daily free quota is 10,000 units. A daily sync uses ~100-200 units, staying safely under 2% of the daily limit.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TALEEM UD DEEN ACADEMY UI                          │
│                                                                         │
│  ┌────────────────────┐   ┌────────────────────┐   ┌─────────────────┐  │
│  │ Studio View        │   │ Listener Audio     │   │ Admin CMS       │  │
│  │ (Camera-Free Mic + │   │ Player & Grid      │   │ Dashboard       │  │
│  │  Screen Share)     │   │                    │   │                 │  │
│  └─────────┬──────────┘   └─────────┬──────────┘   └────────┬────────┘  │
└────────────│────────────────────────│───────────────────────│───────────┘
             │ WebSocket              │ HTTP / SSE            │ REST API
             ▼                        ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS NODE SERVER                             │
│                                                                         │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────┐  │
│  │ WebRTC Signaling     │  │ Live Bayan & Q&A    │  │ YouTube Auto   │  │
│  │ Server               │  │ State Engine        │  │ Sync Service   │  │
│  └─────────┬────────────┘  └──────────┬──────────┘  └───────┬────────┘  │
│            │                          │                     │           │
│            ▼                          ▼                     ▼           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Google Sheets CMS Service (7 Worksheets Driver)                  │   │
│  └────────────────────────────────────┬─────────────────────────────┘   │
└───────────────────────────────────────│─────────────────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌──────────────────────────┐                            ┌──────────────────┐
│  Google Sheets Cloud API │                            │  Local Storage / │
│  (CMS Worksheets)        │                            │  R2 Cloud Drive  │
└──────────────────────────┘                            └──────────────────┘
```

### Data Schema (7 Google Worksheets & Database Entities)
1. **Videos Worksheet**: `id`, `youtube_id`, `title`, `description`, `thumbnail`, `duration`, `published_at`, `category`, `is_featured`, `audio_url`, `views_count`.
2. **Playlists Worksheet**: `id`, `youtube_id`, `title`, `description`, `thumbnail`, `item_count`.
3. **Playlist Videos Worksheet**: `playlist_id`, `video_id`, `position`.
4. **Sync Settings Worksheet**: `sync_interval_hours` (default 24), `auto_sync_enabled`, `last_synced_at`, `channel_id`.
5. **Sync Logs Worksheet**: `id`, `timestamp`, `status`, `videos_imported`, `playlists_imported`, `error_message`.
6. **Media Storage Worksheet**: `file_id`, `file_name`, `storage_provider` (`local` / `r2` / `s3`), `file_url`, `file_size_bytes`, `created_at`.
7. **Import Jobs Worksheet**: `job_id`, `channel_handle`, `status`, `progress_percent`, `started_at`, `completed_at`.

### Verification & Quality Safeguards
- **Compilation**: Clean TypeScript build with zero lint errors (`npm run build`, `npm run lint`).
- **Tests**: Automated unit test suite verifying audio studio state, Q&A pre-moderation queue transitions, and YouTube sync quota calculators.
- **Cost Rules**: Zero paid add-ons, zero mandatory subscriptions.

---
