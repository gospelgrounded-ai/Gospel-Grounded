import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Transcript } from "../types";

interface Props {
  transcript: Transcript;
}

interface SubtitleChunk {
  text: string;
  start: number;
  end: number;
}

const WORDS_PER_CHUNK = 3;

function buildSubtitleChunks(transcript: Transcript): SubtitleChunk[] {
  const allWords = transcript.segments.flatMap((s) => s.words);
  const chunks: SubtitleChunk[] = [];

  for (let i = 0; i < allWords.length; i += WORDS_PER_CHUNK) {
    const group = allWords.slice(i, i + WORDS_PER_CHUNK);
    if (group.length === 0) continue;
    chunks.push({
      text: group.map((w) => w.word.trim()).join(" "),
      start: group[0].start,
      end: group[group.length - 1].end,
    });
  }

  return chunks;
}

export const Subtitle: React.FC<Props> = ({ transcript }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const chunks = React.useMemo(() => buildSubtitleChunks(transcript), [transcript]);
  const current = chunks.find((c) => currentTime >= c.start && currentTime <= c.end);

  if (!current) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 48 }}>
      <div
        style={{
          background: "rgba(8, 8, 20, 0.88)",
          color: "#ffffff",
          fontSize: 52,
          fontFamily: "'Segoe UI', sans-serif",
          fontWeight: 700,
          padding: "14px 44px",
          borderRadius: 10,
          borderLeft: "5px solid #e94560",
          maxWidth: 1440,
          textAlign: "center",
          letterSpacing: "0.5px",
          lineHeight: 1.3,
        }}
      >
        {current.text}
      </div>
    </AbsoluteFill>
  );
};
