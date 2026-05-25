"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAssignmentStore } from "../../../store/assignmentStore";
import { useWebSocket } from "../../../lib/websocket";
import { getGeneratedPaper, regeneratePaper } from "../../../lib/api";
import QuestionPaper from "../../../components/QuestionPaper";
import GenerationProgress from "../../../components/GenerationProgress";
import { GeneratedPaper } from "../../../types";

export default function OutputPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { generation, setGeneration, setCurrentPaper } = useAssignmentStore();
  const { subscribe } = useWebSocket(assignmentId);

  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to WS updates for this assignment
  useEffect(() => {
    subscribe(assignmentId);
  }, [assignmentId, subscribe]);

  // Fetch paper when status changes to completed
  const fetchPaper = useCallback(async () => {
    try {
      const p = await getGeneratedPaper(assignmentId);
      setPaper(p);
      setCurrentPaper(p);
      setGeneration({ status: "completed", progress: 100, message: "Paper ready!" });
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } catch {
      // paper not ready yet, keep polling
    }
  }, [assignmentId, setCurrentPaper, setGeneration, pollingInterval]);

  // When WS says completed, fetch paper
  useEffect(() => {
    if (generation.status === "completed" && !paper) {
      fetchPaper();
    }
  }, [generation.status, paper, fetchPaper]);

  // Fallback polling (in case WS is not connected)
  useEffect(() => {
    if (
      (generation.status === "pending" || generation.status === "processing") &&
      !paper
    ) {
      const interval = setInterval(() => {
        fetchPaper();
      }, 4000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
  }, [generation.status]);

  // Initial state — if no status yet, assume processing
  useEffect(() => {
    if (generation.status === "idle") {
      setGeneration({
        status: "processing",
        message: "Initializing question generation...",
        progress: 5,
        assignmentId,
      });
    }
    // Try fetching immediately in case paper already exists
    fetchPaper();
  }, []);

  async function handleRegenerate() {
    setIsRegenerating(true);
    setPaper(null);
    setGeneration({ status: "processing", message: "Starting regeneration...", progress: 5 });
    try {
      await regeneratePaper(assignmentId);
      toast.success("Regeneration started!");
      subscribe(assignmentId);
    } catch {
      toast.error("Failed to regenerate. Please try again.");
      setGeneration({ status: "failed", message: "Regeneration failed" });
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      {/* Grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          padding: "0 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 0",
            borderBottom: "1px solid var(--border)",
            marginBottom: "40px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.875rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-muted)")
            }
          >
            <ArrowLeft size={16} />
            New Assignment
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={15} color="white" />
            </div>
            <span style={{ fontWeight: 800, color: "var(--text)" }}>
              Veda<span style={{ color: "#7C3AED" }}>AI</span>
            </span>
          </div>
        </nav>

        {/* Progress */}
        {!paper && (
          <GenerationProgress
            status={generation.status === "idle" ? "processing" : generation.status}
            message={generation.message || "Generating your question paper..."}
            progress={generation.progress}
          />
        )}

        {/* Paper */}
        {paper && (
          <QuestionPaper
            paper={paper}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </div>
  );
}
