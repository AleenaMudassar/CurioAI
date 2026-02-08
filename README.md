# CurioAI

**CurioAI** is an AI-powered classroom assistant designed to support teachers during live instruction and give students a safe, low-pressure way to ask questions and reflect on their learning. Built as a hackathon MVP, CurioAI uses **Gemini** to provide real-time teaching support, student clarification, answer analysis, and lesson insights — without replacing the teacher.

The platform offers two distinct experiences:
- a **Teacher dashboard** for lesson planning, live Q&A, assessment, and insight
- a **Student interface** for asking questions, completing exercises, and giving feedback

CurioAI is built with an educator-first mindset: AI assists instruction, improves clarity, and highlights patterns of understanding and confusion.

---

## Features

### 👩‍🏫 Teacher Experience

#### Lesson Planning with AI
- Paste or upload your lesson plan for the day
- Gemini generates **teaching notes**, including:
  - key concepts
  - common misconceptions
  - pacing suggestions
  - discussion prompts

#### Live Student Questions
- View student questions in real time
- For each question:
  - see **AI-suggested explanations and examples**
  - type your own response or click **“Let AI answer”**
- All AI responses are grounded in the uploaded lesson and curriculum context

#### Ask Gemini (Teacher Assistant)
- Floating chat button available at all times
- Ask content or pedagogical questions
- Responses are tailored to:
  - your uploaded lesson notes
  - classroom context
  - student grade level

#### Exercises & Answer Analysis
- Create and **release questions** to students during class
- Collect student responses in real time
- Click **“Analyze with AI”** to receive:
  - strengths in student understanding
  - common mistakes
  - concepts that need review

#### Exit Tickets & Lesson Reflection
- View individual student exit tickets
- One-click **“Summarize & get suggestions”** to get:
  - a class-wide understanding summary
  - AI-generated ideas for the next lesson

#### Student Progress Overview
- Track:
  - questions asked
  - exercises completed
  - exit ticket submissions
- Designed for insight and support, not grading or comparison

---

### 🧒 Student Experience

#### Ask Questions Safely
- Ask questions that appear on the teacher’s dashboard
- If clarification is needed:
  - click **“Get AI answer”** for a private explanation
- AI responses are based on the teacher’s lesson and notes

#### Confusion Check
- Run **“Check for confusion”** on your question
- AI detects:
  - confusion phrases
  - unclear wording
  - misunderstood keywords
- Returns **2–3 suggested rephrasings** to help students ask clearer questions

#### Exercises
- View questions released by the teacher
- Submit answers directly in the app
- Responses are sent to the teacher for review and AI analysis

#### Exit Tickets
- At the end of class:
  - share what you learned
  - give feedback on the lesson
- Responses are summarized for the teacher using AI

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Gemini AI** (`@google/generative-ai`)
  - teaching note generation
  - answer suggestions
  - student clarification
  - confusion detection
  - answer analysis
  - exit ticket summaries

### Data Handling
- In-memory data store (resets on server restart)
- No authentication or database (intentional for hackathon MVP)

---

## 🚀 Getting Started

### 1. Clone or open the project
### 2. Install Depndencies 
 - run npm install in terminal
### 2. Run the App 
 - in terminal paste: npm run dev
### 3. Paste the Link into your Browser 
 - http://localhost:3000
### 4. OPTIONAL: run the desktop app 
 - npm run app

---

# USAGE GUIDE 
## Teacher Flow

### 1. Click “I’m a Teacher”

### 2. Enter your name and click Create class

### 3. Share the generated class code with students

### 4. Upload your lesson plan in Lesson & Notes

### 5. Click Generate teaching notes

### 6. View and respond to student questions

### 7. Release exercises and analyze responses

### 8. Review exit tickets and student progress

--

## Student Flow

### 1. Click “I’m a Student”

### 2. Enter your name and the class code

### 3. Ask questions in Ask a Question

### 4. Use Check for confusion for suggested rephrasings

### 5 .Click Get AI answer if clarification is needed

### 6. Complete exercises released by the teacher

### 7. Submit an exit ticket at the end of class
