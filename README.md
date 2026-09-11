# PulseVote ⚡

> **Production-Quality Interactive Presentation & Live Audience-Response Platform**  
> *Engineered for high-concurrency real-time engagement, low-latency live polling, and intuitive presentation workflows.*

---

## 🏗️ Architecture Overview

PulseVote is structured as a modular TypeScript monorepo designed for performance, maintainability, and clean separation between presentation authoring and live audience participation.

```
PulseVote/
├── client/          # Vite + React 18 + TypeScript + Tailwind CSS
├── server/          # Node.js + Express + Socket.IO + Prisma ORM
└── shared/          # Shared domain entities, enums, and WebSocket contracts
```

### Core Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Socket.IO v4, TypeScript
- **Database & ORM**: Prisma ORM with SQLite (zero-config local dev) / PostgreSQL (production target)
- **Real-Time Protocol**: Bi-directional WebSocket channels with automatic reconnect & fallback long-polling
- **Testing**: Vitest, Supertest, React Testing Library

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+

No external database installation or Docker container is required to get started locally.

### 2. Installation
Install all dependencies across all packages:
```bash
npm install
```

### 3. Build Shared Package & Generate Prisma Client
```bash
# Build the shared contracts
npm run build:shared

# Generate Prisma client and initialize SQLite database
cd server
npm run prisma:push
cd ..
```

### 4. Start Development Servers
Run both backend (`http://localhost:4000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
npm run dev:server   # Starts backend on :4000
npm run dev:client   # Starts frontend on :5173
```

---

## 🧪 Running Tests

Execute the automated test suite across client and server:
```bash
# Run all tests
npm test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client
```

---

## 🗺️ Milestone Roadmap

- [x] **v0.1 Foundation** *(Completed)*
  - Monorepo workspace configuration
  - Shared TypeScript data models & WebSocket event contracts
  - Express + Socket.IO server with health check & heartbeat
  - Prisma relational schema & SQLite integration
  - React + Vite + Tailwind client with live diagnostic dashboard
  - Automated integration & unit tests
- [ ] **v0.2 Presenter Authentication & Workspace Dashboard**
  - Secure presenter registration & login (bcrypt/argon2, JWT / HttpOnly cookies)
  - Presenter dashboard & presentation CRUD
- [ ] **v0.3 Slide Builder & Question Types**
  - Multi-slide editor (Multiple Choice, Word Cloud, Open Ended, Quiz)
- [ ] **v0.4 Live Session & Participant Room Engine**
  - 6-digit session join code & QR code generation
  - Participant anonymous join flow & mobile interface
- [ ] **v0.5 Real-Time Voting & Live Visualizations**
  - WebSocket vote tallying, real-time Recharts bar/pie charts, presenter display mode
- [ ] **v0.6 Audience Q&A & Upvoting**
- [ ] **v0.7 Quiz Mode, Leaderboard & Session Export**
  - Timed quiz questions, score calculation, CSV/JSON session exports
