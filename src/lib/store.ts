import { v4 as uuid } from "uuid";

export type Role = "teacher" | "student";

export interface ClassSession {
  id: string;
  code: string;
  teacherName: string;
  lessonPlan: string;
  teachingNotes: string;
  curriculumContext: string; // lesson plan + notes for AI context
  createdAt: number;
}

export interface StudentQuestion {
  id: string;
  classId: string;
  studentName: string;
  studentId: string;
  text: string;
  aiSuggestion?: string;
  teacherAnswered?: string;
  aiAnswered?: string; // when teacher didn't respond or student asked for clarification
  createdAt: number;
  resolved: boolean;
}

export interface ReleasedQuestion {
  id: string;
  classId: string;
  index: number;
  text: string;
  releasedAt: number;
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  classId: string;
  studentName: string;
  studentId: string;
  answer: string;
  submittedAt: number;
}

export interface AnswerAnalysis {
  questionId: string;
  questionText: string;
  summary: string;
  analyzedAt: number;
}

export interface ExitTicket {
  id: string;
  classId: string;
  studentName: string;
  studentId: string;
  feedback: string;
  whatLearned: string;
  submittedAt: number;
}

export interface ExitTicketSummary {
  classId: string;
  summary: string;
  suggestionsForNextLesson: string;
  summarizedAt: number;
}

// Use globalThis so in-memory store survives Next.js dev hot reload (avoids "Class not found" after refresh)
const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : ({} as any));
const classes = (g.__classroom_classes ??= new Map<string, ClassSession>()) as Map<string, ClassSession>;
const studentQuestions = (g.__classroom_studentQuestions ??= new Map<string, StudentQuestion>()) as Map<string, StudentQuestion>;
const releasedQuestions = (g.__classroom_releasedQuestions ??= new Map<string, ReleasedQuestion>()) as Map<string, ReleasedQuestion>;
const questionAnswers = (g.__classroom_questionAnswers ??= new Map<string, QuestionAnswer>()) as Map<string, QuestionAnswer>;
const answerAnalyses = (g.__classroom_answerAnalyses ??= new Map<string, AnswerAnalysis>()) as Map<string, AnswerAnalysis>;
const exitTickets = (g.__classroom_exitTickets ??= new Map<string, ExitTicket>()) as Map<string, ExitTicket>;
const exitTicketSummaries = (g.__classroom_exitTicketSummaries ??= new Map<string, ExitTicketSummary>()) as Map<string, ExitTicketSummary>;
const codeToClass = (g.__classroom_codeToClass ??= new Map<string, string>()) as Map<string, string>;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  if (codeToClass.get(code)) return generateCode();
  return code;
}

export function createClass(teacherName: string): ClassSession {
  const id = uuid();
  const code = generateCode();
  codeToClass.set(code, id);
  const session: ClassSession = {
    id,
    code,
    teacherName,
    lessonPlan: "",
    teachingNotes: "",
    curriculumContext: "",
    createdAt: Date.now(),
  };
  classes.set(id, session);
  return session;
}

export function getClassByCode(code: string): ClassSession | undefined {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return undefined;
  const id = codeToClass.get(normalized);
  return id ? classes.get(id) : undefined;
}

export function getClass(id: string): ClassSession | undefined {
  return classes.get(id);
}

export function updateLessonPlan(classId: string, lessonPlan: string): ClassSession | undefined {
  const c = classes.get(classId);
  if (!c) return undefined;
  c.lessonPlan = lessonPlan;
  return c;
}

export function updateTeachingNotes(classId: string, teachingNotes: string, curriculumContext: string): ClassSession | undefined {
  const c = classes.get(classId);
  if (!c) return undefined;
  c.teachingNotes = teachingNotes;
  c.curriculumContext = curriculumContext;
  return c;
}

export function addStudentQuestion(
  classId: string,
  studentName: string,
  studentId: string,
  text: string
): StudentQuestion {
  const q: StudentQuestion = {
    id: uuid(),
    classId,
    studentName,
    studentId,
    text,
    createdAt: Date.now(),
    resolved: false,
  };
  studentQuestions.set(q.id, q);
  return q;
}

export function getStudentQuestionsByClass(classId: string): StudentQuestion[] {
  return Array.from(studentQuestions.values())
    .filter((q) => q.classId === classId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function setQuestionSuggestion(questionId: string, aiSuggestion: string): void {
  const q = studentQuestions.get(questionId);
  if (q) q.aiSuggestion = aiSuggestion;
}

export function setTeacherAnswer(questionId: string, teacherAnswered: string): void {
  const q = studentQuestions.get(questionId);
  if (q) {
    q.teacherAnswered = teacherAnswered;
    q.resolved = true;
  }
}

export function setAiAnswer(questionId: string, aiAnswered: string): void {
  const q = studentQuestions.get(questionId);
  if (q) {
    q.aiAnswered = aiAnswered;
    q.resolved = true;
  }
}

export function getStudentQuestion(questionId: string): StudentQuestion | undefined {
  return studentQuestions.get(questionId);
}

export function releaseQuestion(classId: string, index: number, text: string): ReleasedQuestion {
  const id = uuid();
  const q: ReleasedQuestion = { id, classId, index, text, releasedAt: Date.now() };
  releasedQuestions.set(id, q);
  return q;
}

export function getReleasedQuestions(classId: string): ReleasedQuestion[] {
  return Array.from(releasedQuestions.values())
    .filter((q) => q.classId === classId)
    .sort((a, b) => a.index - b.index);
}

export function getReleasedQuestion(id: string): ReleasedQuestion | undefined {
  return releasedQuestions.get(id);
}

export function submitQuestionAnswer(
  questionId: string,
  classId: string,
  studentName: string,
  studentId: string,
  answer: string
): QuestionAnswer {
  const a: QuestionAnswer = {
    id: uuid(),
    questionId,
    classId,
    studentName,
    studentId,
    answer,
    submittedAt: Date.now(),
  };
  questionAnswers.set(a.id, a);
  return a;
}

export function getAnswersByQuestion(questionId: string): QuestionAnswer[] {
  return Array.from(questionAnswers.values())
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => a.submittedAt - b.submittedAt);
}

export function getAnswersByClass(classId: string): QuestionAnswer[] {
  return Array.from(questionAnswers.values()).filter((a) => a.classId === classId);
}

export function setAnswerAnalysis(questionId: string, questionText: string, summary: string): void {
  answerAnalyses.set(questionId, { questionId, questionText, summary, analyzedAt: Date.now() });
}

export function getAnswerAnalysis(questionId: string): AnswerAnalysis | undefined {
  return answerAnalyses.get(questionId);
}

export function submitExitTicket(
  classId: string,
  studentName: string,
  studentId: string,
  feedback: string,
  whatLearned: string
): ExitTicket {
  const t: ExitTicket = {
    id: uuid(),
    classId,
    studentName,
    studentId,
    feedback,
    whatLearned,
    submittedAt: Date.now(),
  };
  exitTickets.set(t.id, t);
  return t;
}

export function getExitTicketsByClass(classId: string): ExitTicket[] {
  return Array.from(exitTickets.values())
    .filter((t) => t.classId === classId)
    .sort((a, b) => a.submittedAt - b.submittedAt);
}

export function setExitTicketSummary(
  classId: string,
  summary: string,
  suggestionsForNextLesson: string
): void {
  exitTicketSummaries.set(classId, {
    classId,
    summary,
    suggestionsForNextLesson,
    summarizedAt: Date.now(),
  });
}

export function getExitTicketSummary(classId: string): ExitTicketSummary | undefined {
  return exitTicketSummaries.get(classId);
}

// Student progress: questions asked + answers submitted
export function getStudentProgress(classId: string): Map<string, { questions: StudentQuestion[]; answers: QuestionAnswer[] }> {
  const byStudent = new Map<string, { questions: StudentQuestion[]; answers: QuestionAnswer[] }>();
  Array.from(studentQuestions.values()).forEach((q) => {
    if (q.classId !== classId) return;
    const key = q.studentId;
    if (!byStudent.has(key)) byStudent.set(key, { questions: [], answers: [] });
    byStudent.get(key)!.questions.push(q);
  });
  Array.from(questionAnswers.values()).forEach((a) => {
    if (a.classId !== classId) return;
    const key = a.studentId;
    if (!byStudent.has(key)) byStudent.set(key, { questions: [], answers: [] });
    byStudent.get(key)!.answers.push(a);
  });
  return byStudent;
}
