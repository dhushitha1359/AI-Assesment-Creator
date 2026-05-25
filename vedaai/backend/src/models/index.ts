import mongoose, { Document, Schema } from "mongoose";

// ─── Assignment Model ─────────────────────────────────────────────────────────
export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
  fileName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  jobId?: string;
  generatedPaperId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String }],
    numberOfQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    fileName: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    jobId: { type: String },
    generatedPaperId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);

// ─── Generated Paper Model ────────────────────────────────────────────────────
export interface IQuestion {
  id: string;
  text: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  type: string;
}

export interface ISection {
  id: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
  totalMarks: number;
}

export interface IGeneratedPaper extends Document {
  assignmentId: string;
  title: string;
  subject: string;
  totalMarks: number;
  duration?: string;
  sections: ISection[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Moderate", "Hard"],
    required: true,
  },
  marks: { type: Number, required: true },
  type: { type: String, required: true },
});

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
  totalMarks: { type: Number, required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: String, required: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    duration: { type: String },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  "GeneratedPaper",
  GeneratedPaperSchema
);
