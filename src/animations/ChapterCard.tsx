import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChapterCardData, GraphicStyle } from "../types";

interface Props {
  data: ChapterCardData;
  graphicStyle?: GraphicStyle;
}

export const ChapterCard: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent    = graphicStyle?.accent ?? "#e94560";
  const font      = graphicStyle?.titleFont ?? "'Segoe UI', sans-serif";
  const textColor = graphicStyle?.text ?? "#ffffff";

  const bgEnter = spring({ frame, fps, config: { damping: 20, stiffness: 70 } });
  const bgExit  = spring({
    frame: frame - (durationInFrames - fps * 0.5),
    fps,
    config: { damping: 20, stiffness: 70 },
  });

  const labelEnter = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 100 } });
  const titleEnter = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 90 } });

  const visibility = Math.max(0, bgEnter - bgExit);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `rgba(6, 4, 2, ${visibility * 0.96})`,
      }}
    >
      {/* Subtle radial warm glow — gives depth like the Allen Parr style */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(180, 80, 30, 0.28) 0%, transparent 70%)",
          opacity: visibility,
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", padding: "0 80px" }}>
        {data.label && (
          <div
            style={{
              color: accent,
              fontSize: 28,
              fontFamily: font,
              fontWeight: 600,
              letterSpacing: "12px",
              textTransform: "uppercase",
              marginBottom: 28,
              opacity: Math.max(0, labelEnter - bgExit),
              transform: `translateY(${(1 - Math.max(0, labelEnter - bgExit)) * 16}px)`,
            }}
          >
            {data.label}
          </div>
        )}
        <div
          style={{
            color: textColor,
            fontSize: 108,
            fontFamily: font,
            fontWeight: 800,
            letterSpacing: "-4px",
            textTransform: "uppercase",
            lineHeight: 0.92,
            maxWidth: 1400,
            textShadow: "0 6px 48px rgba(0,0,0,0.9)",
            opacity: Math.max(0, titleEnter - bgExit),
            transform: `scale(${0.9 + Math.max(0, titleEnter - bgExit) * 0.1})`,
          }}
        >
          {data.title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
