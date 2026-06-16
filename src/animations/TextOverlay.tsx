import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GraphicStyle, TextOverlayData } from "../types";

interface Props {
  data: TextOverlayData;
  graphicStyle?: GraphicStyle;
}

export const TextOverlay: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent   = graphicStyle?.accent ?? "#e94560";
  const panelBg  = graphicStyle?.overlayBg ?? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
  const font     = graphicStyle?.font ?? "'Segoe UI', sans-serif";
  const textColor = graphicStyle?.text ?? "#ffffff";

  const enterProgress = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const exitProgress = spring({
    frame: frame - (durationInFrames - fps * 0.4),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const opacity = enterProgress - exitProgress;
  const translateY = (1 - enterProgress) * 20;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          background: data.emphasis ? panelBg : "rgba(0,0,0,0.75)",
          borderLeft: data.emphasis ? `5px solid ${accent}` : "none",
          color: textColor,
          fontSize: data.emphasis ? 52 : 44,
          fontFamily: font,
          fontWeight: data.emphasis ? 800 : 600,
          padding: "20px 40px",
          borderRadius: 12,
          maxWidth: "85%",
          textAlign: "center",
          opacity,
          transform: `translateY(${translateY}px)`,
          letterSpacing: data.emphasis ? "-1px" : "normal",
          lineHeight: 1.25,
        }}
      >
        {data.text}
      </div>
    </AbsoluteFill>
  );
};
