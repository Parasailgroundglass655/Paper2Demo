import React from "react";
import {
  AbsoluteFill, Img, staticFile, spring, interpolate,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import {
  Background, AccentBar, SectionTag, SceneHeading,
  useFade, useSlideUp, useScaleIn, TEXT_DIM, FONT,
} from "../shared";
import type { PaperData, Scene } from "../types";

type ResultsSceneData = Extract<Scene, { type: "results" }>;

interface Props {
  scene: ResultsSceneData;
  data: PaperData;
}

export const ResultsScene: React.FC<Props> = ({ scene, data }) => {
  const { meta, theme } = data;
  const totalFrames = scene.duration_seconds * 30;
  const opacity = useFade(totalFrames);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerAnim = useSlideUp(0, 200);

  const statColors = [theme.primary, theme.secondary, theme.accent, theme.primary];
  const hasFigure = !!scene.figure;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} />

      {/* Bottom glow */}
      <div style={{
        position: "absolute", bottom: -300, left: "50%",
        transform: "translateX(-50%)",
        width: 1200, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.primary}0e 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 100px",
      }}>
        <SectionTag theme={theme} label="RESULTS" anim={headerAnim} />
        <SceneHeading anim={headerAnim}>{scene.title}</SceneHeading>
        <AccentBar theme={theme} delay={5} />

        <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
          {/* Left: stats + closing card */}
          <div style={{ flex: hasFigure ? "0 0 52%" : 1 }}>
            {/* Stat cards */}
            <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
              {scene.stats.map((stat, i) => {
                const delay = 10 + i * 12;
                const { scale, opacity: op } = useScaleIn(delay, 180);
                const color = statColors[i % statColors.length];
                return (
                  <div key={i} style={{
                    flex: 1, opacity: op, transform: `scale(${scale})`,
                    background: `${color}12`,
                    border: `1px solid ${color}44`,
                    borderRadius: 18, padding: "28px 16px",
                    display: "flex", flexDirection: "column", alignItems: "center",
                  }}>
                    <div style={{
                      fontSize: 52, fontWeight: 900, color: color,
                      fontFamily: FONT, lineHeight: 1, marginBottom: 10,
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: 20, color: TEXT_DIM, fontFamily: FONT,
                      textAlign: "center", lineHeight: 1.3,
                    }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Closing title card */}
            {(() => {
              const delay = 70;
              const prog = spring({ frame: frame - delay, fps, config: { damping: 180 } });
              const y = interpolate(prog, [0, 1], [30, 0]);
              const op = interpolate(prog, [0, 1], [0, 1]);
              return (
                <div style={{
                  opacity: op, transform: `translateY(${y}px)`,
                  background: `${theme.bg_mid}cc`,
                  border: `1px solid ${theme.primary}33`,
                  borderRadius: 20, padding: "28px 48px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 40, fontWeight: 900, fontFamily: FONT,
                    background: `linear-gradient(135deg, #ffffff 0%, ${theme.primary} 60%, ${theme.secondary} 100%)`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: 6,
                  }}>
                    {meta.title.length > 60 ? meta.title.slice(0, 58) + "…" : meta.title}
                  </div>
                  <div style={{ fontSize: 22, color: TEXT_DIM, fontFamily: FONT }}>
                    {meta.venue} {meta.year}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right: extracted results figure */}
          {hasFigure && (() => {
            const delay = 20;
            const prog = spring({ frame: frame - delay, fps, config: { damping: 200 } });
            const op = interpolate(prog, [0, 1], [0, 1]);
            const scale = interpolate(prog, [0, 1], [0.9, 1]);
            return (
              <div style={{
                flex: "0 0 44%", opacity: op,
                transform: `scale(${scale})`,
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{
                  borderRadius: 16, overflow: "hidden",
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
                    lineHeight: 1.4, textAlign: "center", padding: "0 8px",
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
