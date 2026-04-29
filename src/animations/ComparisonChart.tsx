import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ComparisonChartData } from "../types";

interface Props {
  data: ComparisonChartData;
}

export const ComparisonChart: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

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
          background: "rgba(8, 8, 20, 0.92)",
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
              color: "#e94560",
              fontSize: 30,
              fontFamily: "'Segoe UI', sans-serif",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {data.leftLabel}
          </div>
          <div
            style={{
              flex: 1,
              color: "#4ecdc4",
              fontSize: 30,
              fontFamily: "'Segoe UI', sans-serif",
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
                color: "#aaaacc",
                fontSize: 26,
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 500,
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                flex: 1,
                color: "#ffffff",
                fontSize: 26,
                fontFamily: "'Segoe UI', sans-serif",
                textAlign: "center",
              }}
            >
              {row.left}
            </div>
            <div
              style={{
                flex: 1,
                color: "#ffffff",
                fontSize: 26,
                fontFamily: "'Segoe UI', sans-serif",
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
