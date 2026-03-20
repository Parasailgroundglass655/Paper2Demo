import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, AccentBar, useFade, useSlideUp, TEXT_DIM, FONT } from "../shared";
import type { PaperData, Scene } from "../types";

type TitleSceneData = Extract<Scene, { type: "title" }>;

interface Props {
  scene: TitleSceneData;
  data: PaperData;
}

export const TitleScene: React.FC<Props> = ({ scene, data }) => {
  const { meta, theme } = data;
  const totalFrames = scene.duration_seconds * 30;
  const opacity = useFade(totalFrames);

  const tagAnim = useSlideUp(0, 180);
  const titleAnim = useSlideUp(6, 180);
  const subtitleAnim = useSlideUp(14, 200);
  const authorAnim = useSlideUp(22, 200);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background theme={theme} />

      {/* Top-right glow orb */}
      <div style={{
        position: "absolute", top: -200, right: -150,
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.primary}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      {/* Bottom-left glow orb */}
      <div style={{
        position: "absolute", bottom: -200, left: -150,
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${theme.secondary}14 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <AbsoluteFill style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
        padding: "0 120px",
      }}>
        {/* Domain tags */}
        <div style={{
          opacity: tagAnim.opacity,
          transform: `translateY(${tagAnim.y}px)`,
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 32, flexWrap: "wrap",
        }}>
          <div style={{
            background: `${theme.primary}22`,
            border: `1px solid ${theme.primary}55`,
            borderRadius: 6, padding: "6px 18px",
            color: theme.primary, fontSize: 22,
            fontFamily: "monospace", letterSpacing: 2,
          }}>
            PAPER INTRODUCTION
          </div>
          {meta.domain_tags.slice(0, 2).map((tag, i) => (
            <div key={i} style={{
              background: `${theme.secondary}22`,
              border: `1px solid ${theme.secondary}55`,
              borderRadius: 6, padding: "6px 18px",
              color: theme.secondary, fontSize: 22,
              fontFamily: "monospace", letterSpacing: 2,
              textTransform: "uppercase",
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Main title */}
        <div style={{
          opacity: titleAnim.opacity,
          transform: `translateY(${titleAnim.y}px)`,
          fontSize: meta.title.length > 60 ? 72 : 96,
          fontWeight: 900, fontFamily: FONT,
          lineHeight: 1.1,
          background: `linear-gradient(135deg, #ffffff 0%, ${theme.primary} 60%, ${theme.secondary} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1,
          maxWidth: 1400,
          marginBottom: 8,
        }}>
          {meta.title}
        </div>

        <AccentBar theme={theme} delay={10} />

        {/* Venue & year */}
        <div style={{
          opacity: subtitleAnim.opacity,
          transform: `translateY(${subtitleAnim.y}px)`,
          display: "flex", alignItems: "center", gap: 16,
          marginBottom: 36,
        }}>
          <div style={{
            background: `${theme.accent}22`,
            border: `1px solid ${theme.accent}55`,
            borderRadius: 6, padding: "5px 16px",
            color: theme.accent, fontSize: 24, fontFamily: "monospace",
          }}>
            {meta.venue}
          </div>
          <div style={{
            color: TEXT_DIM, fontSize: 24, fontFamily: FONT,
          }}>
            {meta.year}
          </div>
        </div>

        {/* Authors */}
        <div style={{
          opacity: authorAnim.opacity,
          transform: `translateY(${authorAnim.y}px)`,
          fontSize: 26, color: TEXT_DIM, fontFamily: FONT,
          lineHeight: 1.5,
        }}>
          {meta.authors.join("  ·  ")}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
