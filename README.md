# VedaAI

A tool for teachers to generate assignment question papers from their own source material — upload a PDF or image of a topic, get a grounded question paper back.
https://github.com/user-attachments/assets/b5459939-f38e-44a9-b64c-6ff1f6f54d94

What it does
Teachers upload a source document (textbook excerpt, notes, any PDF or image). The app reads it, understands the content, and generates a question paper grounded in that material — not generic questions pulled from thin air. The output can be downloaded as a PDF or regenerated if you want a different set.
The key thing: questions come from your document. If you upload a chapter on photosynthesis, you get questions about that chapter, not a generic biology quiz.

Stack

Frontend — Next.js 14 (App Router), TypeScript, Tailwind, Zustand
Backend — Node.js, Express, TypeScript, Mongoose
Jobs — BullMQ + Redis for background generation
DB — MongoDB


Running locally
You'll need Node 18+, a running MongoDB instance, and Redis.
bash# Install everything from the root
npm install

# Backend — copy and fill in your values
cp apps/backend/.env.example apps/backend/.env

# Frontend — adjust API URL if needed
cp apps/frontend/.env.local.example apps/frontend/.env.local
Then start both apps:
bashnpm --workspace apps/frontend run dev   # http://localhost:3000
npm --workspace apps/backend run dev    # http://localhost:4000
Backend env vars you'll need:
VariableWhat it isMONGODB_URIMongoDB connection stringREDIS_URLRedis connection stringOPENAI_API_KEYKey for generationCLIENT_URLFrontend origin (for CORS)PORTDefaults to 4000

How generation works

Teacher uploads a source file via the UI
Backend saves it and queues a background job
Worker picks up the job, encodes the file, and sends it as a multimodal input to the model with a grounding prompt
Generated paper gets saved and linked back to the assignment
Teacher sees the result, can download or regenerate

Source files are stored with binary data kept private — the public API never exposes the raw file bytes. Regeneration clones the original server-side so the file never has to be re-uploaded.

Repo layout
apps/
  frontend/   Next.js UI
  backend/    Express API + worker + models

A few notes for production

Move binary uploads to S3 (or similar) and store the reference in MongoDB. Keeping large blobs in the DB works for a demo but doesn't scale.
Make sure your worker process loads the same env as the API server, especially the model API keys.
The regenerate flow is intentionally server-side to avoid clients re-uploading sensitive files.


License
No license file yet — add one before you share this publicly.
