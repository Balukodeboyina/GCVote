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
- **Backend**: Node.js, Express, Prisma ORM, bcryptjs, jsonwebtoken, cookie-parser
- **Database**: SQLite (`dev.db`) for zero-dependency local development; PostgreSQL target for production
- **Security**: Bcrypt password hashing (10 salt rounds), JWT in `HttpOnly` `SameSite=Lax` cookies, Zod request schema validation, strict relational ownership checks
- **Testing**: Vitest, Supertest, React Testing Library

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+

No external database installation or Docker daemon is required.

### 2. Installation
Install all dependencies across all packages:
```bash
npm install
```

### 3. Build Shared Package & Initialize Database
```bash
# Build the shared contracts
npm run build:shared

# Initialize the SQLite database and generate Prisma Client
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

## 🔐 API Endpoints (v0.1 Foundation)

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new presenter with hashed password | Public |
| `POST` | `/api/auth/login` | Authenticate presenter and issue JWT cookie/token | Public |
| `POST` | `/api/auth/logout` | Clear authentication cookie | Public |
| `GET` | `/api/auth/me` | Fetch authenticated presenter profile & counts | Authenticated |

### Presentations (`/api/presentations`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/presentations` | List all presentations belonging to presenter | Authenticated |
| `POST` | `/api/presentations` | Create new presentation (`title`, `description`) | Authenticated |
| `GET` | `/api/presentations/:id` | Get presentation by ID (strict owner check) | Authenticated |
| `PUT` | `/api/presentations/:id` | Update presentation title/description | Authenticated |
| `DELETE` | `/api/presentations/:id` | Delete presentation (strict owner check) | Authenticated |

---

## 🧪 Running Tests

Execute the automated test suite across client and server:
```bash
# Run all tests (26 passed)
npm test

# Run backend tests only (21 passed)
npm run test:server

# Run frontend tests only (5 passed)
npm run test:client
```

---

## 🗺️ Milestone Roadmap

- [x] **v0.1 Foundation** *(Completed & Verified)*
  - Monorepo workspace configuration & TypeScript contracts
  - Presenter registration, login, logout, and bcrypt password hashing
  - JWT authentication middleware and secure cookie handling
  - Protected presenter dashboard with live presentation count
  - Full Presentation CRUD (Create, Read, Update, Delete) with ownership isolation
  - Relational SQLite schema with indexes and cascade rules
  - Responsive Tailwind CSS UI with modals and error handling
  - Automated test suite covering auth, CRUD, and unauthorized access (26 tests passing)
- [ ] **v0.2 Slide Builder & Question Types**
  - Slide canvas and multi-slide editor
  - Question definitions (Multiple Choice, Word Cloud, Open-Ended, Rating, Quiz)
- [ ] **v0.3 Live Session & Participant Room Engine**
  - 6-digit session join code & QR code generation
  - Participant anonymous join flow & mobile interface
- [ ] **v0.4 Real-Time Voting & Live Visualizations**
  - WebSocket vote tallying, real-time Recharts bar/pie charts, presenter display mode
- [ ] **v0.5 Audience Q&A & Upvoting**
- [ ] **v0.6 Quiz Mode, Leaderboard & Session Export**
  - Timed quiz questions, score calculation, CSV/JSON session exports
