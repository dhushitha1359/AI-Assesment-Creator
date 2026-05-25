import { Router, Request, Response } from "express";
import multer from "multer";
import { Assignment, GeneratedPaper } from "../models";
import { questionQueue } from "../queues/assignmentQueue";
import { getCache, setCache } from "../services/redisService";

const router = Router();

// Multer setup — memory storage, 5MB limit, PDF/text only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── POST /api/assignments  ───────────────────────────────────────────────────
router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        title,
        subject,
        dueDate,
        questionTypes,
        numberOfQuestions,
        totalMarks,
        additionalInstructions,
      } = req.body;

      // Validation
      if (!title || !subject || !dueDate || !numberOfQuestions || !totalMarks) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      if (Number(numberOfQuestions) < 1 || Number(totalMarks) < 1) {
        res
          .status(400)
          .json({ error: "numberOfQuestions and totalMarks must be positive" });
        return;
      }

      const parsedTypes = Array.isArray(questionTypes)
        ? questionTypes
        : typeof questionTypes === "string"
        ? JSON.parse(questionTypes)
        : [];

      let fileContent: string | undefined;
      let fileName: string | undefined;

      if (req.file) {
        fileName = req.file.originalname;
        if (req.file.mimetype === "text/plain") {
          fileContent = req.file.buffer.toString("utf-8");
        } else {
          // PDF: extract text as base64 for now (frontend can enhance)
          fileContent = req.file.buffer.toString("base64");
        }
      }

      // Save assignment
      const assignment = new Assignment({
        title,
        subject,
        dueDate: new Date(dueDate),
        questionTypes: parsedTypes,
        numberOfQuestions: Number(numberOfQuestions),
        totalMarks: Number(totalMarks),
        additionalInstructions,
        fileContent,
        fileName,
        status: "pending",
      });
      await assignment.save();

      // Enqueue background job
      const job = await questionQueue.add("generate", {
        assignmentId: assignment._id.toString(),
        title,
        subject,
        questionTypes: parsedTypes,
        numberOfQuestions: Number(numberOfQuestions),
        totalMarks: Number(totalMarks),
        additionalInstructions,
        fileContent: req.file?.mimetype === "text/plain" ? fileContent : undefined,
      });

      await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

      res.status(201).json({
        success: true,
        assignmentId: assignment._id.toString(),
        jobId: job.id,
        message: "Assignment created. Generation started.",
      });
    } catch (err) {
      console.error("POST /assignments error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/assignments ─────────────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = "assignments:list";
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select("-fileContent");
    await setCache(cacheKey, assignments, 60);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `assignment:${req.params.id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const assignment = await Assignment.findById(req.params.id).select(
      "-fileContent"
    );
    if (!assignment) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    await setCache(cacheKey, assignment, 300);
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/assignments/:id/paper ──────────────────────────────────────────
router.get(
  "/:id/paper",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const cacheKey = `paper:assignment:${req.params.id}`;
      const cached = await getCache(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }
      const paper = await GeneratedPaper.findOne({
        assignmentId: req.params.id,
      });
      if (!paper) {
        res.status(404).json({ error: "Paper not generated yet" });
        return;
      }
      await setCache(cacheKey, paper, 3600);
      res.json(paper);
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ─── GET /api/assignments/:id/regenerate ─────────────────────────────────────
router.post(
  "/:id/regenerate",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) {
        res.status(404).json({ error: "Assignment not found" });
        return;
      }

      // Delete old paper
      await GeneratedPaper.deleteOne({ assignmentId: req.params.id });
      await Assignment.findByIdAndUpdate(req.params.id, {
        status: "pending",
        generatedPaperId: undefined,
      });

      // Re-enqueue
      const job = await questionQueue.add("generate", {
        assignmentId: assignment._id.toString(),
        title: assignment.title,
        subject: assignment.subject,
        questionTypes: assignment.questionTypes,
        numberOfQuestions: assignment.numberOfQuestions,
        totalMarks: assignment.totalMarks,
        additionalInstructions: assignment.additionalInstructions,
        fileContent:
          assignment.fileName?.endsWith(".txt")
            ? assignment.fileContent
            : undefined,
      });

      await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

      res.json({
        success: true,
        assignmentId: assignment._id.toString(),
        jobId: job.id,
        message: "Regeneration started.",
      });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
