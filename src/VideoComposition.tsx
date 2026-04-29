import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
} from "remotion";
import { EditPlan, GraphicCue } from "./types";
import { TextOverlay } from "./animations/TextOverlay";
import { LowerThird } from "./animations/LowerThird";
import { BulletList } from "./animations/BulletList";
import { ComparisonChart } from "./animations/ComparisonChart";
import { TitleCard } from "./animations/TitleCard";

interface Props {
  plan: EditPlan | null;
}

function GraphicSequence({ cue, fps }: { cue: GraphicCue; fps: number }) {
  const from = Math.round(cue.startTime * fps);
  const durationInFrames = Math.max(1, Math.round((cue.endTime - cue.startTime) * fps));

  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      {cue.type === "text_overlay" && (
        <TextOverlay data={cue.data as import("./types").TextOverlayData} />
      )}
      {cue.type === "lower_third" && (
        <LowerThird data={cue.data as import("./types").LowerThirdData} />
      )}
      {cue.type === "bullet_list" && (
        <BulletList data={cue.data as import("./types").BulletListData} />
      )}
      {cue.type === "comparison_chart" && (
        <ComparisonChart data={cue.data as import("./types").ComparisonChartData} />
      )}
      {cue.type === "title_card" && (
        <TitleCard data={cue.data as import("./types").TitleCardData} />
      )}
    </Sequence>
  );
}

export const VideoComposition: React.FC<Props> = ({ plan }) => {
  const { fps } = useVideoConfig();

  if (!plan) {
    return (
      <AbsoluteFill style={{ background: "#111", justifyContent: "center", alignItems: "center" }}>
        <div style={{ color: "#fff", fontSize: 48, fontFamily: "sans-serif" }}>
          No edit plan loaded. Run the workflow first.
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo src={plan.videoPath} />
      {plan.graphics.map((cue, i) => (
        <GraphicSequence key={i} cue={cue} fps={fps} />
      ))}
    </AbsoluteFill>
  );
};
