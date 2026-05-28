# VedaAI — Assignment Generator

Professional, demo-ready monorepo for an assignment-generator prototype that demonstrates
grounded multimodal question generation from teacher-uploaded source materials (PDFs/images).

This repository contains a Next.js frontend and an Express backend with worker-based generation using multimodal prompts. The demo video below shows the app in action.

**Demo video**

<video controls width="100%" style="max-width:900px; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.12);">
  <source src="./fixed_enhanced_video.mp4" type="video/mp4">
  Your browser does not support the video tag. You can download the demo video here: [fixed_enhanced_video.mp4](./fixed_enhanced_video.mp4)
</video>

--

**Quick summary**

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand for state.
- Backend: Node.js + Express + TypeScript, Mongoose for persistence, BullMQ + Redis for background jobs.
- Features: upload source paper (PDF/image), generate grounded question paper, download PDF, regenerate while preserving original file bytes.

**Highlights**

- Uploaded source files are persisted privately (binary fields omitted from public API responses).
- Worker sends the original file as a multimodal input to the model so outputs are grounded in the source.
- Regenerate endpoint clones the original assignment server-side to preserve privacy and binary data.

## Repo structure

- `apps/frontend` — Next.js frontend (UI, PDF rendering, assignment flows).
- `apps/backend` — Express API, worker code, and models.

## Requirements

- Node.js 18+
- npm 9+
- MongoDB accessible at `MONGODB_URI`
- Redis accessible at `REDIS_URL`

## Quickstart (development)

1. Install dependencies from the repository root:

```bash
npm install
```

2. Configure environment files:

- Copy `apps/frontend/.env.local.example` to `apps/frontend/.env.local` and adjust `NEXT_PUBLIC_API_URL` if needed.
- Copy `apps/backend/.env.example` to `apps/backend/.env` and set `MONGODB_URI`, `REDIS_URL`, `CLIENT_URL`, and your model API keys (e.g., `OPENAI_API_KEY`).

3. Start apps in development (examples — adjust as needed):

```bash
npm --workspace apps/frontend run dev
npm --workspace apps/backend run dev
```

Frontend default: `http://localhost:3000` (if occupied it may pick another port). Backend default: `http://localhost:4000`.

## Environment variables (backend)

- `PORT` — HTTP port (default: 4000)
- `MONGODB_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection string
- `OPENAI_API_KEY` — OpenAI API key for worker generation
- `CLIENT_URL` — Frontend origin for CORS and socket connections

## How the generation works (high level)

1. Teacher uploads a source paper (PDF/image) via the frontend.
2. Backend saves the assignment and enqueues a background job.
3. Worker loads the assignment including the binary `fileBuffer`, encodes it, and sends it as a multimodal input to the model along with a grounding prompt.
4. The generated question paper is parsed and saved as a `GeneratedPaper` linked to the assignment.

## Running the demo video locally

If you cloned this repo, the demo video is available at `./fixed_enhanced_video.mp4`. You can open or play it with any video player, or view it inline on GitHub when the file is present in the repository root.

## Notes & best practices

- For production usage, move binary uploads to object storage (S3) and store references in MongoDB to avoid large database objects.
- Ensure workers and backend load the same environment (API keys) before starting background jobs.
- Keep binary fields excluded from public API projections to preserve privacy.

## Contributing

Contributions welcome. Open issues for bugs or feature requests and send PRs for improvements. For substantial changes, open an issue first to discuss the design.

## License

This repository does not include a license file. Add a license (e.g., MIT) if you plan to publish or share.

---

If you want, I can:

- Move `fixed_enhanced_video.mp4` into a `demo/` folder and update references.
- Upload the demo video to an external host (YouTube) and replace the inline player with an embedded YouTube iframe.
- Add screenshots and short GIFs for README preview on GitHub.

Which of these would you like me to do next?