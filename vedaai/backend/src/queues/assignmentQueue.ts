import { Queue } from "bullmq";
import { redisClient } from "../services/redisService";

export const QUEUE_NAME = "question-generation";

export const questionQueue = new Queue(QUEUE_NAME, {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export interface GenerationJobData {
  assignmentId: string;
  title: string;
  subject: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
}
