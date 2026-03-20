import React from "react";
import {
  AbsoluteFill, Img, staticFile, spring, interpolate,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import {
  Background, AccentBar, SectionTag, SceneHeading,
  useFade, useSlideUp, TEXT, TEXT_DIM, FONT,
} from "../shared";
import type { PaperData, Scene } from "../types";

type MethodSceneData = Extract<Scene, { type: "method" }>;

interface Props {
  scene: MethodSceneData;
  data: PaperData;
}

export const MethodScene: React.FC<Props> = ({ scene, data }) => {
  const { theme } = data;
  const totalFrames = scene.duration_seconds * 30;
  const opacity = useFade(totalFrames);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerAnim = useSlideUp(0, 200);

  const hasFigure = !!scene.figure;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center",
        padding: hasFigure ? "0 60px 0 100px" : "0 100px",
      }}>
        <SectionTag theme={theme} label="METHODOLOGY" anim={headerAnim} />
        <SceneHeading anim={headerAnim}>{scene.title}</SceneHeading>
        <AccentBar theme={theme} delay={5} />

        <div style={{
          display: "flex", gap: 48, alignItems: "flex-start",
        }}>
          {/* Left: pipeline + key points */}
          <div style={{ flex: hasFigure ? "0 0 55%" : 1 }}>
            {/* Pipeline steps */}
            <div style={{
              display: "flex", alignItems: "center", gap: 0,
              marginBottom: 36, flexWrap: "nowrap", overflow: "hidden",
            }}>
              {scene.pipeline_steps.map((step, i) => {
                const delay = 10 + i * 10;
                const prog = spring({ frame: frame - delay, fps, config: { damping: 200 } });
                const scale = interpolate(prog, [0, 1], [0.6, 1]);
                const op = interpolate(prog, [0, 1], [0, 1]);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <div style={{
                      opacity: op, transform: `scale(${scale})`,
                      flex: 1, minWidth: 0,
                      background: `${theme.primary}18`,
                      border: `2px solid ${theme.primary}55`,
                      borderRadius: 12, padding: "14px 8px",
                      textAlign: "center", color: theme.primary,
                      fontSize: 20, fontWeight: 700, fontFamily: FONT,
                      lineHeight: 1.3, wordBreak: "break-word",
                    }}>
                      {step}
                    </div>
                    {i < scene.pipeline_steps.length - 1 && (
                      <div style={{
                        opacity: interpolate(
                          spring({ frame: frame - delay - 5, fps, config: { damping: 200 } }),
                          [0, 1], [0, 1],
                        ),
                        color: TEXT_DIM, fontSize: 28, padding: "0 4px", flexShrink: 0,
                      }}>→</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Key points */}
            {scene.key_points.map((kp, i) => {
              const delay = 60 + i * 15;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 180 } });
              const y = interpolate(prog, [0, 1], [30, 0]);
              const op = interpolate(prog, [0, 1], [0, 1]);
              return (
                <div key={i} style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  display: "flex", alignItems: "center", gap: 20,
                  marginBottom: 14,
                  background: `${theme.bg_mid}bb`,
                  border: `1px solid ${theme.primary}22`,
                  borderRadius: 12, padding: "16px 24px",
                }}>
                  <div style={{ fontSize: 30, flexShrink: 0 }}>{kp.icon}</div>
                  <div style={{ fontSize: 24, color: TEXT, fontFamily: FONT, lineHeight: 1.4 }}>
                    {kp.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: extracted figure */}
          {hasFigure && (() => {
            const delay = 30;
            const prog = spring({ frame: frame - delay, fps, config: { damping: 200 } });
            const op = interpolate(prog, [0, 1], [0, 1]);
            const scale = interpolate(prog, [0, 1], [0.9, 1]);
            return (
              <div style={{
                flex: "0 0 40%", opacity: op,
                transform: `scale(${scale})`,
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${theme.primary}33`,
                  background: "#ffffff08",
                }}>
                  <Img
                    src={staticFile(scene.figure!)}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
                {scene.figure_caption && (
                  <div style={{
                    fontSize: 18, color: TEXT_DIM, fontFamily: FONT,
                    lineHeight: 1.4, textAlign: "center",
                    padding: "0 8px",
                  }}>
                    {scene.figure_caption}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
