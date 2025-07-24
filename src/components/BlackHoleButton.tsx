"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const BlackHoleScene = dynamic(() => import("@/components/BlackHoleScene"), {
  ssr: false,
});

export default function BlackHoleButton() {
  const [active, setActive] = useState(false);

  const handleActivate = () => setActive(true);
  const handleDeactivate = () => setActive(false);

  const buttonStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    padding: "16px 40px",
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "white",
    background: active
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "9999px",
    boxShadow: active
      ? "0 0 30px rgba(255, 255, 255, 0.25)"
      : "0 0 12px rgba(255, 255, 255, 0.15)",
    transition: "all 0.35s ease",
    transform: active ? "scale(1.05)" : "scale(1)",
    textDecoration: "none",
    userSelect: "none",
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "300px",
        cursor: "pointer",
        overflow: "hidden",
        touchAction: "manipulation",
      }}
      onMouseEnter={handleActivate}
      onMouseLeave={handleDeactivate}
      onTouchStart={handleActivate}
      onTouchEnd={handleDeactivate}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <BlackHoleScene active={active} />
      </div>

      <a
        href="https://jvoltci.github.io/ivehement/"
        target="_blank"
        rel="noopener noreferrer"
        style={buttonStyle}
      >
        ✨ Into the Unknown
      </a>
    </div>
  );
}
