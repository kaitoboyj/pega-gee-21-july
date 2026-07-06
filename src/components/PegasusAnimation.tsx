export const PegasusAnimation = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-black">
      {/* Simple animated nebula using pure CSS gradients — GPU friendly, mobile fast */}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      <style>{`
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
