import { SRTCaption, CaptionJSON } from '../types';

/**
 * Enhanced SRT Parser supporting millisecond exact accuracy
 */
export function parseSRT(srtContent: string): SRTCaption[] {
  const captions: SRTCaption[] = [];
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const id = parseInt(lines[0].trim(), 10) || captions.length + 1;
    const timeLine = lines[1].trim();
    const text = lines.slice(2).join(' ').trim();

    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const start =
      parseInt(timeMatch[1], 10) * 3600 +
      parseInt(timeMatch[2], 10) * 60 +
      parseInt(timeMatch[3], 10) +
      parseInt(timeMatch[4], 10) / 1000;

    const end =
      parseInt(timeMatch[5], 10) * 3600 +
      parseInt(timeMatch[6], 10) * 60 +
      parseInt(timeMatch[7], 10) +
      parseInt(timeMatch[8], 10) / 1000;

    captions.push({ id, start, end, text });
  }

  return captions;
}

/**
 * Automatically converts SRT directly into Rich Video Motion JSON.
 * - Extracts word-by-word timing for animated punch/karaoke highlight
 * - Analyzes emotional emphasis (fire, impact, calm, question)
 * - Assigns automatic Sound Effects trigger points
 */
export function srtToMotionJSON(captions: SRTCaption[]): CaptionJSON[] {
  return captions.map((cap) => {
    const words = cap.text.split(/\s+/).filter(Boolean);
    const totalDuration = Math.max(0.2, cap.end - cap.start);
    const wordDuration = totalDuration / Math.max(1, words.length);

    // Build word-level timeline for smooth Hormozi-style motion graphics
    const wordTimeline = words.map((w, idx) => ({
      word: w,
      start: parseFloat((cap.start + idx * wordDuration).toFixed(3)),
      end: parseFloat((cap.start + (idx + 1) * wordDuration).toFixed(3)),
    }));

    // Auto emotion & SFX detection based on punctuation & keywords
    let emotion = 'neutral';
    let sfx = 'whoosh';

    if (cap.text.includes('!') || cap.text.match(/(দারুণ|আশ্চর্য|অসাধারণ|fire|beast|power|wow)/i)) {
      emotion = 'excited';
      sfx = 'impact';
    } else if (cap.text.includes('?')) {
      emotion = 'question';
      sfx = 'transition';
    }

    return {
      id: cap.id,
      start: cap.start,
      end: cap.end,
      text: cap.text,
      words,
      wordTimeline,
      emotion,
      sfx,
      duration: parseFloat(totalDuration.toFixed(3)),
    };
  });
}

/**
 * Format seconds into mm:ss display
 */
export function formatTimeDisplay(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
