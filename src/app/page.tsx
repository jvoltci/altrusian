"use client";

import dynamic from "next/dynamic";
import "@/app/globals.css";
import BlackHoleButton from "@/components/BlackHoleButton";
import Image from "next/image";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />,
});

export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <ThreeScene />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(to bottom right, black, transparent, black)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Top Right Altrusian Branding */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 24,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(6px)",
          padding: "8px 16px",
          borderRadius: 9999,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Image
          src="/images/altrusian.png"
          alt="Logo"
          width={24}
          height={24}
          style={{ borderRadius: "50%" }}
        />

        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "white",
          }}
        >
          Altrusian
        </span>
      </div>

      {/* Hero Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            fontWeight: "bold",
            lineHeight: 1.2,
            background: "linear-gradient(to right, #67e8f9, #c084fc, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 24,
          }}
        >
          The Mind Behind the Machine
        </h1>
        <p
          style={{
            maxWidth: "600px",
            color: "#d1d5db",
            fontSize: "1.125rem",
            marginBottom: 32,
          }}
        >
          We are more than engineers of intelligence — we are seekers of its
          soul. At the crossroads of mathematics, intuition, and abstraction, we
          explore the silent code that may one day awaken true artificial
          thought.
        </p>
        <BlackHoleButton />
      </div>

      {/* Bottom Right Contact Email */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          fontSize: "0.75rem",
          color: "rgba(255, 255, 255, 0.4)",
          zIndex: 20,
          fontFamily: "monospace",
          letterSpacing: "-0.02em",
        }}
      >
        <a
          href="mailto:hello@atrusian.xyz"
          style={{ textDecoration: "none", color: "inherit" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseOut={(e) =>
            (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")
          }
        >
          hello@atrusian.xyz
        </a>
      </div>
    </main>
  );
}
