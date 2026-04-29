import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TitleCardData } from "../types";

interface Props {
  data: TitleCardData;
}

export const TitleCard: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const exit = spring({
    frame: frame - (durationInFrames - fps * 0.5),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.0) 100%)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: enter - exit,
          transform: `scale(${0.85 + enter * 0.15 - exit * 0.15})`,
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: 80,
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: 800,
            lineHeight: 1.1,
            textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            letterSpacing: "-2px",
            maxWidth: 1200,
          }}
        >
          {data.title}
        </div>
        {data.subtitle && (
          <div
            style={{
              color: "#e94560",
              fontSize: 42,
              fontFamily: "'Segoe UI', sans-serif",
              fontWeight: 500,
              marginTop: 24,
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            {data.subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
