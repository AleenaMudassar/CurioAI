# Classroom AI — Hackathon MVP

AI-powered classroom app using **Gemini**: teaching notes, live student Q&A, released questions, answer analysis, exit tickets, and progress tracking.

## Features

### Teacher
- **Upload lesson plan** — Paste your plan for the day; Gemini generates **teaching notes** (key points, misconceptions, pacing, discussion prompts).
- **Student questions** — See questions on your screen with **AI-suggested answers** and examples. Type your own answer or click "Let AI answer."
- **Ask Gemini** — Floating chat button (bottom-right). Ask anything; answers are tailored to your **curriculum and uploaded notes**.
- **Release questions** — Post exercises (e.g. "Release question 1"); students answer on their side.
- **Analyze answers** — After students submit, click "Analyze with AI" to get a summary: where students do well, common mistakes, and what to review.
- **Exit tickets** — View individual feedback, then "Summarize & get suggestions" for a class summary and **suggestions for the next lesson**.
- **Student progress** — See each student's questions asked and answers submitted.

### Student
- **Ask the teacher** — Type a question; it appears on the teacher's screen. If the teacher doesn't respond or you need clarification, **Get AI answer** (based on curriculum and teacher's notes).
- **Confusion check** — "Check for confusion" on your question: AI detects repeated confusion phrases / misunderstood keywords and shows **suggested rephrases** (2–3 alternate ways to ask).
- **Exercises** — See released questions, type your answer, submit; answers go to the teacher.
- **Exit ticket** — At end of class: feedback on the lesson and what you learned; AI summarizes for the teacher.

## Setup

1. **Clone / open the project**
   ```bash
   cd GDG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Gemini API key**
   - Get a key at [Google AI Studio](https://aistudio.google.com/apikey).
   - Create `.env.local` in the project root:
     ```
     GEMINI_API_KEY=your_key_here
     ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Teacher:** Click "I'm a Teacher" → enter your name → **Create class**. You'll get a **class code** (e.g. `ABC123`). Share this with students.
2. **Teacher:** Upload your lesson plan in **Lesson & notes** and click **Generate teaching notes**.
3. **Students:** Click "I'm a Student" → enter the **class code** and name → **Join class**.
4. **Students:** Ask questions in **Ask a question**; use **Check for confusion** for suggested rephrases. Use **Get AI answer** if the teacher hasn’t answered or you need clarification.
5. **Teacher:** In **Student questions**, see questions and AI suggestions; type your answer or **Let AI answer**.
6. **Teacher:** In **Exercises & analysis**, add a question and **Release question**. Students answer in **Exercises**. After submissions, click **Analyze with AI** to see where the class is doing well and where they’re making mistakes.
7. **Students:** In **Exit ticket**, submit feedback and what you learned.
8. **Teacher:** In **Exit tickets**, click **Summarize & get suggestions** to get the summary and ideas for the next lesson. Use **Student progress** to track individuals.

## Tech

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **Gemini** (`@google/generative-ai`) for all AI: teaching notes, answer suggestions, teacher chat, answer analysis, exit ticket summary, confusion detection
- In-memory store (resets on server restart) — suitable for a single-session hackathon demo

## Hackathon note

No database or auth: one class per server instance, identified by class code. For production you’d add persistence and authentication.
# CurioAI
