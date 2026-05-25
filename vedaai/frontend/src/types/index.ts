export interface Question {
  id: string;
  text: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  marks: number;
  type: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedPaper {
  _id: string;
  assignmentId: string;
  title: string;
  subject: string;
  totalMarks: number;
  duration?: string;
  sections: Section[];
  createdAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileName?: string;
  status: "pending" | "processing" | "completed" | "failed";
  jobId?: string;
  generatedPaperId?: string;
  createdAt: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number | string;
  totalMarks: number | string;
  additionalInstructions: string;
  file: File | null;
}

export interface WSMessage {
  type:
    | "connected"
    | "subscribed"
    | "status_update"
    | "generation_complete"
    | "generation_failed";
  assignmentId?: string;
  paperId?: string;
  status?: string;
  message?: string;
  progress?: number;
  clientId?: string;
}

export const QUESTION_TYPES = [
  "MCQ",
  "Short Answer",
  "Long Answer",
  "True/False",
  "Fill in the Blanks",
  "Match the Following",
  "Assertion & Reason",
] as const;

export const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Custom",
] as const;
