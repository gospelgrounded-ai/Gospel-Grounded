import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { GraphicStyle, LowerThirdData } from "../types";

interface Props {
  data: LowerThirdData;
  graphicStyle?: GraphicStyle;
}

export const LowerThird: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent         = graphicStyle?.accent ?? "#e94560";
  const accentGradient = graphicStyle?.accentGradient ?? "linear-gradient(90deg, #e94560 0%, #c0392b 100%)";
  const panelBg        = graphicStyle?.panelBg ?? "rgba(10, 10, 20, 0.85)";
  const font           = graphicStyle?.font ?? "'Segoe UI', sans-serif";
  const textColor      = graphicStyle?.text ?? "#ffffff";
  const subtextColor   = graphicStyle?.subtext ?? "#aaaacc";

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
            background: accentGradient,
            height: 4,
            width: "100%",
            marginBottom: 8,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            background: panelBg,
            padding: "14px 28px",
            borderRadius: "0 8px 8px 0",
            borderLeft: `4px solid ${accent}`,
          }}
        >
          <div
            style={{
              color: textColor,
              fontSize: 40,
              fontFamily: font,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {data.title}
          </div>
          {data.subtitle && (
            <div
              style={{
                color: subtextColor,
                fontSize: 28,
                fontFamily: font,
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
