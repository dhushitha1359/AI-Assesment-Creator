# AI Assessment Creator

A full-stack AI-powered assessment generation platform built using Next.js, Node.js, TypeScript, MongoDB, Redis, BullMQ, and WebSockets.

The application allows teachers to create assignments, generate structured AI-based question papers, track progress in real time, and view formatted exam papers.

---

# Features

- AI-powered question paper generation
- Structured sections and questions
- Difficulty-based question tagging
- Real-time progress updates using WebSockets
- Background job processing with BullMQ
- MongoDB database integration
- Redis caching and queue management
- Responsive frontend UI
- File upload support
- Clean exam-paper style output page

---

# Tech Stack

## Frontend
- Next.js
- TypeScript
- Zustand
- Tailwind CSS
- WebSockets

## Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Redis
- BullMQ

---

# Project Structure

```bash
vedaai/
│
├── frontend/
├── backend/
└── package.json
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Assesment-Creator.git
```

```bash
cd AI-Assesment-Creator/vedaai
```

---

# Backend Setup

Open terminal inside:

```bash
vedaai/backend
```

## Install Dependencies

```bash
npm install
```

## Create .env File

```env
PORT=4000

MONGODB_URI=your_mongodb_connection

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

OPENAI_API_KEY=your_api_key
```

## Start Backend Server

```bash
npm run dev
```

## Start Worker

Open another terminal inside backend folder:

```bash
npm run worker
```

---

# Frontend Setup

Open terminal inside:

```bash
vedaai/frontend
```

## Install Dependencies

```bash
npm install
```

## Create .env.local File

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

## Start Frontend

```bash
npm run dev
```

---

# Running the Application

## Terminal 1

```bash
cd vedaai/backend
npm run dev
```

## Terminal 2

```bash
cd vedaai/backend
npm run worker
```

## Terminal 3

```bash
cd vedaai/frontend
npm run dev
```

---

# API Flow

1. Teacher creates assignment
2. Backend stores assignment in MongoDB
3. Job added to BullMQ queue
4. Worker processes AI generation
5. Generated paper stored in database
6. Frontend receives updates through WebSocket
7. Final paper displayed in structured format

---

# Deployment

## Frontend
Recommended: Vercel

## Backend
Recommended: Render / Railway

## Database
MongoDB Atlas

## Redis
Upstash Redis / Railway Redis

---

# Environment Variables

## Backend

```env
PORT=
MONGODB_URI=
REDIS_HOST=
REDIS_PORT=
OPENAI_API_KEY=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WS_URL=
```

---

# Future Improvements

- PDF export
- Authentication system
- Question regeneration
- Advanced AI prompt tuning
- Role-based access
- Exam templates

---

# Author

Dhushitha Mahendran
