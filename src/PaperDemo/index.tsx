import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  staticFile,
} from "remotion";
import { z } from "zod";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { MethodScene } from "./scenes/MethodScene";
import { ContributionsScene } from "./scenes/ContributionsScene";
import { ResultsScene } from "./scenes/ResultsScene";
import type { PaperData } from "./types";

// ─── Zod schema for Remotion Studio props panel ───────────────────────────────

export const paperDemoSchema = z.object({
  dataUrl: z.string().default("paper/paper-data.json"),
  paperData: z.any().optional(),
});

// ─── calculateMetadata — fetch JSON and set dynamic duration ─────────────────

export const calculateMetadata: CalculateMetadataFunction<
  z.infer<typeof paperDemoSchema>
> = async ({ props, abortSignal }) => {
  const url = staticFile(props.dataUrl);
  const response = await fetch(url, { signal: abortSignal });
  if (!response.ok) {
    throw new Error(`Failed to fetch paper data from ${url}: ${response.status}`);
  }
  const data: PaperData = await response.json();

  const fps = 30;
  const totalSeconds = data.scenes.reduce(
    (sum, scene) => sum + scene.duration_seconds,
    0,
  );

  return {
    durationInFrames: Math.ceil(totalSeconds * fps),
    defaultOutName: `${data.meta.title.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.mp4`,
    props: { ...props, paperData: data },
  };
};

// ─── Main composition ─────────────────────────────────────────────────────────

export const PaperDemo: React.FC<z.infer<typeof paperDemoSchema>> = (props) => {
  const data = props.paperData as PaperData | null;

  if (!data) {
    return (
      <AbsoluteFill style={{
        background: "#080d1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#4f9cff", fontFamily: "monospace", fontSize: 32,
      }}>
        Loading paper data…
      </AbsoluteFill>
    );
  }

  const fps = 30;
  let currentFrame = 0;

  const sequences = data.scenes.map((scene, i) => {
    const from = currentFrame;
    const durationInFrames = Math.ceil(scene.duration_seconds * fps);
    currentFrame += durationInFrames;

    const sceneElement = (() => {
      switch (scene.type) {
        case "title":
          return <TitleScene scene={scene} data={data} />;
        case "problem":
          return <ProblemScene scene={scene} data={data} />;
        case "method":
          return <MethodScene scene={scene} data={data} />;
        case "contributions":
          return <ContributionsScene scene={scene} data={data} />;
        case "results":
          return <ResultsScene scene={scene} data={data} />;
        default:
          return null;
      }
    })();

    if (!sceneElement) return null;

    return (
      <Sequence
        key={i}
        from={from}
        durationInFrames={durationInFrames}
        premountFor={30}
      >
        {sceneElement}
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ background: data.theme.bg_dark }}>
      {sequences}
    </AbsoluteFill>
  );
};
