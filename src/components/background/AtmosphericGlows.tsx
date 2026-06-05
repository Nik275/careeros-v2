'use client';

import { memo } from 'react';

export const AtmosphericGlows = memo(function AtmosphericGlows() {
  return (
    <div
      className="atmospheric-glows"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      {/* Deep breathing green glow - top left - SUBSTANTIAL MOVEMENT */}
      <div
        style={{
          position: 'absolute',
          top: '-35%',
          left: '-30%',
          width: '85vw',
          height: '85vw',
          background: 'radial-gradient(circle, rgba(166,194,158,0.32) 0%, rgba(166,194,158,0.16) 38%, rgba(166,194,158,0.06) 68%, transparent 92%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(50px)',
          animationName: 'greenAlive',
          animationDuration: '16s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Breathing blue glow - top right - SUBSTANTIAL MOVEMENT */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-25%',
          width: '75vw',
          height: '75vw',
          background: 'radial-gradient(circle, rgba(186,208,220,0.26) 0%, rgba(186,208,220,0.13) 42%, rgba(186,208,220,0.05) 72%, transparent 94%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(55px)',
          animationName: 'blueAlive',
          animationDuration: '19s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Warm gold breathing glow - bottom - SUBSTANTIAL MOVEMENT */}
      <div
        style={{
          position: 'absolute',
          bottom: '-45%',
          left: '50%',
          width: '100%',
          height: '55%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(234,198,142,0.30) 0%, rgba(234,198,142,0.14) 45%, rgba(234,198,142,0.05) 78%, transparent 95%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(60px)',
          animationName: 'goldAlive',
          animationDuration: '13s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Soft ivory center glow - BREATHING */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          width: '70%',
          aspectRatio: '1',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(252,248,240,0.22) 0%, rgba(252,248,240,0.09) 48%, transparent 82%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(70px)',
          animationName: 'ivoryAlive',
          animationDuration: '14s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Cinematic light beam 1 - very soft */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '40vw',
          height: '120vh',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
          transform: 'rotate(-15deg)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(60px)',
          animationName: 'lightBeam1',
          animationDuration: '25s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Cinematic light beam 2 - very soft */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '15%',
          width: '35vw',
          height: '110vh',
          background: 'linear-gradient(180deg, rgba(194,214,186,0.05) 0%, rgba(194,214,186,0.02) 50%, transparent 100%)',
          transform: 'rotate(12deg)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(55px)',
          animationName: 'lightBeam2',
          animationDuration: '30s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Cinematic light beam 3 - warm */}
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '30%',
          width: '50vw',
          height: '80vh',
          background: 'linear-gradient(0deg, rgba(246,205,122,0.06) 0%, rgba(246,205,122,0.02) 50%, transparent 100%)',
          transform: 'rotate(-8deg)',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(50px)',
          animationName: 'lightBeam3',
          animationDuration: '22s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Drifting fog layer 1 */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '-35%',
          width: '120%',
          height: '70%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 65%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(90px)',
          animationName: 'fogAlive1',
          animationDuration: '42s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Drifting fog layer 2 */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          right: '-30%',
          width: '100%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(194,214,186,0.12) 0%, transparent 65%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(80px)',
          animationName: 'fogAlive2',
          animationDuration: '38s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      {/* Drifting fog layer 3 */}
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          left: '-10%',
          width: '110%',
          height: '55%',
          background: 'radial-gradient(ellipse, rgba(246,205,122,0.10) 0%, transparent 65%)',
          borderRadius: '9999px',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(85px)',
          animationName: 'fogAlive3',
          animationDuration: '48s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }}
      />

      <style jsx global>{`
        @keyframes greenAlive {
          0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
          50% { transform: scale(1.08) translate(30px, 20px); opacity: 0.95; }
          100% { transform: scale(1.12) translate(60px, 40px); opacity: 1; }
        }

        @keyframes blueAlive {
          0% { transform: scale(1) translate(0, 0); opacity: 0.75; }
          50% { transform: scale(1.06) translate(-20px, 25px); opacity: 0.9; }
          100% { transform: scale(1.1) translate(-50px, 50px); opacity: 1; }
        }

        @keyframes goldAlive {
          0% { transform: scale(1) translateY(0); opacity: 0.78; }
          50% { transform: scale(1.1) translateY(-30px); opacity: 0.92; }
          100% { transform: scale(1.15) translateY(-60px); opacity: 1; }
        }

        @keyframes ivoryAlive {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 0.85; }
          100% { transform: scale(1.1); opacity: 0.95; }
        }

        @keyframes lightBeam1 {
          0% { transform: rotate(-15deg) translateX(0); opacity: 0.5; }
          100% { transform: rotate(-12deg) translateX(80px); opacity: 0.8; }
        }

        @keyframes lightBeam2 {
          0% { transform: rotate(12deg) translateX(0); opacity: 0.4; }
          100% { transform: rotate(15deg) translateX(-60px); opacity: 0.7; }
        }

        @keyframes lightBeam3 {
          0% { transform: rotate(-8deg) translateY(0); opacity: 0.5; }
          100% { transform: rotate(-5deg) translateY(-40px); opacity: 0.75; }
        }

        @keyframes fogAlive1 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          100% { transform: translateX(150px) translateY(50px) scale(1.08); }
        }

        @keyframes fogAlive2 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          100% { transform: translateX(-120px) translateY(-40px) scale(1.1); }
        }

        @keyframes fogAlive3 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          100% { transform: translateX(100px) translateY(-30px) scale(1.06); }
        }
      `}</style>
    </div>
  );
});

export default AtmosphericGlows;
