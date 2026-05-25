import axios from "axios";
import { Assignment, GeneratedPaper } from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({ baseURL: API_URL });

export async function createAssignment(
  formData: FormData
): Promise<{ assignmentId: string; jobId: string }> {
  const { data } = await api.post("/api/assignments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const { data } = await api.get(`/api/assignments/${id}`);
  return data;
}

export async function getGeneratedPaper(
  assignmentId: string
): Promise<GeneratedPaper> {
  const { data } = await api.get(`/api/assignments/${assignmentId}/paper`);
  return data;
}

export async function regeneratePaper(
  assignmentId: string
): Promise<{ assignmentId: string; jobId: string }> {
  const { data } = await api.post(`/api/assignments/${assignmentId}/regenerate`);
  return data;
}

export async function listAssignments(): Promise<Assignment[]> {
  const { data } = await api.get("/api/assignments");
  return data;
}
