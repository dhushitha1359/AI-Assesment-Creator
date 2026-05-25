"use client";

import React from "react";
import { Sparkles, CheckCircle, XCircle, Loader } from "lucide-react";

interface GenerationProgressProps {
  status: "pending" | "processing" | "completed" | "failed" | "idle";
  message: string;
  progress: number;
}

export default function GenerationProgress({
  status,
  message,
  progress,
}: GenerationProgressProps) {
  if (status === "idle") return null;

  const isComplete = status === "completed";
  const isFailed = status === "failed";
  const isActive = status === "pending" || status === "processing";

  return (
    <div className="card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {isActive && (
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-300 animate-pulse" />
            </div>
          </div>
        )}
        {isComplete && (
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
        )}
        {isFailed && (
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle size={20} className="text-red-400" />
          </div>
        )}
        <div>
          <h3 className="font-600 text-[var(--text)]">
            {isActive && "Generating Your Question Paper"}
            {isComplete && "Paper Ready!"}
            {isFailed && "Generation Failed"}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{message}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[var(--text-dim)]">
            <span>Processing with AI</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps indicator */}
      {isActive && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Queue", done: progress >= 10 },
            { label: "AI Generation", done: progress >= 50 },
            { label: "Saving", done: progress >= 80 },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  step.done ? "bg-purple-400" : "bg-[var(--border-light)]"
                } ${step.done && progress < 100 ? "animate-pulse" : ""}`}
              />
              <span
                className={`text-xs ${
                  step.done
                    ? "text-purple-300"
                    : "text-[var(--text-dim)]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-emerald-500/30 rounded-full">
            <div className="h-full w-full bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs text-emerald-400 font-600">100%</span>
        </div>
      )}
    </div>
  );
}
