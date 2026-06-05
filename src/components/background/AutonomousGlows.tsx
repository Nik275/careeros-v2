'use client';

import { memo } from 'react';

export const AutonomousGlows = memo(function AutonomousGlows() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      {/* Green glow - continuous autonomous drift */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-25%',
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, rgba(166,194,158,0.30) 0%, rgba(166,194,158,0.15) 40%, rgba(166,194,158,0.06) 70%, transparent 92%)',
          borderRadius: '9999px',
          filter: 'blur(45px)',
          willChange: 'transform, opacity',
          animation: 'greenFloat 16s ease-in-out infinite alternate',
        }}
      />

      {/* Blue glow - continuous autonomous drift */}
      <div
        style={{
          position: 'absolute',
          top: '-25%',
          right: '-20%',
          width: '70vw',
          height: '70vw',
          background: 'radial-gradient(circle, rgba(186,208,220,0.24) 0%, rgba(186,208,220,0.12) 45%, rgba(186,208,220,0.05) 75%, transparent 94%)',
          borderRadius: '9999px',
          filter: 'blur(50px)',
          willChange: 'transform, opacity',
          animation: 'blueFloat 19s ease-in-out infinite alternate',
        }}
      />

      {/* Gold glow - continuous autonomous drift */}
      <div
        style={{
          position: 'absolute',
          bottom: '-40%',
          left: '50%',
          width: '95vw',
          height: '50vw',
          marginLeft: '-47.5vw',
          background: 'radial-gradient(ellipse, rgba(234,198,142,0.28) 0%, rgba(234,198,142,0.13) 45%, rgba(234,198,142,0.05) 78%, transparent 95%)',
          borderRadius: '9999px',
          filter: 'blur(55px)',
          willChange: 'transform, opacity',
          animation: 'goldFloat 13s ease-in-out infinite alternate',
        }}
      />

      {/* Ivory center glow - breathing */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '65vw',
          height: '65vw',
          marginLeft: '-32.5vw',
          marginTop: '-32.5vh',
          background: 'radial-gradient(circle, rgba(252,248,240,0.20) 0%, rgba(252,248,240,0.08) 50%, transparent 85%)',
          borderRadius: '9999px',
          filter: 'blur(65px)',
          willChange: 'transform, opacity',
          animation: 'ivoryBreathe 12s ease-in-out infinite alternate',
        }}
      />

      {/* Fog layer 1 - drifting */}
      <div
        style={{
          position: 'absolute',
          top: '0%',
          left: '-30%',
          width: '130vw',
          height: '80vh',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 70%)',
          borderRadius: '9999px',
          filter: 'blur(90px)',
          willChange: 'transform',
          animation: 'fogDrift1 45s ease-in-out infinite alternate',
        }}
      />

      {/* Fog layer 2 - drifting */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '-25%',
          width: '110vw',
          height: '70vh',
          background: 'radial-gradient(ellipse, rgba(194,214,186,0.12) 0%, transparent 70%)',
          borderRadius: '9999px',
          filter: 'blur(80px)',
          willChange: 'transform',
          animation: 'fogDrift2 38s ease-in-out infinite alternate',
        }}
      />

      {/* Fog layer 3 - drifting */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-15%',
          width: '120vw',
          height: '65vh',
          background: 'radial-gradient(ellipse, rgba(246,205,122,0.10) 0%, transparent 70%)',
          borderRadius: '9999px',
          filter: 'blur(85px)',
          willChange: 'transform',
          animation: 'fogDrift3 52s ease-in-out infinite alternate',
        }}
      />

      {/* Cinematic light beam 1 */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '15%',
          width: '45vw',
          height: '140vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          transform: 'rotate(-18deg)',
          filter: 'blur(50px)',
          willChange: 'transform, opacity',
          animation: 'beam1 28s ease-in-out infinite alternate',
        }}
      />

      {/* Cinematic light beam 2 */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: '40vw',
          height: '130vh',
          background: 'linear-gradient(180deg, rgba(194,214,186,0.06) 0%, rgba(194,214,186,0.02) 50%, transparent 100%)',
          transform: 'rotate(15deg)',
          filter: 'blur(45px)',
          willChange: 'transform, opacity',
          animation: 'beam2 32s ease-in-out infinite alternate',
        }}
      />

      {/* Cinematic light beam 3 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-40%',
          left: '25%',
          width: '55vw',
          height: '100vh',
          background: 'linear-gradient(0deg, rgba(246,205,122,0.07) 0%, rgba(246,205,122,0.02) 50%, transparent 100%)',
          transform: 'rotate(-10deg)',
          filter: 'blur(48px)',
          willChange: 'transform, opacity',
          animation: 'beam3 25s ease-in-out infinite alternate',
        }}
      />

      <style jsx global>{`
        @keyframes greenFloat {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.85; }
          50% { transform: translate3d(35px, 25px, 0) scale(1.08); opacity: 0.95; }
          100% { transform: translate3d(70px, 50px, 0) scale(1.15); opacity: 1; }
        }

        @keyframes blueFloat {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate3d(-25px, 30px, 0) scale(1.06); opacity: 0.92; }
          100% { transform: translate3d(-55px, 55px, 0) scale(1.12); opacity: 1; }
        }

        @keyframes goldFloat {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.82; }
          50% { transform: translate3d(10px, -30px, 0) scale(1.1); opacity: 0.95; }
          100% { transform: translate3d(0, -65px, 0) scale(1.18); opacity: 1; }
        }

        @keyframes ivoryBreathe {
          0% { transform: scale(1); opacity: 0.75; }
          100% { transform: scale(1.12); opacity: 0.95; }
        }

        @keyframes fogDrift1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(180px, 60px, 0) scale(1.1); }
        }

        @keyframes fogDrift2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-150px, -50px, 0) scale(1.12); }
        }

        @keyframes fogDrift3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(120px, -40px, 0) scale(1.08); }
        }

        @keyframes beam1 {
          0% { transform: rotate(-18deg) translate3d(0, 0, 0); opacity: 0.5; }
          100% { transform: rotate(-14deg) translate3d(100px, 30px, 0); opacity: 0.85; }
        }

        @keyframes beam2 {
          0% { transform: rotate(15deg) translate3d(0, 0, 0); opacity: 0.45; }
          100% { transform: rotate(19deg) translate3d(-80px, 40px, 0); opacity: 0.8; }
        }

        @keyframes beam3 {
          0% { transform: rotate(-10deg) translate3d(0, 0, 0); opacity: 0.55; }
          100% { transform: rotate(-6deg) translate3d(60px, -50px, 0); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
});

export default AutonomousGlows;
