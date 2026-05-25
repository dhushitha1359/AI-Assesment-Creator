"use client";

import React from "react";
import { Sparkles, Zap, Shield, BarChart3 } from "lucide-react";
import AssignmentForm from "../components/AssignmentForm";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "0 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Nav ───────────────────────────────────────── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 0",
            borderBottom: "1px solid var(--border)",
            marginBottom: "52px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
              }}
            >
              <Sparkles size={18} color="white" />
            </div>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              Veda<span style={{ color: "#7C3AED" }}>AI</span>
            </span>
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              fontFamily: "'DM Mono', monospace",
              color: "var(--text-dim)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10B981",
                boxShadow: "0 0 6px #10B981",
              }}
            />
            AI Ready
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              background: "rgba(124, 58, 237, 0.12)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "100px",
              marginBottom: "24px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#A78BFA",
              letterSpacing: "0.05em",
            }}
          >
            <Sparkles size={12} />
            AI-Powered Assessment Creator
          </div>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            Create Intelligent
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Question Papers
            </span>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-muted)",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Describe your assignment. Our AI generates structured, curriculum-aligned
            question papers in seconds.
          </p>
        </div>

        {/* ── Feature Pills ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "44px",
          }}
        >
          {[
            { icon: <Zap size={13} />, text: "Real-time generation" },
            { icon: <BarChart3 size={13} />, text: "Difficulty-balanced" },
            { icon: <Shield size={13} />, text: "Section-structured" },
          ].map((feat, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
              }}
            >
              <span style={{ color: "#7C3AED" }}>{feat.icon}</span>
              {feat.text}
            </div>
          ))}
        </div>

        {/* ── Form ──────────────────────────────────────── */}
        <AssignmentForm />
      </div>
    </div>
  );
}
