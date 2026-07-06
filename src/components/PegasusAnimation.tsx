import { useMemo } from "react";
const nebulaBg = { url: "/nebula-bg.png" };

const generateStars = (count: number, minSize: number, maxSize: number) => {
  return Array.from({ length: count }, () => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * (maxSize - minSize) + minSize;
    const opacity = Math.random() * 0.5 + 0.2;
    return `${x}vw ${y}vh 0 ${size}px rgba(255,255,255,${opacity})`;
  }).join(", ");
};

export const PegasusAnimation = () => {
  const starsFar = useMemo(() => generateStars(220, 0.25, 0.7), []);
  const starsMid = useMemo(() => generateStars(160, 0.4, 1.0), []);
  const starsNear = useMemo(() => generateStars(90, 0.6, 1.3), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-black">
      {/* Uploaded nebula image as background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${nebulaBg.url})` }}
        aria-hidden="true"
      />

      {/* Tiny floating stars drift over the image */}
      <div
        className="star-layer star-far"
        style={{ boxShadow: starsFar }}
        aria-hidden="true"
      />
      <div
        className="star-layer star-mid"
        style={{ boxShadow: starsMid }}
        aria-hidden="true"
      />
      <div
        className="star-layer star-near"
        style={{ boxShadow: starsNear }}
        aria-hidden="true"
      />

      {/* Subtle overlay to keep foreground content readable */}
      <div className="absolute inset-0 bg-black/30" />

      <style>{`
        .star-layer {
          position: absolute;
          inset: 0;
          width: 1px;
          height: 1px;
          border-radius: 9999px;
          will-change: transform;
          background: transparent;
        }
        .star-far {
          animation: stars-drift-far 100s linear infinite;
        }
        .star-mid {
          animation: stars-drift-mid 60s linear infinite;
        }
        .star-near {
          animation: stars-drift-near 35s linear infinite;
        }

        @keyframes stars-drift-far {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-12vw, -6vh, 0); }
        }
        @keyframes stars-drift-mid {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(18vw, -10vh, 0); }
        }
        @keyframes stars-drift-near {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-24vw, 14vh, 0); }
        }
      `}</style>
    </div>
  );
};
