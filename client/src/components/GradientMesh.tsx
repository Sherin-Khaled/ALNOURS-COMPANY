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
            transform: translate3d(-6%, -4%, 0) scale(1.08);
          }
          50% {
            transform: translate3d(6%, 4%, 0) scale(1.14);
          }
          100% {
            transform: translate3d(-6%, -4%, 0) scale(1.08);
          }
        }

        @keyframes fluidPanB {
          0% {
            transform: translate3d(5%, 6%, 0) scale(1.1);
          }
          50% {
            transform: translate3d(-7%, -5%, 0) scale(1.16);
          }
          100% {
            transform: translate3d(5%, 6%, 0) scale(1.1);
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
            transform: translate3d(0%, 0%, 0) scale(1.05);
          }
          50% {
            transform: translate3d(-2%, 1%, 0) scale(1.1);
          }
          100% {
            transform: translate3d(0%, 0%, 0) scale(1.05);
          }
        }

        .fluid-root {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: #ffffff;
        }

        .fluid-filter-wrap {
          position: absolute;
          inset: -8%;
          filter: url(#fluid-distort);
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
            radial-gradient(60% 42% at 18% 32%, rgba(15, 61, 145, 0.22) 0%, rgba(15, 61, 145, 0.12) 28%, rgba(15, 61, 145, 0.00) 72%),
            radial-gradient(52% 36% at 58% 30%, rgba(15, 61, 145, 0.16) 0%, rgba(15, 61, 145, 0.08) 30%, rgba(15, 61, 145, 0.00) 74%),
            radial-gradient(46% 32% at 80% 58%, rgba(47, 169, 198, 0.08) 0%, rgba(47, 169, 198, 0.04) 30%, rgba(47, 169, 198, 0.00) 75%);
          filter: blur(36px);
          animation: fluidPanA 18s ease-in-out infinite, fluidRotate 24s ease-in-out infinite;
        }

        .fluid-layer-b {
          background:
            radial-gradient(58% 40% at 72% 34%, rgba(15, 61, 145, 0.18) 0%, rgba(15, 61, 145, 0.09) 28%, rgba(15, 61, 145, 0.00) 72%),
            radial-gradient(50% 34% at 42% 68%, rgba(15, 61, 145, 0.14) 0%, rgba(15, 61, 145, 0.07) 30%, rgba(15, 61, 145, 0.00) 74%),
            radial-gradient(36% 28% at 24% 62%, rgba(47, 169, 198, 0.06) 0%, rgba(47, 169, 198, 0.03) 30%, rgba(47, 169, 198, 0.00) 74%);
          filter: blur(42px);
          animation: fluidPanB 22s ease-in-out infinite;
        }

        .fluid-noise-soften {
          position: absolute;
          inset: -6%;
          background:
            radial-gradient(65% 45% at 50% 48%, rgba(15, 61, 145, 0.08) 0%, rgba(15, 61, 145, 0.03) 36%, rgba(15, 61, 145, 0.00) 72%);
          filter: blur(60px);
          animation: noiseShift 20s ease-in-out infinite;
        }

        .fluid-white-softener {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,0.55) 0%,
              rgba(255,255,255,0.18) 22%,
              rgba(255,255,255,0.10) 50%,
              rgba(255,255,255,0.18) 78%,
              rgba(255,255,255,0.55) 100%
            );
        }

        .fluid-edge-fade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,1) 0%,
              rgba(255,255,255,0.26) 12%,
              rgba(255,255,255,0.00) 28%,
              rgba(255,255,255,0.00) 72%,
              rgba(255,255,255,0.26) 88%,
              rgba(255,255,255,1) 100%
            );
        }

        @media (max-width: 768px) {
          .fluid-layer-a,
          .fluid-layer-b {
            filter: blur(28px);
          }

          .fluid-noise-soften {
            filter: blur(44px);
          }
        }
      `}</style>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="fluid-distort">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.02"
            numOctaves="2"
            seed="8"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="18s"
              values="0.008 0.020;0.012 0.024;0.008 0.020"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="24"
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
        <div className="fluid-white-softener" />
        <div className="fluid-edge-fade" />
      </div>
    </div>
  );
}