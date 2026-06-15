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

export type Slide = CoverSlide | PointSlide | ScriptureSlide | CalloutSlide | CTASlide;

export interface GenerateRequest {
  topic: string;
  style?: 'inspirational' | 'educational' | 'devotional';
}

export interface GenerateResponse {
  slides: Slide[];
}
