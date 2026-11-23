export interface SRTCaption {
  id: number;
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

export interface CaptionJSON {
  id: number;
  start: number;
  end: number;
  text: string;
  words: string[];
  duration: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  captions: CaptionJSON[];
  templateId: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  logoUri?: string;
  logoPosition: string;
  logoOpacity: number;
  logoSize: number;
  sfxEnabled: boolean;
  sfxCategory: string;
  videoFormat: string;
  outputUri?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  emoji: string;
  preview: {
    bg: string;
    text: string;
    accent: string;
  };
  animation: string;
  description: string;
}
