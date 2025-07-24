"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const BlackHoleScene = dynamic(() => import("@/components/BlackHoleScene"), { ssr: false });

export default function BlackHoleButton() {
  const [active, setActive] = useState(false);

  const buttonStyle = {
    position: "relative",
    zIndex: 1,
    padding: "14px 36px",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "white",
    background: "linear-gradient(to right, #ec4899, #8b5cf6, #06b6d4)",
    borderRadius: "9999px",
    boxShadow: active
      ? "0 8px 30px rgba(236, 72, 153, 0.8)"
      : "0 6px 24px rgba(236, 72, 153, 0.6)",
    textDecoration: "none",
    transition: "all 0.4s ease",
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
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
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