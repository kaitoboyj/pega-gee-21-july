import { useMemo } from "react";

const generateStars = (count: number, minSize: number, maxSize: number) => {
  return Array.from({ length: count }, () => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * (maxSize - minSize) + minSize;
    const opacity = Math.random() * 0.6 + 0.2;
    return `${x}vw ${y}vh 0 ${size}px rgba(255,255,255,${opacity})`;
  }).join(", ");
};

export const PegasusAnimation = () => {
  const starsFar = useMemo(() => generateStars(160, 0.5, 1.2), []);
  const starsMid = useMemo(() => generateStars(120, 0.8, 1.8), []);
  const starsNear = useMemo(() => generateStars(60, 1.2, 2.2), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-black">
      {/* Countless moving stars — GPU-only transform animation */}
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

      {/* Soft animated nebula */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

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
          animation: stars-drift-far 80s linear infinite;
        }
        .star-mid {
          animation: stars-drift-mid 50s linear infinite;
        }
        .star-near {
          animation: stars-drift-near 30s linear infinite;
        }

        .nebula {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.55;
          will-change: transform;
        }
        .nebula-1 {
          width: 55vmax; height: 55vmax;
          top: -15vmax; left: -10vmax;
          background: radial-gradient(circle, rgba(120,80,220,0.7), rgba(60,20,140,0) 70%);
          animation: neb-float-1 22s ease-in-out infinite alternate;
        }
        .nebula-2 {
          width: 60vmax; height: 60vmax;
          bottom: -20vmax; right: -15vmax;
          background: radial-gradient(circle, rgba(40,120,220,0.55), rgba(10,40,120,0) 70%);
          animation: neb-float-2 28s ease-in-out infinite alternate;
        }
        .nebula-3 {
          width: 45vmax; height: 45vmax;
          top: 30%; left: 40%;
          background: radial-gradient(circle, rgba(220,80,180,0.35), rgba(120,20,90,0) 70%);
          animation: neb-float-3 32s ease-in-out infinite alternate;
        }

        @keyframes stars-drift-far {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-10vw, -5vh, 0); }
        }
        @keyframes stars-drift-mid {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(15vw, -8vh, 0); }
        }
        @keyframes stars-drift-near {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-20vw, 12vh, 0); }
        }
        @keyframes neb-float-1 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(8vw, 6vh) scale(1.15); }
        }
        @keyframes neb-float-2 {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-10vw, -5vh) scale(1.1); }
        }
        @keyframes neb-float-3 {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-40%, -60%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};
