# EduPeer

EduPeer is a student peer-feedback application. Students can review classmates across five criteria, while administrators can inspect submissions, review class analytics, export records, and generate an AI-assisted class summary.

## Tech stack

- **Frontend:** HTML, CSS, and vanilla browser JavaScript
- **Backend:** Node.js 18+, Express 4
- **Database:** MongoDB, using the official MongoDB Node.js driver
- **Authentication:** bcrypt password hashing, JSON Web Tokens, and HTTP-only cookies
- **AI summary:** Google Gemini API, called from the server
- **Other libraries:** `dotenv` for environment configuration, `cookie-parser` for session cookies, and `express-rate-limit` for request limiting

## Architecture

```text
Browser
  index.html + style.css + script.js
       |
       | same-origin /api requests and session cookie
       v
Node.js / Express (server.js)
  authentication, role checks, validation, application logic
       |
       +---- MongoDB
       |       users
       |       class_students
       |       peer_feedback
       |       feedback
       |
       +---- Google Gemini API
               Admin-only AI class summary
```

- Express serves the frontend and JSON API from the same origin.
- The browser never connects directly to MongoDB or Gemini. Database access and AI API keys stay on the server.
- Passwords are hashed with bcrypt before being stored.
- `peer_feedback` stores the reviewer, target student, five ratings, average, comment, status, and timestamps. `feedback` stores course feedback. `users` stores accounts and roles.

## Getting started

### Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas cluster
- A Gemini API key if you want to use the admin AI summary

### Configure

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create a local `.env` file by copying the example:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Edit `.env` and configure the database connection and a private JWT secret:

   ```env
   PORT=3002
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017
   MONGODB_DB=student_feedback
   JWT_SECRET=replace-with-a-long-random-secret
   GEMINI_API_KEY=
   GEMINI_MODEL=gemini-3.5-flash
   ```

   For MongoDB Atlas, replace `MONGODB_URI` with the connection string from Atlas. Put your Gemini key after `GEMINI_API_KEY=` to enable AI summaries. Never commit `.env` or share API keys.

4. Start the server:

   ```powershell
   npm start
   ```

   For development with automatic server restarts:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3002](http://localhost:3002). Use the Express server URL; do not open `index.html` directly or use a separate static-file server.

## Usage

### Students

1. Create an account or sign in.
2. Browse and search the class roster.
3. Select **Give Feedback** for a classmate and rate teamwork, communication, punctuality, technical skills, and leadership from 1 to 5.
4. Add a constructive comment and submit. Previously submitted reviews can be edited.
5. Use **My Given Reviews** to view your submissions.

### Administrators

1. Register the staff account as a regular user.
2. Verify the staff member's identity through a trusted channel, then promote the account directly in MongoDB using a secured database-admin session:

   ```javascript
   db.users.updateOne(
     { email: "verified-staff@example.edu" },
     { $set: { role: "admin" } }
   )
   ```

   Do not expose database-admin credentials or provide database access to application users. The app intentionally does not grant admin privileges based only on a self-entered email address.
3. Sign in with the promoted account. Open **All Peer Submissions** to see who reviewed whom, individual criterion ratings, comments, and overall scores. Administrators can update review status and export reviews to CSV.
4. Open **Class Analytics** for class-wide metrics and the AI Class Summary. AI summaries require `GEMINI_API_KEY` and are subject to the provider's availability and quota.
5. **Clear All Reviews** permanently deletes every peer review after confirmation. This action cannot be undone.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a student account |
| `POST` | `/api/auth/signin` | Sign in |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/me` | Get the current signed-in account |
| `GET` | `/api/students` | Get the roster and current user's review status |
| `GET`, `POST` | `/api/peer-feedback` | List accessible peer reviews or submit/update a review |
| `POST` | `/api/admin/ai-summary` | Generate an administrator-only Gemini summary |
| `DELETE` | `/api/admin/peer-feedback` | Permanently delete all peer reviews |
| `GET` | `/api/admin/student-analytics` | Get class analytics |
| `GET` | `/api/admin/export-peer-feedback` | Export peer reviews as CSV |
| `GET`, `POST` | `/api/feedback` | List or submit course feedback |

Administrator routes require an authenticated administrator account. Students can only retrieve their own submitted peer reviews.
