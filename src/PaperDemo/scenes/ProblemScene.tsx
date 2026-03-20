import React from "react";
import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Background, AccentBar, SectionTag, SceneHeading,
  useFade, useSlideUp, TEXT, TEXT_DIM, FONT,
} from "../shared";
import type { PaperData, Scene } from "../types";

type ProblemSceneData = Extract<Scene, { type: "problem" }>;

interface Props {
  scene: ProblemSceneData;
  data: PaperData;
}

export const ProblemScene: React.FC<Props> = ({ scene, data }) => {
  const { theme } = data;
  const totalFrames = scene.duration_seconds * 30;
  const opacity = useFade(totalFrames);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerAnim = useSlideUp(0, 200);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 120px",
      }}>
        <SectionTag theme={theme} label="MOTIVATION" anim={headerAnim} />
        <SceneHeading anim={headerAnim}>{scene.title}</SceneHeading>
        <AccentBar theme={theme} delay={5} />

        {scene.bullets.map((bullet, i) => {
          const delay = 15 + i * 18;
          const prog = spring({ frame: frame - delay, fps, config: { damping: 180 } });
          const y = interpolate(prog, [0, 1], [40, 0]);
          const op = interpolate(prog, [0, 1], [0, 1]);
          return (
            <div key={i} style={{
              opacity: op, transform: `translateY(${y}px)`,
              display: "flex", alignItems: "flex-start", gap: 28,
              marginBottom: 24,
              background: `${theme.bg_mid}cc`,
              border: `1px solid ${theme.primary}22`,
              borderLeft: `4px solid ${theme.primary}55`,
              borderRadius: 16, padding: "24px 36px",
            }}>
              <div style={{ fontSize: 42, lineHeight: 1, flexShrink: 0 }}>
                {bullet.icon}
              </div>
              <div>
                <div style={{
                  fontSize: 30, fontWeight: 700, color: TEXT,
                  fontFamily: FONT, marginBottom: 6,
                }}>
                  {bullet.title}
                </div>
                <div style={{
                  fontSize: 24, color: TEXT_DIM, fontFamily: FONT, lineHeight: 1.5,
                }}>
                  {bullet.desc}
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
