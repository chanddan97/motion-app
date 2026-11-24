export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface CaptionJSON {
  id: number;
  start: number;
  end: number;
  text: string;
  words: string[];
  wordTimeline?: WordTiming[];
  emotion?: string;
  sfx?: string;
  duration: number;
}

export interface SRTCaption {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface ProjectSettings {
  templateId: string;
  videoFormat: 'reel' | 'youtube' | 'square';
  fontFamily: string;
  fontSize: number;
  textColor: string;
  accentColor: string;
  logoUri?: string;
  logoPosition: string;
  logoOpacity: number;
  logoSize: number;
  sfxEnabled: boolean;
  audioUri?: string;
  audioDuration?: number;
}
