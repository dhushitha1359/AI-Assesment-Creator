import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  AssignmentFormData,
  Assignment,
  GeneratedPaper,
  WSMessage,
} from "../types";

interface GenerationState {
  status: "idle" | "pending" | "processing" | "completed" | "failed";
  message: string;
  progress: number;
  assignmentId: string | null;
  paperId: string | null;
}

interface AssignmentStore {
  // Form state
  formData: AssignmentFormData;
  formErrors: Partial<Record<keyof AssignmentFormData, string>>;
  isSubmitting: boolean;

  // Generation state
  generation: GenerationState;

  // Data
  currentAssignment: Assignment | null;
  currentPaper: GeneratedPaper | null;

  // WebSocket
  wsConnected: boolean;

  // Actions
  setFormField: <K extends keyof AssignmentFormData>(
    key: K,
    value: AssignmentFormData[K]
  ) => void;
  toggleQuestionType: (type: string) => void;
  setFormError: (key: keyof AssignmentFormData, error: string) => void;
  clearFormErrors: () => void;
  setIsSubmitting: (val: boolean) => void;
  resetForm: () => void;

  setGeneration: (state: Partial<GenerationState>) => void;
  setCurrentAssignment: (a: Assignment | null) => void;
  setCurrentPaper: (p: GeneratedPaper | null) => void;
  setWsConnected: (val: boolean) => void;

  handleWSMessage: (msg: WSMessage) => void;
}

const defaultForm: AssignmentFormData = {
  title: "",
  subject: "",
  dueDate: "",
  questionTypes: [],
  numberOfQuestions: "",
  totalMarks: "",
  additionalInstructions: "",
  file: null,
};

const defaultGeneration: GenerationState = {
  status: "idle",
  message: "",
  progress: 0,
  assignmentId: null,
  paperId: null,
};

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      formData: defaultForm,
      formErrors: {},
      isSubmitting: false,
      generation: defaultGeneration,
      currentAssignment: null,
      currentPaper: null,
      wsConnected: false,

      setFormField: (key, value) =>
        set((s) => ({
          formData: { ...s.formData, [key]: value },
          formErrors: { ...s.formErrors, [key]: undefined },
        })),

      toggleQuestionType: (type) =>
        set((s) => {
          const types = s.formData.questionTypes;
          return {
            formData: {
              ...s.formData,
              questionTypes: types.includes(type)
                ? types.filter((t) => t !== type)
                : [...types, type],
            },
            formErrors: { ...s.formErrors, questionTypes: undefined },
          };
        }),

      setFormError: (key, error) =>
        set((s) => ({ formErrors: { ...s.formErrors, [key]: error } })),

      clearFormErrors: () => set({ formErrors: {} }),

      setIsSubmitting: (val) => set({ isSubmitting: val }),

      resetForm: () =>
        set({
          formData: defaultForm,
          formErrors: {},
          generation: defaultGeneration,
          currentAssignment: null,
          currentPaper: null,
        }),

      setGeneration: (state) =>
        set((s) => ({ generation: { ...s.generation, ...state } })),

      setCurrentAssignment: (a) => set({ currentAssignment: a }),
      setCurrentPaper: (p) => set({ currentPaper: p }),
      setWsConnected: (val) => set({ wsConnected: val }),

      handleWSMessage: (msg) => {
        const { setGeneration } = get();
        switch (msg.type) {
          case "status_update":
            setGeneration({
              status: "processing",
              message: msg.message || "Processing...",
              progress: msg.progress || 0,
            });
            break;
          case "generation_complete":
            setGeneration({
              status: "completed",
              message: "Question paper is ready!",
              progress: 100,
              paperId: msg.paperId || null,
            });
            break;
          case "generation_failed":
            setGeneration({
              status: "failed",
              message: msg.message || "Generation failed.",
              progress: 0,
            });
            break;
        }
      },
    }),
    { name: "AssignmentStore" }
  )
);
