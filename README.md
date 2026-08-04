# Multi-Document Intelligence Workbench

A production-ready full-stack monorepo project scaffold for an AI application designed to upload multiple documents, provide analysis instructions, and receive structured AI-generated insights.

## Project Structure

```
multi-document-intelligence-workbench/
├── backend/                  # Node.js + Express + TypeScript + Prisma (SQLite)
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
├── package.json              # Root monorepo configuration
└── README.md                 # This file
```

## Tech Stack

### Frontend
- **React 19**: Modern UI component library.
- **TypeScript**: Strict compile-time type safety.
- **Vite**: Rapid dev server and bundling.
- **Tailwind CSS**: Utility-first CSS styling framework.
- **Axios**: HTTP client configuration with request/response mapping.
- **React Router (v7)**: Navigation routing.

### Backend
- **Node.js & Express**: Backend HTTP API.
- **TypeScript**: Shared type-safety principles.
- **Prisma ORM & SQLite**: Database connectivity and migrations.
- **Multer**: Multi-part form-data / file upload middleware interface.
- **dotenv**: Environment configuration.
- **helmet, cors, morgan**: Security and logging middlewares.

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or newer (Recommended: `v25.x`)
- **npm**: `v10.x` or newer

### Installation
From the repository root, install dependencies for all workspaces:
```bash
npm install
```

### Database Initialization
Go to the backend directory and set up the Prisma client and SQLite database:
```bash
cd backend
npx prisma db push
```

### Running Development Servers

You can run both the frontend and backend concurrently or run them individually:

#### Individually
- **Backend**: `npm run dev:backend` (runs on `http://localhost:5000`)
- **Frontend**: `npm run dev:frontend` (runs on `http://localhost:5173`)

## API Endpoints

- **Health Check**: `GET /api/health` -> Returns `{"success": true, "message": "Server running"}`
- **Document Management**: (TODO)
- **AI Chat/Intelligence**: (TODO)
