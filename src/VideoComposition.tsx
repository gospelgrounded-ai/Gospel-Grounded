import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  spring,
} from "remotion";
import { EditPlan, GraphicCue, GraphicStyle, ZoomCue, CutPoint } from "./types";
import { TextOverlay } from "./animations/TextOverlay";
import { LowerThird } from "./animations/LowerThird";
import { BulletList } from "./animations/BulletList";
import { ComparisonChart } from "./animations/ComparisonChart";
import { TitleCard } from "./animations/TitleCard";
import { ChapterCard } from "./animations/ChapterCard";
import { computeRetainedSegments, remapTime } from "./editUtils";
import { getStyle } from "./styles";

interface Props {
  plan: EditPlan | null;
}

function GraphicSequence({
  cue,
  fps,
  graphicStyle,
}: {
  cue: GraphicCue;
  fps: number;
  graphicStyle: GraphicStyle;
}) {
  const from = Math.round(cue.startTime * fps);
  const durationInFrames = Math.max(1, Math.round((cue.endTime - cue.startTime) * fps));

  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      {cue.type === "text_overlay" && (
        <TextOverlay
          data={cue.data as import("./types").TextOverlayData}
          graphicStyle={graphicStyle}
        />
      )}
      {cue.type === "lower_third" && (
        <LowerThird
          data={cue.data as import("./types").LowerThirdData}
          graphicStyle={graphicStyle}
        />
      )}
      {cue.type === "bullet_list" && (
        <BulletList
          data={cue.data as import("./types").BulletListData}
          graphicStyle={graphicStyle}
        />
      )}
      {cue.type === "comparison_chart" && (
        <ComparisonChart
          data={cue.data as import("./types").ComparisonChartData}
          graphicStyle={graphicStyle}
        />
      )}
      {cue.type === "title_card" && (
        <TitleCard
          data={cue.data as import("./types").TitleCardData}
          graphicStyle={graphicStyle}
        />
      )}
      {cue.type === "chapter_card" && (
        <ChapterCard
          data={cue.data as import("./types").ChapterCardData}
          graphicStyle={graphicStyle}
        />
      )}
    </Sequence>
  );
}

function useZoomTransform(zoomCues: ZoomCue[], cutPoints: CutPoint[], fps: number) {
  const frame = useCurrentFrame();
  const editedTime = frame / fps;

  const remappedZooms = zoomCues
    .map((z) => ({
      ...z,
      editedStart: remapTime(z.startTime, cutPoints),
      editedEnd: remapTime(z.endTime, cutPoints),
    }))
    .filter(
      (z): z is ZoomCue & { editedStart: number; editedEnd: number } =>
        z.editedStart !== null && z.editedEnd !== null
    );

  const active = remappedZooms.find(
    (z) => editedTime >= z.editedStart && editedTime <= z.editedEnd
  );

  if (!active) return { scale: 1.0, originX: 0.5, originY: 0.5 };

  const startFrame = Math.round(active.editedStart * fps);
  const endFrame = Math.round(active.editedEnd * fps);
  const rampFrames = Math.max(6, Math.min(15, Math.floor((endFrame - startFrame) / 4)));

  const enterProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 80 },
    durationInFrames: rampFrames,
  });

  const exitProgress = spring({
    frame: frame - (endFrame - rampFrames),
    fps,
    config: { damping: 18, stiffness: 80 },
    durationInFrames: rampFrames,
  });

  const zoomAmount = active.scale - 1.0;
  const scale = 1.0 + zoomAmount * Math.max(0, enterProgress - exitProgress);

  return { scale, originX: active.originX, originY: active.originY };
}

export const VideoComposition: React.FC<Props> = ({ plan }) => {
  const { fps } = useVideoConfig();

  const cutPoints = plan?.cutPoints ?? [];
  const zoomCues = plan?.zoomCues ?? [];
  const { scale, originX, originY } = useZoomTransform(zoomCues, cutPoints, fps);

  if (!plan) {
    return (
      <AbsoluteFill style={{ background: "#111", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "#fff", fontSize: 48, fontFamily: "sans-serif" }}>
          No edit plan loaded. Run the workflow first.
        </div>
      </AbsoluteFill>
    );
  }

  const graphicStyle = getStyle(plan.style);

  const colorGrade = plan.colorGrade ?? { brightness: 1, contrast: 1, saturate: 1, sepia: 0 };
  const colorFilter = `brightness(${colorGrade.brightness}) contrast(${colorGrade.contrast}) saturate(${colorGrade.saturate}) sepia(${colorGrade.sepia})`;

  const segments = cutPoints.length > 0
    ? computeRetainedSegments(plan.durationInSeconds, cutPoints)
    : null;

  const remappedGraphics = plan.graphics
    .map((cue) => {
      const start = remapTime(cue.startTime, cutPoints);
      const end = remapTime(cue.endTime, cutPoints);
      if (start === null || end === null || end <= start) return null;
      return { ...cue, startTime: start, endTime: end };
    })
    .filter((cue): cue is GraphicCue => cue !== null);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: colorFilter,
          transform: `scale(${scale})`,
          transformOrigin: `${originX * 100}% ${originY * 100}%`,
        }}
      >
        {segments ? (
          segments.map((seg, i) => (
            <Sequence
              key={i}
              from={Math.round(seg.editedStart * fps)}
              durationInFrames={Math.max(1, Math.round(seg.durationSecs * fps))}
            >
              <AbsoluteFill>
                <OffthreadVideo
                  src={plan.videoPath}
                  startFrom={Math.round(seg.originalStart * fps)}
                />
              </AbsoluteFill>
            </Sequence>
          ))
        ) : (
          <OffthreadVideo src={plan.videoPath} />
        )}
      </AbsoluteFill>
      {remappedGraphics.map((cue, i) => (
        <GraphicSequence key={i} cue={cue} fps={fps} graphicStyle={graphicStyle} />
      ))}
    </AbsoluteFill>
  );
};
