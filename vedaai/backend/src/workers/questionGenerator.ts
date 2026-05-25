import "dotenv/config";
import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { QUEUE_NAME, GenerationJobData } from "../queues/assignmentQueue";
import { Assignment, GeneratedPaper } from "../models";
import { generateQuestionPaper } from "../services/aiService";
import { redisClient, setJobState } from "../services/redisService";
import { broadcastToAssignment } from "../services/wsService";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Worker: MongoDB connected");
}

// ---------------- NORMALIZE AI DATA TO MATCH SCHEMA ----------------
function normalizeAIData(raw: any, jobInput: any) {
  const difficultyMap: Record<string, string> = {
    easy: "Easy",
    medium: "Moderate",   // AI says "Medium" → schema wants "Moderate"
    moderate: "Moderate",
    hard: "Hard",
    difficult: "Hard",
  };

  const sections = (raw.sections || []).map((section: any, sIdx: number) => {
    const questions = (section.questions || []).map(
      (q: any, qIdx: number) => {
        // Normalize difficulty
        const rawDiff = (q.difficulty || "moderate").toLowerCase();
        const difficulty = difficultyMap[rawDiff] || "Moderate";

        return {
          id: `s${sIdx + 1}q${qIdx + 1}`,           // generate id
          text: q.text || "Question text missing",
          difficulty,
          marks: Number(q.marks) || 1,
          type: jobInput.safeQuestionTypes || "MCQ", // AI never returns this
        };
      }
    );

    const totalMarks = questions.reduce(
      (sum: number, q: any) => sum + q.marks,
      0
    );

    return {
      id: `section-${sIdx + 1}`,                          // generate id
      title: section.title || `Section ${sIdx + 1}`,
      instruction: section.instructions                    // AI returns "instructions" (plural)
        || section.instruction
        || "Answer all questions",
      questions,
      totalMarks,
    };
  });

  return {
    title: raw.title || jobInput.title || "Assignment",
    subject: raw.subject || jobInput.subject || "General",
    totalMarks: sections.reduce(
      (sum: number, s: any) => sum + s.totalMarks,
      0
    ),
    sections,
  };
}

// ---------------- SAFE JSON PARSE ----------------
function safeParseAI(result: any) {
  try {
    let raw = typeof result === "string" ? result : JSON.stringify(result);

    // Strip markdown fences ```json ... ```
    raw = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(raw);

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error("Missing 'sections' array in AI response");
    }

    console.log("✅ AI JSON parsed successfully");
    return parsed;
  } catch (err) {
    console.warn("⚠️ JSON parse failed →", (err as Error).message);

    // Fallback structure
    return {
      sections: [
        {
          title: "Section A",
          instructions: "Answer all questions",
          questions: [
            { text: "Explain the main concept.", difficulty: "Easy", marks: 5 },
            { text: "Describe with examples.", difficulty: "Easy", marks: 5 },
          ],
        },
      ],
    };
  }
}

// ---------------- PROCESS JOB ----------------
async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId, ...input } = job.data;

  console.log(`⚙️ Processing job ${job.id} for ${assignmentId}`);
  console.log("📦 Job input data:", JSON.stringify(input, null, 2));

  try {
    await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });
    await setJobState(job.id!, { status: "processing", progress: 0 });

    broadcastToAssignment(assignmentId, {
      type: "status_update",
      assignmentId,
      status: "processing",
      message: "Starting AI generation...",
      progress: 10,
    });

    await job.updateProgress(10);

    // ---------------- SAFE INPUTS ----------------
    const title =
      typeof input.title === "string" && input.title.trim()
        ? input.title.trim()
        : "Assignment";

    const subject =
      typeof input.subject === "string" && input.subject.trim()
        ? input.subject.trim()
        : "General";

    const numberOfQuestions = Number(input.numberOfQuestions) || 5;
    const totalMarks = Number(input.totalMarks) || 10;

    const additionalInstructions =
      typeof input.additionalInstructions === "string" &&
      input.additionalInstructions.trim()
        ? input.additionalInstructions.trim()
        : "None";

    let safeQuestionTypes = "MCQ";

    if (Array.isArray(input.questionTypes) && input.questionTypes.length > 0) {
      safeQuestionTypes = input.questionTypes[0]; // use first type for question.type field
    } else if (
      typeof input.questionTypes === "string" &&
      input.questionTypes.trim()
    ) {
      safeQuestionTypes = input.questionTypes.trim();
    }

    console.log("🔧 Sanitized inputs:", {
      title, subject, numberOfQuestions,
      totalMarks, safeQuestionTypes, additionalInstructions,
    });

    // ---------------- PROMPT ----------------
    const prompt = `You are an exam paper generator. Generate a structured exam question paper.

Return ONLY a valid JSON object. No markdown. No explanation. No code blocks. Raw JSON only.

Requirements:
- Title: ${title}
- Subject: ${subject}
- Question Types: ${safeQuestionTypes}
- Number of Questions: ${numberOfQuestions}
- Total Marks: ${totalMarks}
- Additional Instructions: ${additionalInstructions}

The JSON must follow this exact structure:
{
  "sections": [
    {
      "title": "Section A",
      "instructions": "Answer all questions",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 5
        }
      ]
    }
  ]
}

Rules:
- difficulty must be ONLY "Easy", "Moderate", or "Hard" — never "Medium"
- Distribute ${numberOfQuestions} questions across sections
- Total marks across all questions must equal ${totalMarks}
- Return ONLY the JSON object, nothing else`;

    // ---------------- AI GENERATION ----------------
    broadcastToAssignment(assignmentId, {
      type: "status_update",
      assignmentId,
      status: "processing",
      message: "Generating question paper with AI...",
      progress: 50,
    });

    await job.updateProgress(50);

    const aiResult = await generateQuestionPaper(prompt);
    console.log("🤖 Raw AI result:", aiResult);

    const rawParsed = safeParseAI(aiResult);

    // Transform AI output → match Mongoose schema exactly
    const paperData = normalizeAIData(rawParsed, {
      title,
      subject,
      safeQuestionTypes,
    });

    console.log(
      "📄 Normalized paper data:",
      JSON.stringify(paperData, null, 2)
    );

    // ---------------- SAVE ----------------
    broadcastToAssignment(assignmentId, {
      type: "status_update",
      assignmentId,
      status: "processing",
      message: "Saving generated paper...",
      progress: 80,
    });

    await job.updateProgress(80);

    const paper = new GeneratedPaper({
      assignmentId,
      ...paperData,
    });

    await paper.save();

    console.log("💾 Paper saved with ID:", paper._id.toString());

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "completed",
      generatedPaperId: paper._id.toString(),
    });

    await setJobState(job.id!, {
      status: "completed",
      paperId: paper._id.toString(),
    });

    await job.updateProgress(100);

    broadcastToAssignment(assignmentId, {
      type: "generation_complete",
      assignmentId,
      paperId: paper._id.toString(),
      status: "completed",
      message: "Question paper generated successfully!",
      progress: 100,
    });

    console.log(`✅ Job ${job.id} completed — paperId: ${paper._id}`);
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Job ${job.id} failed:`, errMsg);

    await Assignment.findByIdAndUpdate(assignmentId, { status: "failed" });
    await setJobState(job.id!, { status: "failed", error: errMsg });

    broadcastToAssignment(assignmentId, {
      type: "generation_failed",
      assignmentId,
      status: "failed",
      message: errMsg,
    });

    throw error; // Let BullMQ mark job as failed
  }
}

// ---------------- START WORKER ----------------
async function startWorker() {
  await connectDB();

  const worker = new Worker<GenerationJobData>(QUEUE_NAME, processJob, {
    connection: redisClient,
    concurrency: 3,
  });

  worker.on("completed", (job) => {
    console.log(`✅ Worker completed job ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Worker failed job ${job?.id}:`, err.message);
  });

  worker.on("progress", (job, progress) => {
    console.log(`📊 Job ${job.id}: ${progress}%`);
  });

  console.log("🚀 Question generation worker started");
}

startWorker().catch(console.error);