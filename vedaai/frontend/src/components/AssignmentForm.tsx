"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Upload,
  X,
  FileText,
  Sparkles,
  ChevronRight,
  BookOpen,
  Calendar,
  Hash,
  Star,
  AlertCircle,
} from "lucide-react";
import { useAssignmentStore } from "../store/assignmentStore";
import { createAssignment } from "../lib/api";
import { QUESTION_TYPES } from "../types";

export default function AssignmentForm() {
  const router = useRouter();
  const {
    formData,
    formErrors,
    isSubmitting,
    setFormField,
    toggleQuestionType,
    setFormError,
    clearFormErrors,
    setIsSubmitting,
    setGeneration,
  } = useAssignmentStore();

  const [dragOver, setDragOver] = useState(false);

  // ─── Validation ───────────────────────────────────────────────
  function validate(): boolean {
    clearFormErrors();
    let valid = true;

    if (!formData.title.trim()) {
      setFormError("title", "Assignment title is required");
      valid = false;
    }
    if (!formData.subject.trim()) {
      setFormError("subject", "Subject is required");
      valid = false;
    }
    if (!formData.dueDate) {
      setFormError("dueDate", "Due date is required");
      valid = false;
    }
    if (formData.questionTypes.length === 0) {
      setFormError("questionTypes", "Select at least one question type");
      valid = false;
    }
    const nq = Number(formData.numberOfQuestions);
    if (!nq || nq < 1 || nq > 100) {
      setFormError(
        "numberOfQuestions",
        "Enter a number between 1 and 100"
      );
      valid = false;
    }
    const tm = Number(formData.totalMarks);
    if (!tm || tm < 1 || tm > 1000) {
      setFormError("totalMarks", "Enter a number between 1 and 1000");
      valid = false;
    }

    return valid;
  }

  // ─── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    setGeneration({ status: "pending", message: "Creating assignment...", progress: 5 });

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("subject", formData.subject);
      fd.append("dueDate", formData.dueDate);
      fd.append(
        "questionTypes",
        JSON.stringify(formData.questionTypes)
      );
      fd.append("numberOfQuestions", String(formData.numberOfQuestions));
      fd.append("totalMarks", String(formData.totalMarks));
      if (formData.additionalInstructions) {
        fd.append(
          "additionalInstructions",
          formData.additionalInstructions
        );
      }
      if (formData.file) {
        fd.append("file", formData.file);
      }

      const { assignmentId } = await createAssignment(fd);

      toast.success("Assignment created! Generating questions...");
      router.push(`/output/${assignmentId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create assignment. Please try again.");
      setGeneration({ status: "failed", message: "Submission failed" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── File drag/drop ───────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.type === "application/pdf" || file.type === "text/plain")
      ) {
        setFormField("file", file);
      } else {
        toast.error("Only PDF or TXT files allowed");
      }
    },
    [setFormField]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormField("file", file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Assignment Details ────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <h2 className="text-sm font-700 tracking-widest uppercase text-[var(--text-muted)]">
            Assignment Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div>
            <label className="label">Assignment Title *</label>
            <input
              className={`input-field ${formErrors.title ? "error" : ""}`}
              placeholder="e.g. Unit 3 – Thermodynamics Quiz"
              value={formData.title}
              onChange={(e) => setFormField("title", e.target.value)}
            />
            {formErrors.title && (
              <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.title}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="label">Subject *</label>
            <input
              className={`input-field ${formErrors.subject ? "error" : ""}`}
              placeholder="e.g. Physics, Computer Science"
              value={formData.subject}
              onChange={(e) => setFormField("subject", e.target.value)}
            />
            {formErrors.subject && (
              <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.subject}
              </p>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="max-w-sm">
          <label className="label flex items-center gap-2">
            <Calendar size={12} /> Due Date *
          </label>
          <input
            type="date"
            className={`input-field ${formErrors.dueDate ? "error" : ""}`}
            value={formData.dueDate}
            onChange={(e) => setFormField("dueDate", e.target.value)}
            style={{ colorScheme: "dark" }}
          />
          {formErrors.dueDate && (
            <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {formErrors.dueDate}
            </p>
          )}
        </div>
      </div>

      {/* ── Question Configuration ────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Hash size={16} className="text-indigo-400" />
          </div>
          <h2 className="text-sm font-700 tracking-widest uppercase text-[var(--text-muted)]">
            Question Configuration
          </h2>
        </div>

        {/* Question Types */}
        <div>
          <label className="label">Question Types *</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {QUESTION_TYPES.map((type) => {
              const selected = formData.questionTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleQuestionType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-500 border transition-all duration-150 ${
                    selected
                      ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                      : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-light)] hover:text-[var(--text)]"
                  }`}
                >
                  {selected && <span className="mr-1">✓</span>}
                  {type}
                </button>
              );
            })}
          </div>
          {formErrors.questionTypes && (
            <p className="text-[var(--danger)] text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} /> {formErrors.questionTypes}
            </p>
          )}
        </div>

        {/* Num Questions + Total Marks */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="label flex items-center gap-2">
              <Hash size={12} /> Number of Questions *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className={`input-field ${
                formErrors.numberOfQuestions ? "error" : ""
              }`}
              placeholder="e.g. 20"
              value={formData.numberOfQuestions}
              onChange={(e) =>
                setFormField("numberOfQuestions", e.target.value)
              }
            />
            {formErrors.numberOfQuestions && (
              <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.numberOfQuestions}
              </p>
            )}
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Star size={12} /> Total Marks *
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              className={`input-field ${
                formErrors.totalMarks ? "error" : ""
              }`}
              placeholder="e.g. 100"
              value={formData.totalMarks}
              onChange={(e) => setFormField("totalMarks", e.target.value)}
            />
            {formErrors.totalMarks && (
              <p className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.totalMarks}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Additional Inputs ─────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <FileText size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-sm font-700 tracking-widest uppercase text-[var(--text-muted)]">
            Additional Context
          </h2>
        </div>

        {/* File Upload */}
        <div>
          <label className="label">Upload Reference File (Optional)</label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-purple-500 bg-purple-500/10"
                : "border-[var(--border)] hover:border-[var(--border-light)] bg-[var(--bg-input)]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
            {formData.file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-purple-400" />
                <span className="text-sm text-[var(--text)]">
                  {formData.file.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormField("file", null);
                  }}
                  className="p-1 rounded-full hover:bg-red-500/20 transition-colors"
                >
                  <X size={14} className="text-red-400" />
                </button>
              </div>
            ) : (
              <div>
                <Upload
                  size={24}
                  className="mx-auto mb-3 text-[var(--text-dim)]"
                />
                <p className="text-sm text-[var(--text-muted)]">
                  Drop a PDF or TXT file here, or{" "}
                  <span className="text-purple-400">click to browse</span>
                </p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Max 5MB · PDF, TXT
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="label">Additional Instructions</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="e.g. Focus on chapters 4–6. Include diagrams-based questions. Avoid calculus."
            value={formData.additionalInstructions}
            onChange={(e) =>
              setFormField("additionalInstructions", e.target.value)
            }
          />
        </div>
      </div>

      {/* ── Submit ────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center text-base py-4"
      >
        {isSubmitting ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
            Creating Assignment...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Question Paper with AI
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
