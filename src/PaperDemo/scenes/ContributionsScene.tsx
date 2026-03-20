import React from "react";
import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Background, AccentBar, SectionTag, SceneHeading,
  useFade, useSlideUp, TEXT, TEXT_DIM, FONT,
} from "../shared";
import type { PaperData, Scene } from "../types";

type ContributionsSceneData = Extract<Scene, { type: "contributions" }>;

interface Props {
  scene: ContributionsSceneData;
  data: PaperData;
}

// Cycle through theme colors for card accents
const CARD_COLORS = (theme: { primary: string; secondary: string; accent: string }) => [
  theme.primary,
  theme.secondary,
  theme.accent,
  theme.primary,
];

export const ContributionsScene: React.FC<Props> = ({ scene, data }) => {
  const { theme } = data;
  const totalFrames = scene.duration_seconds * 30;
  const opacity = useFade(totalFrames);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerAnim = useSlideUp(0, 200);
  const colors = CARD_COLORS(theme);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 120px",
      }}>
        <SectionTag theme={theme} label="KEY CONTRIBUTIONS" anim={headerAnim} />
        <SceneHeading anim={headerAnim}>{scene.title}</SceneHeading>
        <AccentBar theme={theme} delay={5} />

        <div style={{
          display: "grid",
          gridTemplateColumns: scene.items.length <= 2 ? "1fr" : "1fr 1fr",
          gap: 24,
        }}>
          {scene.items.map((item, i) => {
            const color = colors[i % colors.length];
            const delay = 12 + i * 16;
            const prog = spring({ frame: frame - delay, fps, config: { damping: 180 } });
            const y = interpolate(prog, [0, 1], [40, 0]);
            const op = interpolate(prog, [0, 1], [0, 1]);
            return (
              <div key={i} style={{
                opacity: op, transform: `translateY(${y}px)`,
                background: `${theme.bg_mid}cc`,
                border: `1px solid ${color}33`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 14, padding: "26px 32px",
              }}>
                <div style={{
                  fontSize: 18, fontFamily: "monospace",
                  color: color, marginBottom: 8, letterSpacing: 2,
                }}>
                  {item.num}
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: TEXT,
                  fontFamily: FONT, marginBottom: 10,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 22, color: TEXT_DIM, fontFamily: FONT, lineHeight: 1.5,
                }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
