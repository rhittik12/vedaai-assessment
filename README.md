# vedaai-assessment

Monorepo for a Next.js frontend and an Express backend.

## Structure

- `apps/frontend` - Next.js 14 + TypeScript + Tailwind CSS + Zustand
- `apps/backend` - Node.js + Express + TypeScript

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB running locally on `mongodb://localhost:27017/vedaai`
- Redis running locally on `redis://localhost:6379`

## Setup

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create environment files:

   - Copy `apps/frontend/.env.local.example` to `apps/frontend/.env.local`
   - Copy `apps/backend/.env.example` to `apps/backend/.env`

3. Start the apps:

   ```bash
   npm run dev:frontend
   npm run dev:backend
   ```

## Environment Variables

### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### Backend

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your_key_here
CLIENT_URL=http://localhost:3000
```

## Architecture

The frontend consumes the backend API and socket server over HTTP and WebSocket. The backend exposes a basic Express API, a Socket.IO server, and placeholder integrations for MongoDB, Redis, BullMQ, and Anthropic so the app can be extended without changing the project layout.

## Running Locally

- Frontend: `npm run dev:frontend`
- Backend: `npm run dev:backend`

The frontend runs on `http://localhost:3000` and the backend runs on `http://localhost:4000`.