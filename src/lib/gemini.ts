import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set; AI features will fail.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Model: set GEMINI_MODEL in .env.local to override. Default: gemini-2.5-flash (separate quota from 2.0-flash).
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** Call generateContent. On 429 we fail fast so the UI shows the error instead of hanging. */
async function generateWithRetry(
  model: Awaited<ReturnType<GoogleGenerativeAI["getGenerativeModel"]>>,
  prompt: string
): Promise<Awaited<ReturnType<typeof model.generateContent>>["response"]> {
  const result = await model.generateContent(prompt);
  return result.response;
}

const FORMAT_INSTRUCTIONS = `Format your response in Markdown:
- Use ## for section headers and ### for subheaders (bold, clear).
- Use **bold** for key terms and titles; keep body text regular (not bold).
- For any math, use LaTeX: inline math in \\( \\) e.g. \\( x^2 + 5 = 0 \\), display math in \\[ \\] e.g. \\[ \\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6} \\. \\)
- Use bullet lists where helpful.`;

export async function generateTeachingNotes(lessonPlan: string): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY to generate teaching notes.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `You are an expert teacher coach. Given this lesson plan for the day, produce concise teaching notes with clear sections: key points to emphasize, common student misconceptions to address, suggested pacing, and 2-3 discussion prompts. Keep it practical and scannable.\n\n${FORMAT_INSTRUCTIONS}\n\nLesson plan:\n${lessonPlan}`
  );
  return response.text() || "No notes generated.";
}

export async function suggestAnswerToStudentQuestion(
  question: string,
  curriculumContext: string
): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY for answer suggestions.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `You are helping a teacher answer a student question in class. Use only the curriculum and teaching context below. Give a clear, concise suggested answer the teacher can use, plus one short example if helpful. Do not mention that you are an AI.\n\n${FORMAT_INSTRUCTIONS}\n\nCurriculum/notes context:\n${curriculumContext}\n\nStudent question:\n${question}`
  );
  return response.text() || "No suggestion.";
}

export async function answerStudentAsAI(
  question: string,
  curriculumContext: string
): Promise<string> {
  if (!genAI) return "I can't answer right now. Please ask your teacher.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `You are a helpful in-class assistant. A student asked the following. Answer based only on the curriculum and notes below. Be clear, friendly, and concise. Give a direct answer and one brief example if useful. Use the same formatting as teaching notes: headers, bold for key terms, LaTeX for math.\n\n${FORMAT_INSTRUCTIONS}\n\nCurriculum/notes:\n${curriculumContext}\n\nStudent question:\n${question}`
  );
  return response.text() || "I don't have an answer for that. Ask your teacher.";
}

export async function teacherChat(
  userMessage: string,
  curriculumContext: string
): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY to use the chat.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `You are a teaching assistant. The teacher is asking for clarification. Base your answer strictly on the curriculum and notes below. Be concise and practical.\n\n${FORMAT_INSTRUCTIONS}\n\nCurriculum/notes:\n${curriculumContext}\n\nTeacher question:\n${userMessage}`
  );
  return response.text() || "No response.";
}

export async function analyzeStudentAnswers(
  questionText: string,
  answers: { studentName: string; answer: string }[]
): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY to analyze answers.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const answersBlock = answers
    .map((a) => `Student: ${a.studentName}\nAnswer: ${a.answer}`)
    .join("\n\n");
  const response = await generateWithRetry(
    model,
    `Analyze these student answers to the following question. Summarize with clear sections: (1) **What students did well**, (2) **Common mistakes or misconceptions**, (3) **Suggestions for review**. Use headers, bold for section titles, and LaTeX for any math. Be brief and actionable.\n\n${FORMAT_INSTRUCTIONS}\n\nQuestion: ${questionText}\n\nAnswers:\n${answersBlock}`
  );
  return response.text() || "No analysis.";
}

export async function summarizeExitTickets(
  feedbacks: { studentName: string; feedback: string }[]
): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY to summarize exit tickets.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const block = feedbacks
    .map((f) => `Student: ${f.studentName}\nFeedback: ${f.feedback}`)
    .join("\n\n");
  const response = await generateWithRetry(
    model,
    `Summarize this exit ticket feedback from students. Give: (1) main themes—what they learned well, (2) what was confusing or could be improved, (3) 2-3 specific suggestions for the next lesson. Be concise. Use Markdown with ## headers and **bold** for section titles.\n\n${FORMAT_INSTRUCTIONS}\n\n${block}`
  );
  return response.text() || "No summary.";
}

export async function suggestNextLessonFromFeedback(summary: string): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY for suggestions.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `Based on this exit ticket summary from your class, give the teacher 2-3 concrete suggestions for the next lesson: what to reinforce, what to clarify, and one engagement idea. Be brief.\n\nSummary:\n${summary}`
  );
  return response.text() || "No suggestions.";
}

export async function summarizeKidConcerns(
  questions: { studentName: string; text: string }[],
  exitTickets: { studentName: string; feedback: string; whatLearned: string }[]
): Promise<string> {
  if (!genAI) return "Set GEMINI_API_KEY to summarize kid concerns.";
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const qBlock = questions.length
    ? "**Student questions:**\n" + questions.map((q) => `${q.studentName}: ${q.text}`).join("\n")
    : "";
  const eBlock = exitTickets.length
    ? "**Exit ticket feedback:**\n" +
      exitTickets.map((e) => `${e.studentName}: ${e.feedback} | Learned: ${e.whatLearned}`).join("\n")
    : "";
  const response = await generateWithRetry(
    model,
    `At the end of the lesson, summarize "These were the kid concerns" based on: (1) all student questions asked during class, (2) all exit ticket feedback. Use clear headers (e.g. ## Student Questions, ## Exit Ticket Feedback, ## Summary of Concerns). Use **bold** for section titles. Be concise and actionable so the teacher knows what to address next.\n\n${FORMAT_INSTRUCTIONS}\n\n${qBlock}\n\n${eBlock}`
  );
  return response.text() || "No summary.";
}

export async function detectConfusionAndRephrase(
  text: string,
  curriculumContext: string
): Promise<{ confusionDetected: boolean; suggestedRephrases: string[]; explanation?: string }> {
  if (!genAI) {
    return { confusionDetected: false, suggestedRephrases: [] };
  }
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const response = await generateWithRetry(
    model,
    `Consider this as possible student input (question or comment). Using the curriculum context, determine if it suggests confusion (repeated confusion phrases, misunderstood keywords). Reply in this exact JSON format only, no other text: {"confusionDetected": true or false, "suggestedRephrases": ["rephrase 1", "rephrase 2", "rephrase 3"], "explanation": "brief explanation if confusion"}. If no confusion, suggestedRephrases can be empty and explanation optional.\n\nCurriculum:\n${curriculumContext}\n\nStudent text:\n${text}`
  );
  const raw = response.text() || "{}";
  try {
    const parsed = JSON.parse(raw.replace(/```json?\s*|\s*```/g, "").trim());
    return {
      confusionDetected: !!parsed.confusionDetected,
      suggestedRephrases: Array.isArray(parsed.suggestedRephrases) ? parsed.suggestedRephrases : [],
      explanation: parsed.explanation,
    };
  } catch {
    return { confusionDetected: false, suggestedRephrases: [] };
  }
}
