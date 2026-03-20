import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Design tokens ──────────────────────────────────────────────────────────
const BG_DARK = "#080d1a";
const BG_MID = "#0e1b35";
const ACCENT = "#4f9cff";
const ACCENT2 = "#9b6dff";
const TEXT = "#e8f0fe";
const TEXT_DIM = "#7a9cc6";
const DIVIDER = "#1e3a5f";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useFade(
  totalFrames: number,
  fadeInFrames = 18,
  fadeOutFrames = 18
): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeInFrames, totalFrames - fadeOutFrames, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

function useSlideUp(delay = 0, damping = 200) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping } });
  const y = interpolate(progress, [0, 1], [40, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  return { y, opacity };
}

// ─── Background ──────────────────────────────────────────────────────────────

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();
  // Slow-moving gradient shift
  const shift = interpolate(frame, [0, 300], [0, 30], {
    extrapolateRight: "extend",
  });
  return (
    <AbsoluteFill>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at ${40 + shift * 0.2}% ${
            30 + shift * 0.05
          }%, #0d2045 0%, ${BG_DARK} 70%)`,
        }}
      />
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${DIVIDER}33 1px, transparent 1px), linear-gradient(90deg, ${DIVIDER}33 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Decorative accent line ───────────────────────────────────────────────────

const AccentBar: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
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
        background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
        marginTop: 12,
        marginBottom: 28,
      }}
    />
  );
};

// ─── Scene 1: Title ───────────────────────────────────────────────────────────

const SCENE1_FRAMES = 180;

const TitleScene: React.FC = () => {
  const opacity = useFade(SCENE1_FRAMES);

  const titleSpring = useSlideUp(0, 180);
  const subtitleSpring = useSlideUp(10, 200);
  const authorSpring = useSlideUp(20, 200);
  const badgeSpring = useSlideUp(30, 200);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background />
      {/* Glowing orb top-right */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -150,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Glowing orb bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -150,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT2}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 120px",
        }}
      >
        {/* Tag */}
        <div
          style={{
            opacity: badgeSpring.opacity,
            transform: `translateY(${badgeSpring.y}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: `${ACCENT}22`,
              border: `1px solid ${ACCENT}55`,
              borderRadius: 6,
              padding: "6px 18px",
              color: ACCENT,
              fontSize: 22,
              fontFamily: "monospace",
              letterSpacing: 2,
            }}
          >
            PAPER INTRODUCTION
          </div>
          <div
            style={{
              background: `${ACCENT2}22`,
              border: `1px solid ${ACCENT2}55`,
              borderRadius: 6,
              padding: "6px 18px",
              color: ACCENT2,
              fontSize: 22,
              fontFamily: "monospace",
              letterSpacing: 2,
            }}
          >
            MODEL COMPRESSION
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            opacity: titleSpring.opacity,
            transform: `translateY(${titleSpring.y}px)`,
          }}
        >
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              fontFamily: "system-ui, -apple-system, sans-serif",
              lineHeight: 1,
              background: `linear-gradient(135deg, #ffffff 0%, ${ACCENT} 60%, ${ACCENT2} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -2,
            }}
          >
            OBS-Diff
          </div>
        </div>

        <AccentBar delay={8} />

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleSpring.opacity,
            transform: `translateY(${subtitleSpring.y}px)`,
            fontSize: 44,
            fontWeight: 400,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: TEXT,
            lineHeight: 1.4,
            maxWidth: 900,
            marginBottom: 48,
          }}
        >
          Accurate Pruning for Diffusion Models
          <br />
          <span style={{ color: ACCENT }}>in One-Shot</span>
        </div>

        {/* Authors / venue */}
        <div
          style={{
            opacity: authorSpring.opacity,
            transform: `translateY(${authorSpring.y}px)`,
            fontSize: 26,
            color: TEXT_DIM,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Efficient Deep Learning · Diffusion Model Compression
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Problem ─────────────────────────────────────────────────────────

const SCENE2_FRAMES = 180;

const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(SCENE2_FRAMES);

  const headerSpring = useSlideUp(0, 200);

  const bullets = [
    {
      icon: "🧠",
      title: "Diffusion Models Are Powerful",
      desc: "State-of-the-art image & video generation — but with billions of parameters",
    },
    {
      icon: "⚡",
      title: "Massive Compute Cost",
      desc: "Slow inference, high memory — challenging for real-world deployment",
    },
    {
      icon: "🔁",
      title: "Existing Pruning Requires Retraining",
      desc: "Iterative fine-tuning after pruning is expensive and time-consuming",
    },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        {/* Section tag */}
        <div
          style={{
            color: ACCENT,
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: 3,
            marginBottom: 16,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          MOTIVATION
        </div>

        {/* Header */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: TEXT,
            marginBottom: 12,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          The Challenge
        </div>

        <AccentBar delay={5} />

        {/* Bullet cards */}
        {bullets.map((b, i) => {
          const delay = 15 + i * 18;
          const prog = spring({
            frame: frame - delay,
            fps,
            config: { damping: 180 },
          });
          const y = interpolate(prog, [0, 1], [40, 0]);
          const op = interpolate(prog, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                display: "flex",
                alignItems: "flex-start",
                gap: 28,
                marginBottom: 28,
                background: `${BG_MID}cc`,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 16,
                padding: "26px 36px",
              }}
            >
              <div style={{ fontSize: 42, lineHeight: 1 }}>{b.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: TEXT,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    marginBottom: 6,
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    color: TEXT_DIM,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {b.desc}
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Method ──────────────────────────────────────────────────────────

const SCENE3_FRAMES = 210;

const MethodScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(SCENE3_FRAMES);

  const headerSpring = useSlideUp(0, 200);

  // OBS pipeline steps
  const steps = [
    { label: "Pre-trained\nDiffusion Model", color: "#4f9cff" },
    { label: "Compute\nHessian Info", color: "#9b6dff" },
    { label: "Weight\nSaliency Scores", color: "#ff6db0" },
    { label: "One-Shot\nPruning", color: "#ff9d4f" },
    { label: "Compressed\nModel ✓", color: "#4fcf8e" },
  ];

  const keyPoints = [
    { icon: "🎯", text: "Uses second-order Taylor expansion (OBS) for accurate weight importance" },
    { icon: "⚡", text: "No retraining — weights are analytically updated after removal" },
    { icon: "🔬", text: "Adapted specifically for the U-Net architecture of diffusion models" },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background />
      {/* Glowing orb center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT2}0a 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 100px",
        }}
      >
        {/* Section tag */}
        <div
          style={{
            color: ACCENT2,
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: 3,
            marginBottom: 16,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          METHODOLOGY
        </div>

        {/* Header */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: TEXT,
            marginBottom: 12,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          How OBS-Diff Works
        </div>

        <AccentBar delay={5} />

        {/* Pipeline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginBottom: 44,
          }}
        >
          {steps.map((s, i) => {
            const delay = 10 + i * 12;
            const prog = spring({
              frame: frame - delay,
              fps,
              config: { damping: 200 },
            });
            const scale = interpolate(prog, [0, 1], [0.6, 1]);
            const op = interpolate(prog, [0, 1], [0, 1]);
            return (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}
              >
                <div
                  style={{
                    opacity: op,
                    transform: `scale(${scale})`,
                    flex: 1,
                    background: `${s.color}18`,
                    border: `2px solid ${s.color}55`,
                    borderRadius: 14,
                    padding: "18px 10px",
                    textAlign: "center",
                    color: s.color,
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    lineHeight: 1.3,
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      opacity: interpolate(
                        spring({ frame: frame - delay - 6, fps, config: { damping: 200 } }),
                        [0, 1],
                        [0, 1]
                      ),
                      color: TEXT_DIM,
                      fontSize: 32,
                      padding: "0 6px",
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key insight cards */}
        {keyPoints.map((kp, i) => {
          const delay = 70 + i * 15;
          const prog = spring({
            frame: frame - delay,
            fps,
            config: { damping: 180 },
          });
          const y = interpolate(prog, [0, 1], [30, 0]);
          const op = interpolate(prog, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginBottom: 16,
                background: `${BG_MID}bb`,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 12,
                padding: "18px 28px",
              }}
            >
              <div style={{ fontSize: 32 }}>{kp.icon}</div>
              <div
                style={{
                  fontSize: 26,
                  color: TEXT,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {kp.text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Contributions ───────────────────────────────────────────────────

const SCENE4_FRAMES = 210;

const ContributionsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(SCENE4_FRAMES);

  const headerSpring = useSlideUp(0, 200);

  const contributions = [
    {
      num: "01",
      color: ACCENT,
      title: "One-Shot Pruning",
      desc: "Identifies and removes the least salient weights in a single pass — no expensive iterative retraining needed.",
    },
    {
      num: "02",
      color: ACCENT2,
      title: "OBS-Based Accuracy",
      desc: "Leverages Optimal Brain Surgeon theory: analytically compensates remaining weights to minimise reconstruction error.",
    },
    {
      num: "03",
      color: "#4fcf8e",
      title: "Diffusion-Aware Design",
      desc: "Tailored saliency scoring for U-Net blocks in diffusion models, preserving generative quality at high sparsity ratios.",
    },
    {
      num: "04",
      color: "#ff9d4f",
      title: "State-of-the-Art Results",
      desc: "Outperforms prior structured and unstructured pruning baselines on standard image generation benchmarks.",
    },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 120px",
        }}
      >
        {/* Section tag */}
        <div
          style={{
            color: "#4fcf8e",
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: 3,
            marginBottom: 16,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          KEY CONTRIBUTIONS
        </div>

        {/* Header */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: TEXT,
            marginBottom: 12,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          What OBS-Diff Offers
        </div>

        <AccentBar delay={5} />

        {/* Two-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {contributions.map((c, i) => {
            const delay = 12 + i * 16;
            const prog = spring({
              frame: frame - delay,
              fps,
              config: { damping: 180 },
            });
            const y = interpolate(prog, [0, 1], [40, 0]);
            const op = interpolate(prog, [0, 1], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  background: `${BG_MID}cc`,
                  border: `1px solid ${c.color}33`,
                  borderLeft: `4px solid ${c.color}`,
                  borderRadius: 14,
                  padding: "28px 32px",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: "monospace",
                    color: c.color,
                    marginBottom: 8,
                    letterSpacing: 2,
                  }}
                >
                  {c.num}
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: TEXT,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    marginBottom: 10,
                  }}
                >
                  {c.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: TEXT_DIM,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {c.desc}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Results & Outro ─────────────────────────────────────────────────

const SCENE5_FRAMES = 180;

const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(SCENE5_FRAMES);

  const headerSpring = useSlideUp(0, 200);

  const stats = [
    { value: "1×", label: "Forward Pass to Prune", color: ACCENT },
    { value: "↑ FID", label: "Better Image Quality", color: ACCENT2 },
    { value: "50%+", label: "Parameter Reduction", color: "#4fcf8e" },
    { value: "SOTA", label: "On Standard Benchmarks", color: "#ff9d4f" },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <Background />
      {/* Final glow */}
      <div
        style={{
          position: "absolute",
          bottom: -300,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1200,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}12 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 120px",
          textAlign: "center",
        }}
      >
        {/* Section tag */}
        <div
          style={{
            color: "#ff9d4f",
            fontSize: 22,
            fontFamily: "monospace",
            letterSpacing: 3,
            marginBottom: 16,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          RESULTS
        </div>

        {/* Header */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: TEXT,
            marginBottom: 12,
            opacity: headerSpring.opacity,
            transform: `translateY(${headerSpring.y}px)`,
          }}
        >
          Strong Empirical Performance
        </div>

        <AccentBar delay={5} />

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 56,
            width: "100%",
          }}
        >
          {stats.map((s, i) => {
            const delay = 12 + i * 14;
            const prog = spring({
              frame: frame - delay,
              fps,
              config: { damping: 180 },
            });
            const scale = interpolate(prog, [0, 1], [0.7, 1]);
            const op = interpolate(prog, [0, 1], [0, 1]);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  opacity: op,
                  transform: `scale(${scale})`,
                  background: `${s.color}12`,
                  border: `1px solid ${s.color}44`,
                  borderRadius: 18,
                  padding: "32px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 60,
                    fontWeight: 900,
                    color: s.color,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: TEXT_DIM,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing title card */}
        {(() => {
          const delay = 80;
          const prog = spring({
            frame: frame - delay,
            fps,
            config: { damping: 180 },
          });
          const y = interpolate(prog, [0, 1], [30, 0]);
          const op = interpolate(prog, [0, 1], [0, 1]);
          return (
            <div
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                background: `${BG_MID}cc`,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 20,
                padding: "32px 60px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  background: `linear-gradient(135deg, #ffffff 0%, ${ACCENT} 60%, ${ACCENT2} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                }}
              >
                OBS-Diff
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: TEXT_DIM,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                Accurate Pruning for Diffusion Models in One-Shot
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Total duration ───────────────────────────────────────────────────────────

export const TOTAL_FRAMES =
  SCENE1_FRAMES + SCENE2_FRAMES + SCENE3_FRAMES + SCENE4_FRAMES + SCENE5_FRAMES;

// ─── Main composition ─────────────────────────────────────────────────────────

export const OBSDiff: React.FC = () => {
  const s1End = SCENE1_FRAMES;
  const s2End = s1End + SCENE2_FRAMES;
  const s3End = s2End + SCENE3_FRAMES;
  const s4End = s3End + SCENE4_FRAMES;

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      <Sequence from={0} durationInFrames={SCENE1_FRAMES} premountFor={30}>
        <TitleScene />
      </Sequence>
      <Sequence from={s1End} durationInFrames={SCENE2_FRAMES} premountFor={30}>
        <ProblemScene />
      </Sequence>
      <Sequence from={s2End} durationInFrames={SCENE3_FRAMES} premountFor={30}>
        <MethodScene />
      </Sequence>
      <Sequence from={s3End} durationInFrames={SCENE4_FRAMES} premountFor={30}>
        <ContributionsScene />
      </Sequence>
      <Sequence from={s4End} durationInFrames={SCENE5_FRAMES} premountFor={30}>
        <ResultsScene />
      </Sequence>
    </AbsoluteFill>
  );
};
