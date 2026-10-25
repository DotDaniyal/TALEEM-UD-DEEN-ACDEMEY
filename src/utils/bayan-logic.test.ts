import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoomCode,
  generateShareableLinks,
  calculateTimeRemaining,
  formatDuration,
  filterLectures,
  canAccessRecording,
  validateBayanSession,
  formatIslamicDateEstimate,
} from './bayan-logic.ts';
import { RecordedBayan } from '../types';

test('generateRoomCode produces clean formatted code with prefix', () => {
  const code = generateRoomCode('tafseer');
  assert.ok(code.startsWith('tafseer-'));
  assert.ok(code.length >= 15);
});

test('generateShareableLinks creates valid join and WhatsApp URLs', () => {
  const links = generateShareableLinks(
    'https://islamic-bayan.online',
    'bayan-123',
    'Tafseer Surah Al-Kahf',
    'ur'
  );
  assert.equal(links.joinUrl, 'https://islamic-bayan.online/join?session=bayan-123');
  assert.ok(links.whatsappShareUrl.includes('api.whatsapp.com/send'));
  assert.ok(links.shareText.includes('Tafseer Surah Al-Kahf'));
  assert.ok(links.shareText.includes('السلام علیکم'));
});

test('calculateTimeRemaining returns correct future countdown', () => {
  const now = 1000000000000;
  // 2 hours, 15 minutes, 30 seconds ahead
  const target = new Date(now + (2 * 3600 + 15 * 60 + 30) * 1000).toISOString();
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.isPast, false);
  assert.equal(res.hours, 2);
  assert.equal(res.minutes, 15);
  assert.equal(res.seconds, 30);
  assert.equal(res.formattedCountdown, '02:15:30');
});

test('calculateTimeRemaining detects past events', () => {
  const now = 1000000000000;
  // 5 hours ago
  const target = new Date(now - 5 * 3600 * 1000).toISOString();
  const res = calculateTimeRemaining(target, now);

  assert.equal(res.isPast, true);
  assert.equal(res.isNow, false);
});

test('formatDuration formats seconds into MM:SS and HH:MM:SS', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(75), '01:15');
  assert.equal(formatDuration(3665), '01:01:05');
});

test('canAccessRecording strictly enforces visibility rules', () => {
  // Public
  assert.equal(canAccessRecording('public', false, false), true);
  // Unlisted: only accessible with direct link
  assert.equal(canAccessRecording('unlisted', false, false), false);
  assert.equal(canAccessRecording('unlisted', false, true), true);
  // Private: only accessible to admin
  assert.equal(canAccessRecording('private', false, true), false);
  assert.equal(canAccessRecording('private', true, false), true);
});

test('filterLectures filters by category and search keyword', () => {
  const mockLectures: RecordedBayan[] = [
    {
      id: '1',
      title: 'Tafseer Surah Al-Baqarah',
      titleUrdu: 'تفسیر سورۃ البقرۃ',
      description: 'Detailed analysis of verses',
      descriptionUrdu: 'آیات مبارکہ کی تفصیلی تشریح',
      speaker: 'Sheikh Ahmad',
      speakerUrdu: 'شیخ احمد',
      recordedDate: '2026-03-01',
      duration: '45:00',
      durationSeconds: 2700,
      category: 'Tafseer',
      categoryUrdu: 'تفسیر',
      videoUrl: '',
      thumbnailUrl: '',
      visibility: 'public',
      downloadsAllowed: true,
      viewsCount: 150,
    },
    {
      id: '2',
      title: 'Seerah of Prophet Muhammad',
      titleUrdu: 'سیرت النبی صلی اللہ علیہ وسلم',
      description: 'Lessons from the Makkan period',
      descriptionUrdu: 'مکی دور کے اسباق',
      speaker: 'Sheikh Ahmad',
      speakerUrdu: 'شیخ احمد',
      recordedDate: '2026-03-05',
      duration: '52:00',
      durationSeconds: 3120,
      category: 'Seerah',
      categoryUrdu: 'سیرت',
      videoUrl: '',
      thumbnailUrl: '',
      visibility: 'public',
      downloadsAllowed: true,
      viewsCount: 220,
    },
  ];

  const searchResults = filterLectures(mockLectures, 'Baqarah', 'all');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, '1');

  const categoryResults = filterLectures(mockLectures, '', 'Seerah');
  assert.equal(categoryResults.length, 1);
  assert.equal(categoryResults[0].id, '2');
});

test('validateBayanSession checks title requirement and date format', () => {
  const invalid = validateBayanSession({});
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length > 0);

  const valid = validateBayanSession({
    titleUrdu: 'عظمتِ رمضان',
    scheduledAt: new Date().toISOString(),
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('formatIslamicDateEstimate calculates Hijri year estimate correctly', () => {
  const result = formatIslamicDateEstimate('2026-05-15T00:00:00Z');
  assert.equal(typeof result.gregorianFormatted, 'string');
  assert.ok(result.hijriYearEstimate >= 1445 && result.hijriYearEstimate <= 1450);
});
