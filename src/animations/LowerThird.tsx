import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LowerThirdData } from "../types";

interface Props {
  data: LowerThirdData;
}

export const LowerThird: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 150 } });
  const exit = spring({
    frame: frame - (durationInFrames - fps * 0.35),
    fps,
    config: { damping: 18, stiffness: 150 },
  });

  const translateX = (1 - enter + exit) * -80;
  const opacity = enter - exit;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "0 80px 100px",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #e94560 0%, #c0392b 100%)",
            height: 4,
            width: "100%",
            marginBottom: 8,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            background: "rgba(10, 10, 20, 0.85)",
            padding: "14px 28px",
            borderRadius: "0 8px 8px 0",
            borderLeft: "4px solid #e94560",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 40,
              fontFamily: "'Segoe UI', sans-serif",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {data.title}
          </div>
          {data.subtitle && (
            <div
              style={{
                color: "#aaaacc",
                fontSize: 28,
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 400,
                marginTop: 4,
              }}
            >
              {data.subtitle}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
