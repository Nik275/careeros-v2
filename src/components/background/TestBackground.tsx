'use client';

export default function TestBackground() {
  return (
    <>
      {/* Red circle - top left */}
      <div
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          background: "red",
          borderRadius: "9999px",
          top: 0,
          left: 0,
          zIndex: 999,
        }}
      />

      {/* Blue circle - top right */}
      <div
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          background: "blue",
          borderRadius: "9999px",
          top: 0,
          right: 0,
          zIndex: 999,
        }}
      />

      {/* Gold circle - bottom center */}
      <div
        style={{
          position: "fixed",
          width: "700px",
          height: "300px",
          background: "gold",
          borderRadius: "9999px",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
        }}
      />
    </>
  );
}
