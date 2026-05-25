"use client";

import React, { useRef } from "react";
import { GeneratedPaper, Question } from "../types";
import {
  Download,
  RefreshCw,
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Printer,
} from "lucide-react";

interface QuestionPaperProps {
  paper: GeneratedPaper;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const difficultyConfig = {
  Easy: { cls: "badge-easy", label: "Easy" },
  Moderate: { cls: "badge-moderate", label: "Moderate" },
  Hard: { cls: "badge-hard", label: "Hard" },
};

function DifficultyBadge({ difficulty }: { difficulty: Question["difficulty"] }) {
  const config = difficultyConfig[difficulty] || difficultyConfig.Moderate;
  return (
    <span className={`badge ${config.cls}`}>{config.label}</span>
  );
}

export default function QuestionPaper({
  paper,
  onRegenerate,
  isRegenerating,
}: QuestionPaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  async function handleDownloadPDF() {
    try {
      // Dynamic import jsPDF
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      let y = 15;

      // Header
      doc.setFillColor(30, 20, 60);
      doc.rect(0, 0, pageW, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(paper.title, pageW / 2, 16, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Subject: ${paper.subject}`, pageW / 2, 24, { align: "center" });

      doc.setFontSize(9);
      const headerInfo = [
        `Total Marks: ${paper.totalMarks}`,
        paper.duration ? `Duration: ${paper.duration}` : "",
      ]
        .filter(Boolean)
        .join("   |   ");
      doc.text(headerInfo, pageW / 2, 31, { align: "center" });

      y = 52;

      // Student info boxes
      doc.setTextColor(30, 20, 60);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const fields = [
        { label: "Name:", width: 65 },
        { label: "Roll No:", width: 45 },
        { label: "Section:", width: 35 },
      ];
      let xPos = 15;
      fields.forEach(({ label, width }) => {
        doc.text(label, xPos, y);
        doc.setDrawColor(180, 160, 220);
        doc.line(xPos + 12, y, xPos + width, y);
        xPos += width + 5;
      });
      y += 12;

      // Sections
      paper.sections.forEach((section) => {
        if (y > 260) { doc.addPage(); y = 15; }

        // Section header
        doc.setFillColor(245, 240, 255);
        doc.rect(12, y - 5, pageW - 24, 10, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(80, 50, 160);
        doc.text(section.title, 15, y + 1);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 100, 180);
        doc.text(`[${section.totalMarks} Marks]`, pageW - 15, y + 1, { align: "right" });
        y += 8;

        doc.setFontSize(8);
        doc.setTextColor(100, 80, 150);
        doc.text(section.instruction, 15, y);
        y += 8;

        // Questions
        section.questions.forEach((q, qi) => {
          if (y > 270) { doc.addPage(); y = 15; }

          const num = `${qi + 1}.`;
          const textLines = doc.splitTextToSize(q.text, pageW - 55);
          const blockH = Math.max(12, textLines.length * 5 + 2);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 20, 60);
          doc.text(num, 15, y + 4);

          doc.setFont("helvetica", "normal");
          doc.text(textLines, 22, y + 4);

          // Difficulty + marks
          const diffColor =
            q.difficulty === "Easy"
              ? [16, 185, 129]
              : q.difficulty === "Hard"
              ? [239, 68, 68]
              : [245, 158, 11];
          doc.setTextColor(diffColor[0], diffColor[1], diffColor[2]);
          doc.setFontSize(7);
          doc.text(`[${q.difficulty}]`, pageW - 40, y + 4);
          doc.setTextColor(80, 60, 140);
          doc.text(`${q.marks}M`, pageW - 18, y + 4, { align: "right" });

          y += blockH;
        });

        y += 6;
      });

      doc.save(`${paper.title.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    }
  }

  const totalQuestions = paper.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  return (
    <div className="animate-fade-in">
      {/* ── Action Bar ───────────────────────────────── */}
      <div className="no-print card p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-600 text-[var(--text)]">
              Question Paper Generated
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {totalQuestions} questions · {paper.sections.length} sections ·{" "}
              {paper.totalMarks} marks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="btn-secondary text-sm py-2 px-4"
            >
              <RefreshCw
                size={14}
                className={isRegenerating ? "animate-spin-custom" : ""}
              />
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="btn-secondary text-sm py-2 px-4"
          >
            <Printer size={14} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn-primary text-sm py-2 px-4"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Paper ────────────────────────────────────── */}
      <div
        ref={paperRef}
        className="card print-paper overflow-hidden"
        style={{ maxWidth: "860px", margin: "0 auto" }}
      >
        {/* Paper Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1A0E3A 0%, #0F0A1E 100%)",
            borderBottom: "2px solid #7C3AED",
            padding: "32px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(124, 58, 237, 0.1)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20px",
              left: "-20px",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.15)",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              padding: "4px 16px",
              background: "rgba(124, 58, 237, 0.2)",
              borderRadius: "20px",
              border: "1px solid rgba(124, 58, 237, 0.4)",
            }}
          >
            <Award size={14} style={{ color: "#A78BFA" }} />
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#A78BFA",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              AI Generated Assessment
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "#EDE9FF",
              marginBottom: "6px",
              letterSpacing: "-0.02em",
            }}
          >
            {paper.title}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#9D8EC4",
              marginBottom: "20px",
            }}
          >
            {paper.subject}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: <Award size={14} />, label: "Total Marks", value: String(paper.totalMarks) },
              ...(paper.duration
                ? [{ icon: <Clock size={14} />, label: "Duration", value: paper.duration }]
                : []),
              {
                icon: <BookOpen size={14} />,
                label: "Questions",
                value: String(totalQuestions),
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  padding: "8px 20px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#7C3AED",
                    justifyContent: "center",
                    marginBottom: "4px",
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#8B7DB8" }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#EDE9FF" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Info */}
        <div
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid #2A1D55",
            background: "#110D24",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {["Name", "Roll Number", "Section"].map((field) => (
              <div key={field}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#5A4F82",
                    marginBottom: "8px",
                  }}
                >
                  {field}
                </label>
                <div
                  style={{
                    borderBottom: "1px solid #3D2B7A",
                    height: "30px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "4px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ padding: "0 32px 32px" }}>
          {paper.sections.map((section, si) => (
            <div key={section.id} style={{ marginTop: "32px" }}>
              {/* Section Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,232,0.08) 100%)",
                  borderRadius: "12px",
                  border: "1px solid rgba(124,58,237,0.25)",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(124,58,237,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#A78BFA",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {String.fromCharCode(65 + si)}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#EDE9FF",
                      }}
                    >
                      {section.title}
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "#8B7DB8", marginTop: "2px" }}>
                      {section.instruction}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 14px",
                    background: "rgba(124,58,237,0.2)",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#A78BFA",
                    fontFamily: "'DM Mono', monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {section.totalMarks} Marks
                </div>
              </div>

              {/* Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.questions.map((q, qi) => (
                  <div
                    key={q.id}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "14px 16px",
                      background: "#110D24",
                      borderRadius: "10px",
                      border: "1px solid #2A1D55",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#3D2B7A")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#2A1D55")
                    }
                  >
                    {/* Number */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "#7C3AED",
                        fontFamily: "'DM Mono', monospace",
                        marginTop: "2px",
                      }}
                    >
                      {qi + 1}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#E2D9F3",
                          lineHeight: "1.6",
                          marginBottom: "8px",
                        }}
                      >
                        {q.text}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#5A4F82",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {q.type}
                        </span>
                      </div>
                    </div>

                    {/* Marks */}
                    <div
                      style={{
                        flexShrink: 0,
                        textAlign: "right",
                        alignSelf: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          color: "#EDE9FF",
                          fontFamily: "'DM Mono', monospace",
                          lineHeight: 1,
                        }}
                      >
                        {q.marks}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "#5A4F82",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {q.marks === 1 ? "mark" : "marks"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px",
            borderTop: "1px solid #2A1D55",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.75rem",
            color: "#5A4F82",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <span>Generated by VedaAI</span>
          <span>Total: {paper.totalMarks} Marks</span>
        </div>
      </div>
    </div>
  );
}
