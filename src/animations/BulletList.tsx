import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BulletListData, GraphicStyle } from "../types";

interface Props {
  data: BulletListData;
  graphicStyle?: GraphicStyle;
}

export const BulletList: React.FC<Props> = ({ data, graphicStyle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent    = graphicStyle?.accent ?? "#e94560";
  const panelBg   = graphicStyle?.panelBg ?? "rgba(8, 8, 20, 0.88)";
  const font      = graphicStyle?.font ?? "'Segoe UI', sans-serif";
  const textColor = graphicStyle?.text ?? "#ffffff";

  const containerEnter = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });
  const containerExit = spring({
    frame: frame - (durationInFrames - fps * 0.4),
    fps,
    config: { damping: 16, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-end",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          background: panelBg,
          borderRadius: 16,
          padding: "32px 48px",
          maxWidth: "55%",
          opacity: containerEnter - containerExit,
          transform: `translateX(${(1 - containerEnter + containerExit) * 60}px)`,
        }}
      >
        {data.heading && (
          <div
            style={{
              color: accent,
              fontSize: 32,
              fontFamily: font,
              fontWeight: 700,
              marginBottom: 20,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {data.heading}
          </div>
        )}
        {data.items.map((item, i) => {
          const itemDelay = i * (fps * 0.15);
          const itemEnter = spring({
            frame: frame - itemDelay,
            fps,
            config: { damping: 18, stiffness: 140 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: i < data.items.length - 1 ? 16 : 0,
                opacity: itemEnter,
                transform: `translateX(${(1 - itemEnter) * 30}px)`,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: accent,
                  marginTop: 14,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  color: textColor,
                  fontSize: 34,
                  fontFamily: font,
                  fontWeight: 500,
                  lineHeight: 1.35,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
