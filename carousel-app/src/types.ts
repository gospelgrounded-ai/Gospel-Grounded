export interface CoverSlide {
  type: 'cover';
  title: string;
  subtitle: string;
}

export interface PointSlide {
  type: 'point';
  number: number;
  headline: string;
  body: string;
}

export interface ScriptureSlide {
  type: 'scripture';
  context?: string;  // short phrase shown above the verse, e.g. "When you feel overwhelmed…"
  verse: string;
  reference: string;
}

export interface CalloutSlide {
  type: 'callout';
  statement: string;
}

export interface CTASlide {
  type: 'cta';
  headline: string;
  action: string;
}

export interface QuoteSlide {
  type: 'quote';
  quote: string;
  author: string;
  authorTitle?: string;  // e.g. "Puritan Pastor" or "20th-century apologist"
}

export type Slide = CoverSlide | PointSlide | ScriptureSlide | QuoteSlide | CalloutSlide | CTASlide;

export type Theme = 'warm' | 'dark' | 'forest' | 'terra';

export interface GenerateRequest {
  topic: string;
  style?: 'inspirational' | 'educational' | 'devotional';
  theme?: Theme;
}

export interface GenerateResponse {
  slides: Slide[];
}
