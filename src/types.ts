export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  words: TranscriptWord[];
}

export interface Transcript {
  segments: TranscriptSegment[];
  fullText: string;
  duration: number;
}

export type GraphicType =
  | "text_overlay"
  | "lower_third"
  | "bullet_list"
  | "comparison_chart"
  | "title_card"
  | "chapter_card";

export interface GraphicCue {
  type: GraphicType;
  startTime: number;
  endTime: number;
  data: TextOverlayData | LowerThirdData | BulletListData | ComparisonChartData | TitleCardData;
}

export interface TextOverlayData {
  text: string;
  emphasis?: boolean;
}

export interface LowerThirdData {
  title: string;
  subtitle?: string;
}

export interface BulletListData {
  heading?: string;
  items: string[];
}

export interface ComparisonChartData {
  leftLabel: string;
  rightLabel: string;
  rows: { label: string; left: string; right: string }[];
}

export interface TitleCardData {
  title: string;
  subtitle?: string;
}

export interface ChapterCardData {
  label?: string;  // e.g. "PART ONE", "THE PROBLEM" — small text above
  title: string;   // e.g. "THE DESTRUCTION" — large bold text
}

export type ColorGradePreset =
  | "cinematic"
  | "warm"
  | "cool"
  | "punchy"
  | "natural"
  | "studio_warm";

export interface ColorGradeSettings {
  preset: ColorGradePreset;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
}

export interface ZoomCue {
  startTime: number;
  endTime: number;
  scale: number;
  originX: number;
  originY: number;
}

export interface CutPoint {
  startTime: number;
  endTime: number;
  reason: string;
}

export type GraphicStyleName = "bold" | "gospel" | "modern" | "documentary" | "minimal";

export interface GraphicStyle {
  accent: string;
  accentGradient: string;
  accentRight: string;
  panelBg: string;
  overlayBg: string;
  text: string;
  subtext: string;
  font: string;
  titleFont: string;
}

export interface EditFeatures {
  colorGrade: boolean;
  zooms: boolean;
  jumpCuts: boolean;
  graphics: boolean;
}

export interface EditPlan {
  videoPath: string;
  transcript: Transcript;
  graphics: GraphicCue[];
  colorGrade: ColorGradeSettings;
  zoomCues: ZoomCue[];
  cutPoints: CutPoint[];
  fps: number;
  durationInSeconds: number;
  style?: GraphicStyleName;
  features?: EditFeatures;
}
