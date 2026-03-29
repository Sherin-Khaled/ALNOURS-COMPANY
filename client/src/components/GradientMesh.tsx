interface GradientMeshProps {
  enabled?: boolean;
  className?: string;
}

export function GradientMesh({
  enabled = true,
  className = "",
}: GradientMeshProps) {
  if (!enabled) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes fluidPanA {
          0% {
            transform: translate3d(-8%, -6%, 0) scale(1.08);
          }
          50% {
            transform: translate3d(8%, 6%, 0) scale(1.16);
          }
          100% {
            transform: translate3d(-8%, -6%, 0) scale(1.08);
          }
        }

        @keyframes fluidPanB {
          0% {
            transform: translate3d(7%, 8%, 0) scale(1.1);
          }
          50% {
            transform: translate3d(-9%, -7%, 0) scale(1.18);
          }
          100% {
            transform: translate3d(7%, 8%, 0) scale(1.1);
          }
        }

        @keyframes fluidRotate {
          0% {
            rotate: 0deg;
          }
          50% {
            rotate: 4deg;
          }
          100% {
            rotate: 0deg;
          }
        }

        @keyframes noiseShift {
          0% {
            transform: translate3d(0%, 0%, 0) scale(1.03);
          }
          50% {
            transform: translate3d(-2%, 2%, 0) scale(1.08);
          }
          100% {
            transform: translate3d(0%, 0%, 0) scale(1.03);
          }
        }

        @keyframes verticalGradientFlow {
          0% {
            background-position: 50% 20%;
          }
          50% {
            background-position: 50% 80%;
          }
          100% {
            background-position: 50% 20%;
          }
        }

        .fluid-root {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: transparent;
        }

        .fluid-filter-wrap {
          position: absolute;
          inset: -10%;
          opacity: 1;
        }

        .fluid-layer {
          position: absolute;
          inset: 0;
          mix-blend-mode: normal;
          will-change: transform;
        }

        .fluid-layer-a {
          background:
            radial-gradient(60% 42% at 18% 32%, rgba(18, 72, 172, 0.22) 0%, rgba(18, 72, 172, 0.12) 28%, rgba(18, 72, 172, 0.00) 72%),
            radial-gradient(52% 36% at 58% 30%, rgba(18, 72, 172, 0.18) 0%, rgba(18, 72, 172, 0.09) 30%, rgba(18, 72, 172, 0.00) 74%),
            radial-gradient(46% 32% at 80% 58%, rgba(18, 72, 172, 0.12) 0%, rgba(18, 72, 172, 0.05) 30%, rgba(18, 72, 172, 0.00) 75%);
          filter: blur(34px);
          animation: fluidPanA 12s ease-in-out infinite, fluidRotate 18s ease-in-out infinite;
        }

        .fluid-layer-b {
          background:
            radial-gradient(58% 40% at 72% 34%, rgba(18, 72, 172, 0.20) 0%, rgba(18, 72, 172, 0.10) 28%, rgba(18, 72, 172, 0.00) 72%),
            radial-gradient(50% 34% at 42% 68%, rgba(18, 72, 172, 0.16) 0%, rgba(18, 72, 172, 0.08) 30%, rgba(18, 72, 172, 0.00) 74%),
            radial-gradient(36% 28% at 24% 62%, rgba(18, 72, 172, 0.10) 0%, rgba(18, 72, 172, 0.04) 30%, rgba(18, 72, 172, 0.00) 74%);
          filter: blur(40px);
          animation: fluidPanB 14s ease-in-out infinite;
        }

        .fluid-noise-soften {
          position: absolute;
          inset: -6%;
          background:
            radial-gradient(65% 45% at 50% 48%, rgba(18, 72, 172, 0.10) 0%, rgba(18, 72, 172, 0.04) 36%, rgba(18, 72, 172, 0.00) 72%);
          filter: blur(68px);
          animation: noiseShift 12s ease-in-out infinite;
        }

        .fluid-vertical-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(18, 72, 172, 1) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 100% 180%;
          background-position: 50% 50%;
          opacity: 0.16;
          animation: verticalGradientFlow 3.2s ease-in-out infinite;
          will-change: background-position;
        }

        .fluid-edge-fade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,0.72) 7%,
              rgba(255,255,255,0.18) 16%,
              rgba(255,255,255,0.00) 28%,
              rgba(255,255,255,0.00) 72%,
              rgba(255,255,255,0.18) 84%,
              rgba(255,255,255,0.72) 93%,
              rgba(255,255,255,1) 100%
            );
        }

        @media (max-width: 768px) {
          .fluid-layer-a,
          .fluid-layer-b {
            filter: blur(28px);
          }

          .fluid-noise-soften {
            filter: blur(54px);
          }

          .fluid-vertical-gradient {
            opacity: 0.26;
          }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="fluid-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.012"
            numOctaves="1"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="fluid-root">
        <div className="fluid-filter-wrap">
          <div className="fluid-layer fluid-layer-a" />
          <div className="fluid-layer fluid-layer-b" />
          <div className="fluid-noise-soften" />
        </div>
        <div className="fluid-vertical-gradient" />
        <div className="fluid-edge-fade" />
      </div>
    </div>
  );
}