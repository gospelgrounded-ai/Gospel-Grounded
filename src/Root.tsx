import React from "react";
import { Composition, getInputProps } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { EditPlan } from "./types";

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps() as { plan?: EditPlan };
  const plan = inputProps?.plan;

  const fps = plan?.fps ?? 30;
  const durationInSeconds = plan?.durationInSeconds ?? 60;

  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={Math.ceil(durationInSeconds * fps)}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{ plan: plan ?? null }}
    />
  );
};
