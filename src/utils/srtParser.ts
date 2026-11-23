import { SRTCaption, CaptionJSON } from '../types';

/**
 * Parse SRT file content → array of captions
 * No AI needed — pure code parsing
 */
export function parseSRT(srtContent: string): SRTCaption[] {
  const captions: SRTCaption[] = [];
  // Normalize line endings
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0].trim(), 10);
    const timeLine = lines[1].trim();
    const text = lines.slice(2).join(' ').trim();

    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000;

    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000;

    captions.push({ id, start, end, text });
  }

  return captions;
}

/**
 * Convert SRT captions → structured JSON for Motion app
 */
export function srtToMotionJSON(captions: SRTCaption[]): CaptionJSON[] {
  return captions.map((cap) => ({
    id: cap.id,
    start: cap.start,
    end: cap.end,
    text: cap.text,
    words: cap.text.split(/\s+/).filter(Boolean),
    duration: parseFloat((cap.end - cap.start).toFixed(3)),
  }));
}

/**
 * Format seconds → SRT time string
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${padMs(ms)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
function padMs(n: number): string {
  return n.toString().padStart(3, '0');
}

/**
 * Generate sample SRT for testing
 */
export function generateSampleSRT(): string {
  return `1
00:00:01,000 --> 00:00:03,500
আমি আজকে তোমাদের দেখাব

2
00:00:03,800 --> 00:00:06,200
কিভাবে এই Motion app কাজ করে

3
00:00:06,500 --> 00:00:09,000
যেকোনো audio থেকে সুন্দর video বানাও

4
00:00:09,200 --> 00:00:12,000
20টা motion template থেকে বেছে নাও

5
00:00:12,200 --> 00:00:15,000
এবং নিজের logo যোগ করো`;
}
