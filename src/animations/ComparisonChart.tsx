import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ComparisonChartData, GraphicStyle } from "../types";

interface Props {
  data: ComparisonChartData;
  graphicStyle?: GraphicStyle;
}

export const ComparisonChart: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent       = graphicStyle?.accent ?? "#e94560";
  const accentRight  = graphicStyle?.accentRight ?? "#4ecdc4";
  const panelBg      = graphicStyle?.panelBg ?? "rgba(8, 8, 20, 0.92)";
  const font         = graphicStyle?.font ?? "'Segoe UI', sans-serif";
  const textColor    = graphicStyle?.text ?? "#ffffff";
  const subtextColor = graphicStyle?.subtext ?? "#aaaacc";

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const exit = spring({
    frame: frame - (durationInFrames - fps * 0.4),
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const opacity = enter - exit;
  const scale = 0.92 + enter * 0.08 - exit * 0.08;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          background: panelBg,
          borderRadius: 20,
          padding: "40px 60px",
          minWidth: 700,
          maxWidth: "80%",
        }}
      >
        <div style={{ display: "flex", marginBottom: 20 }}>
          <div style={{ flex: 1 }} />
          <div
            style={{
              flex: 1,
              color: accent,
              fontSize: 30,
              fontFamily: font,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {data.leftLabel}
          </div>
          <div
            style={{
              flex: 1,
              color: accentRight,
              fontSize: 30,
              fontFamily: font,
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {data.rightLabel}
          </div>
        </div>
        {data.rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.08)",
              padding: "16px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                color: subtextColor,
                fontSize: 26,
                fontFamily: font,
                fontWeight: 500,
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                flex: 1,
                color: textColor,
                fontSize: 26,
                fontFamily: font,
                textAlign: "center",
              }}
            >
              {row.left}
            </div>
            <div
              style={{
                flex: 1,
                color: textColor,
                fontSize: 26,
                fontFamily: font,
                textAlign: "center",
              }}
            >
              {row.right}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
