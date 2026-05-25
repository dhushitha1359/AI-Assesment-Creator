# VedaAI – AI Assessment Creator

> **Full Stack Engineering Assignment** — Round 2 Submission

A production-grade AI-powered assessment creation platform that lets teachers generate structured, curriculum-aligned question papers using AI.

---

## 🚀 Live Demo

- **Frontend:** `https://vedaai-frontend.vercel.app` _(deploy link here)_
- **Backend:** `https://vedaai-backend.railway.app` _(deploy link here)_

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                  │
│  AssignmentForm → Zustand Store → WebSocket Client       │
│  OutputPage → GenerationProgress → QuestionPaper         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP + WebSocket
┌────────────────────▼────────────────────────────────────┐
│                    BACKEND (Express + TS)                 │
│                                                          │
│  POST /api/assignments                                    │
│       ↓                                                  │
│  BullMQ Queue ──────────────► Worker Process             │
│       │                           │                      │
│  WebSocket Server ◄───────────────┤                      │
│  (real-time updates)              ↓                      │
│                            Claude API (AI)               │
│                                   │                      │
│                            MongoDB (store)               │
│                                   │                      │
│                            Redis (cache + job state)     │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

1. Teacher fills in the assignment form (title, subject, question types, marks, file)
2. Frontend `POST /api/assignments` with `multipart/form-data`
3. Backend saves the assignment to **MongoDB** and enqueues a job via **BullMQ**
4. Frontend navigates to `/output/:id` and subscribes to WebSocket channel
5. **BullMQ Worker** picks up the job, calls **Claude API** with a structured prompt
6. Worker broadcasts real-time progress events via **WebSocket**
7. On completion, worker saves generated paper to MongoDB
8. Frontend polls + listens for `generation_complete` event, then fetches and renders the paper
9. Teacher can download as PDF or regenerate

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State Management | **Zustand** (with devtools middleware) |
| Real-time | **WebSocket** (native `ws` library) |
| Backend | Node.js + **Express** + TypeScript |
| Database | **MongoDB** + Mongoose |
| Cache / Job State | **Redis** (ioredis) |
| Job Queue | **BullMQ** |
| AI | **Anthropic Claude** (`claude-sonnet-4-20250514`) |
| PDF Export | jsPDF + jsPDF-AutoTable |

---

## 📁 Project Structure

```
vedaai/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server + HTTP + WebSocket init
│   │   ├── models/index.ts       # Mongoose models (Assignment, GeneratedPaper)
│   │   ├── routes/
│   │   │   └── assignments.ts    # CRUD + paper endpoints
│   │   ├── queues/
│   │   │   └── assignmentQueue.ts # BullMQ queue setup
│   │   ├── workers/
│   │   │   └── questionGenerator.ts # BullMQ worker (AI calls happen here)
│   │   └── services/
│   │       ├── aiService.ts      # Claude API + prompt engineering
│   │       ├── redisService.ts   # Redis client + cache helpers
│   │       └── wsService.ts      # WebSocket server + broadcast
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx              # Assignment creation page
    │   │   └── output/[id]/page.tsx  # Generated paper + progress page
    │   ├── components/
    │   │   ├── AssignmentForm.tsx    # Multi-section creation form
    │   │   ├── QuestionPaper.tsx     # Exam paper display + PDF export
    │   │   └── GenerationProgress.tsx # Real-time progress UI
    │   ├── store/
    │   │   └── assignmentStore.ts    # Zustand global store
    │   ├── lib/
    │   │   ├── api.ts               # Axios API calls
    │   │   └── websocket.ts         # WebSocket hook with auto-reconnect
    │   └── types/index.ts           # TypeScript interfaces
    ├── .env.local.example
    ├── package.json
    └── tsconfig.json
```

---

## ⚡ Local Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- Redis (local or [Redis Cloud](https://redis.io/cloud))
- Anthropic API key

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/vedaai-assessment
cd vedaai-assessment
```

### 2. Backend setup

```bash
cd backend
npm install

# Copy and fill in env variables
cp .env.example .env
# Edit .env with your MongoDB URI, Redis URL, Anthropic API key

# Start the server
npm run dev

# In a separate terminal, start the worker
npm run worker
```

### 3. Frontend setup

```bash
cd frontend
npm install

# Copy env
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
```

### 4. Open

Visit [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment

### Backend → Railway

```bash
# Push backend to Railway
# Set env vars in Railway dashboard:
# MONGODB_URI, REDIS_URL, ANTHROPIC_API_KEY, FRONTEND_URL
```

### Frontend → Vercel

```bash
# Push frontend to Vercel
# Set env vars:
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app
# NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app/ws
```

> ⚠️ **Important:** BullMQ requires a separate worker process. On Railway, deploy the backend with `npm start`, and add a second service with `npm run worker` (same codebase, different start command).

---

## 🤖 AI Approach

### Prompt Engineering

The AI service (`src/services/aiService.ts`) constructs a highly structured prompt that:

1. Specifies exact question/mark distribution requirements
2. Enforces difficulty distribution (40% Easy / 40% Moderate / 20% Hard)
3. Requests strict JSON output with no markdown or preamble
4. Includes optional teacher-uploaded content as reference material
5. Validates and sanitizes the parsed response before storage

### Response Parsing

- Raw AI response is JSON-parsed (never rendered directly)
- Difficulty values are validated against allowed enum values
- Section `totalMarks` is recomputed from questions (not trusted from AI)
- Each question gets a stable UUID assigned server-side

---

## ✨ Features

- ✅ Assignment creation form with full validation
- ✅ File upload (PDF/TXT) as reference material
- ✅ AI question generation via Claude API
- ✅ BullMQ background job processing
- ✅ Redis caching for API responses
- ✅ WebSocket real-time progress updates with auto-reconnect
- ✅ Fallback HTTP polling when WebSocket is unavailable
- ✅ Structured question paper output (sections, difficulty tags, marks)
- ✅ Student info section (name, roll, section)
- ✅ PDF export with proper formatting (jsPDF)
- ✅ Regenerate action
- ✅ Mobile responsive
- ✅ Zustand state management with devtools

---

## 🎨 Design Decisions

- **Dark theme** with purple accent — matches VedaAI brand identity
- **Sora** (display) + **DM Mono** (data/code) font pairing for clarity
- **Progressive disclosure** — form → loading → paper, one step at a time
- **Difficulty badges** color-coded: green (Easy), amber (Moderate), red (Hard)
- **Real exam paper aesthetic** on the output with sections, marks, student info

---

*Submitted by: [Your Name] | VedaAI Full Stack Engineering Assignment*
