# QuizForge

QuizForge is a full-stack quiz and assessment platform with separate student and instructor experiences.

## Features

### Accounts and access
- Clerk sign-in and sign-up.
- First-time account sync with the QuizForge database.
- Student or instructor role selection during onboarding.
- Role-protected dashboard and API routes.

### Instructor
- Create, edit, publish, and archive quizzes.
- Create practice quizzes or scheduled tests.
- Configure time limits and allowed attempts.
- Generate multiple-choice questions with AI.
- Review attempts, quiz analytics, and individual answers.
- Release test results and email students.

### Student
- Browse published practice quizzes.
- Join scheduled tests with an access code.
- Start, resume, and save quiz attempts.
- Submit manually or automatically when the timer expires.
- Review practice results and released test results.

### Platform
- MongoDB persistence with Mongoose.
- Automatic expiry processing for timed attempts.
- Student-facing quiz responses omit answer keys.
- Production Express server can serve the built React application.
- GitHub Actions checks client lint/build and server JavaScript syntax.

## Technology

- Frontend: React, Vite, Tailwind CSS, React Router, Clerk.
- Backend: Node.js, Express, Mongoose, MongoDB.
- AI: OpenAI API (optional; required only for AI question generation).
- Email: Nodemailer with Gmail (optional; required only for email result release).

## Requirements

- Node.js 22 recommended.
- MongoDB database.
- Clerk application keys.
- OpenAI API key for AI quiz generation (optional).
- Gmail app password for result emails (optional).

## Local development

1. Clone the repository.
2. Install and configure the backend:

```bash
cd server
npm ci
cp .env.example .env
```

Fill in `MONGODB_URI` and `CLERK_SECRET_KEY`. Add `OPENAI_API_KEY` to enable AI question generation. Add `EMAIL_USER` and `EMAIL_PASSWORD` only if you want to send result emails.

3. Install and configure the frontend:

```bash
cd ../client
npm ci
cp .env.example .env
```

Set `VITE_CLERK_PUBLISHABLE_KEY` to the publishable key from the same Clerk application used by the backend.

4. Run the backend in one terminal:

```bash
cd server
npm run dev
```

5. Run the frontend in another terminal:

```bash
cd client
npm run dev
```

Vite proxies `/api` requests to `http://localhost:5000` during local development.

## Production deployment

The Express server serves the frontend build from `client/dist`. This allows the app and API to share one origin, so frontend API requests continue to use relative `/api` paths.

For a single Node hosting service (for example, Render):

- Root directory: repository root.
- Build command:

```bash
npm --prefix client ci && npm --prefix client run build && npm --prefix server ci
```

- Start command:

```bash
npm --prefix server start
```

Configure these environment variables in the hosting dashboard:

- `MONGODB_URI`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY` (available at client build time)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional; defaults to `gpt-4o-mini`)
- `EMAIL_USER` and `EMAIL_PASSWORD` (optional)

Use production Clerk keys and the correct production domain in Clerk's allowed origins/redirect settings. Never commit real secrets or environment files.

Health check: `/api/health`.

## Checks

Client:

```bash
cd client
npm ci
npm run lint
npm run build
```

Server syntax:

```bash
cd server
npm ci
find src -name '*.js' -print0 | xargs -0 -n1 node --check
```

GitHub Actions runs these checks for pushes to `main` and `quizforge-completion`, and for pull requests targeting `main`.

## Important

AI-generated questions are drafts. Instructors should verify every question and answer before publishing. AI generation will return a configuration error until `OPENAI_API_KEY` is set on the server.
