import React from "react";
import { Composition, getInputProps, registerRoot } from "remotion";
import { VideoComposition } from "./VideoComposition";
import { EditPlan } from "./types";
import { computeEditedDuration } from "./editUtils";

const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps() as { plan?: EditPlan };
  const plan = inputProps?.plan;

  const fps = plan?.fps ?? 30;
  const editedDuration = plan
    ? computeEditedDuration(plan.durationInSeconds, plan.cutPoints ?? [])
    : 60;

  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={Math.ceil(editedDuration * fps)}
      fps={fps}
      width={1920}
      height={1080}
      defaultProps={{ plan: plan ?? null }}
    />
  );
};

registerRoot(RemotionRoot);
