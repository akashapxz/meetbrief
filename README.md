# 🎙️ MeetBrief: AI Meeting Insight Hub

MeetBrief is a state-of-the-art, high-fidelity AI-powered meeting analytics platform. It automatically processes meeting audio and transcripts using **Gemini 2.5 Flash** to extract executive summaries, key decisions, timelines, action items, and sentiment analysis. It also features a real-time vocal share simulator and an interactive AI meeting copilot.

---

## 🚀 Key Features

*   **📊 Insight Dashboard**: An overview of past meetings, durations, visual sentiment metrics, and structured breakdowns.
*   **🗣️ Real-time Vocal Share Simulator**: Captures microphone audio during meetings to calculate and visualize conversational share among speakers in real-time.
*   **🧠 Gemini AI Insights Pipeline**: Automatically extracts key topics, action items with owners, timeline breakdowns, and key decisions from transcripts.
*   **💬 Interactive Meeting Copilot**: A context-grounded chat interface allowing users to ask questions directly about their meetings (e.g., *"What did we decide on the budget timeline?"*).
*   **📄 Document Export**: Export professional, structured meeting summaries directly to editable Microsoft Word (`.doc`) files.
*   **🔑 Dual-Authentication Protocol**: Supports both secure cloud authentication (Firebase Google Sign-In) and a fallback local mock system for offline staging.

---

## 🛠️ Architecture

MeetBrief is built as a unified TypeScript application:

```mermaid
graph TD
    Client[React Frontend / Vite] -->|HTTPS Requests / Auth Token| Server[Express Backend API / server.ts]
    Server -->|SDK Queries| Gemini[Google Gemini 2.5 Flash]
    Server -->|Drizzle ORM| DB[(Supabase PostgreSQL)]
    Client -->|OAuth Token| Firebase[Firebase Auth]
    Server -->|Verification| Firebase
```

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide icons, Motion.
*   **Backend**: Node.js, Express, tsx.
*   **Database**: Supabase PostgreSQL with Drizzle ORM.
*   **Authentication**: Firebase Authentication.
*   **AI Engine**: Google Gen AI SDK (`gemini-2.5-flash`).

---

## 💻 Local Setup & Development

### 1. Prerequisites
Ensure you have **Node.js** (v18+) installed.

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys (see `.env.example` for details):

```ini
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Supabase Database URL
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.your-id.supabase.co:5432/postgres
```

### 3. Firebase Web Configuration
Create a `firebase-applet-config.json` in the root of the project with your Firebase web configuration:

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project-id.firebaseapp.com",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

### 4. Installation & Start
Install the dependencies and start the unified server:

```bash
# Install packages
npm install

# Start the server (both backend and client)
npm run dev
```
The application will be served at **`http://localhost:3000`**.

---

## 🛡️ Administrative Staging Backdoor
For local development or testing without Google OAuth, you can bypass Firebase entirely on the sign-in screen:
*   **Username**: `admin`
*   **Password**: `adminadmin`

---

## 🌐 Deployment Guide (Render)

Render is the recommended platform to host the unified application.

1. **Connect Repository**: Link your GitHub repository to [Render](https://render.com/).
2. **Create Web Service**: Click **New +** > **Web Service**.
3. **Configure Settings**:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm run start`
    *   **Instance Type**: `Free`
4. **Define Secrets**: In the **Environment** tab, set the following environment variables:
    *   `SUPABASE_DATABASE_URL` = *[Your database connection string]*
    *   `GEMINI_API_KEY` = *[Your Gemini API key]*
    *   `NODE_ENV` = `production`
