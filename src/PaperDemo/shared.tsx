/**
 * Shared animation helpers and layout primitives used across scenes.
 */
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Theme } from "./types";

// ─── Animation hooks ──────────────────────────────────────────────────────────

export function useFade(
  totalFrames: number,
  fadeInFrames = 18,
  fadeOutFrames = 18,
): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

export function useSlideUp(
  delay = 0,
  damping = 200,
): { y: number; opacity: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping } });
  return {
    y: interpolate(progress, [0, 1], [40, 0]),
    opacity: interpolate(progress, [0, 1], [0, 1]),
  };
}

export function useScaleIn(
  delay = 0,
  damping = 180,
): { scale: number; opacity: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping } });
  return {
    scale: interpolate(progress, [0, 1], [0.7, 1]),
    opacity: interpolate(progress, [0, 1], [0, 1]),
  };
}

// ─── Layout components ────────────────────────────────────────────────────────

export const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, 300], [0, 30], {
    extrapolateRight: "extend",
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at ${40 + shift * 0.2}% ${30 + shift * 0.05}%, ${theme.bg_mid} 0%, ${theme.bg_dark} 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${theme.primary}22 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}22 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

export const AccentBar: React.FC<{ theme: Theme; delay?: number }> = ({
  theme,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const width = interpolate(progress, [0, 1], [0, 120]);
  return (
    <div
      style={{
        width,
        height: 4,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
        marginTop: 12,
        marginBottom: 28,
      }}
    />
  );
};

export const SectionTag: React.FC<{
  theme: Theme;
  label: string;
  anim: { y: number; opacity: number };
}> = ({ theme, label, anim }) => (
  <div
    style={{
      color: theme.tag_color,
      fontSize: 22,
      fontFamily: "monospace",
      letterSpacing: 3,
      marginBottom: 16,
      opacity: anim.opacity,
      transform: `translateY(${anim.y}px)`,
    }}
  >
    {label}
  </div>
);

export const SceneHeading: React.FC<{
  children: React.ReactNode;
  anim: { y: number; opacity: number };
}> = ({ children, anim }) => (
  <div
    style={{
      fontSize: 72,
      fontWeight: 800,
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#e8f0fe",
      marginBottom: 12,
      opacity: anim.opacity,
      transform: `translateY(${anim.y}px)`,
    }}
  >
    {children}
  </div>
);

// ─── Common constants ─────────────────────────────────────────────────────────

export const TEXT = "#e8f0fe";
export const TEXT_DIM = "#7a9cc6";
export const FONT = "system-ui, -apple-system, sans-serif";
