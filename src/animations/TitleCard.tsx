import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GraphicStyle, TitleCardData } from "../types";

interface Props {
  data: TitleCardData;
  graphicStyle?: GraphicStyle;
}

export const TitleCard: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent         = graphicStyle?.accent ?? "#e94560";
  const font           = graphicStyle?.titleFont ?? "'Segoe UI', sans-serif";
  const backdropFilter = graphicStyle?.panelFilter;
  const glassBorder    = graphicStyle?.borderColor ? `1px solid ${graphicStyle.borderColor}` : undefined;

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
        background: backdropFilter
          ? "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.0) 100%)"
          : "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.0) 100%)",
        backdropFilter: backdropFilter ? "blur(4px)" : undefined,
        WebkitBackdropFilter: backdropFilter ? "blur(4px)" : undefined,
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
            fontFamily: font,
            fontWeight: 800,
            lineHeight: 1.1,
            textShadow: "0 4px 24px rgba(0,0,0,0.75)",
            letterSpacing: "-2px",
            maxWidth: 1200,
          }}
        >
          {data.title}
        </div>
        {data.subtitle && (
          <div
            style={{
              color: accent,
              fontSize: 42,
              fontFamily: font,
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
