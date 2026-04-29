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
  | "title_card";

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

export interface EditPlan {
  videoPath: string;
  transcript: Transcript;
  graphics: GraphicCue[];
  fps: number;
  durationInSeconds: number;
}
