/**
 * E2E test: full teacher + student flow.
 * - Teacher creates class and gets class code
 * - Student joins with class code
 * - Student asks question → Teacher sees question and AI suggestion
 * - Teacher releases question → Student answers → Teacher sees answers and can analyze
 * - Student submits exit ticket → Teacher sees exit tickets and can summarize
 *
 * Run: npm run test:e2e
 * (Starts the dev server automatically if not running.)
 *
 * Requires GEMINI_API_KEY in .env.local for AI steps (teaching notes, suggestions, analysis).
 */

import { test, expect } from "@playwright/test";

const TEACHER_NAME = "Test Teacher";
const STUDENT_NAME = "Test Student";
const LESSON_PLAN =
  "Today we cover photosynthesis: light reactions, Calvin cycle, and how plants make glucose.";
const STUDENT_QUESTION = "What is the main product of the Calvin cycle?";
const RELEASED_QUESTION =
  "Name one input and one output of the light reactions.";
const STUDENT_ANSWER = "Input: light and water. Output: ATP and NADPH.";
const EXIT_FEEDBACK = "The diagrams helped a lot.";
const EXIT_LEARNED = "How the Calvin cycle uses ATP and NADPH.";

test.describe("Classroom AI — Teacher & Student flow", () => {
  test("full flow: create class, join, Q&A, released question, exit ticket", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const teacherPage = await context.newPage();
    const studentPage = await context.newPage();

    try {
      // ----- TEACHER: Create class -----
      await teacherPage.goto("/");
      await teacherPage.getByRole("button", { name: /i'm a teacher/i }).click();
      await teacherPage.getByPlaceholder(/your name/i).fill(TEACHER_NAME);
      await teacherPage.getByRole("button", { name: /create class/i }).click();

      await teacherPage.waitForURL(/\/teacher\?/);
      const teacherUrl = teacherPage.url();
      const codeMatch = teacherUrl.match(/code=([^&]+)/);
      const classCode = codeMatch ? decodeURIComponent(codeMatch[1]) : "";
      expect(classCode.length).toBeGreaterThan(0);

      // ----- TEACHER: Upload lesson plan and get teaching notes (already on Lesson & notes tab) -----
      await teacherPage
        .getByPlaceholder(/e\.g\. today we cover|quadratic|plan for the day/i)
        .fill(LESSON_PLAN);
      await teacherPage
        .getByRole("button", { name: /generate teaching notes/i })
        .click();
      await teacherPage.waitForTimeout(4000);
      await expect(
        teacherPage.getByText(/teaching notes|from Gemini|key points/i)
      ).toBeVisible({ timeout: 20000 });

      // ----- STUDENT: Join class -----
      await studentPage.goto("/");
      await studentPage.getByRole("button", { name: /i'm a student/i }).click();
      await studentPage
        .getByPlaceholder(/class code/i)
        .fill(classCode);
      await studentPage.getByPlaceholder(/your name/i).first().fill(STUDENT_NAME);
      await studentPage.getByRole("button", { name: /join class/i }).click();

      await studentPage.waitForURL(/\/student\?/);

      // ----- STUDENT: Ask a question (Ask a question tab is default) -----
      await studentPage
        .getByPlaceholder(/type your question/i)
        .fill(STUDENT_QUESTION);
      await studentPage.getByRole("button", { name: /send to teacher/i }).click();
      await studentPage.waitForTimeout(3000);

      // ----- TEACHER: See student question and AI suggestion -----
      await teacherPage.getByRole("button", { name: /student questions/i }).click();
      await teacherPage.waitForTimeout(3000);
      await expect(teacherPage.getByText(STUDENT_QUESTION)).toBeVisible({
        timeout: 10000,
      });
      await expect(
        teacherPage.getByText(/suggested answer|Suggested answer \(AI\)/i)
      ).toBeVisible({ timeout: 15000 });

      // ----- TEACHER: Release a question -----
      await teacherPage
        .getByRole("button", { name: /exercises & analysis/i })
        .click();
      await teacherPage
        .getByPlaceholder(/e\.g\. solve for x/i)
        .fill(RELEASED_QUESTION);
      await teacherPage.getByRole("button", { name: /release question/i }).click();
      await teacherPage.waitForTimeout(1500);

      // ----- STUDENT: Answer the released question -----
      await studentPage.getByRole("button", { name: /exercises/i }).click();
      await studentPage.waitForTimeout(2500);
      await expect(studentPage.getByText(RELEASED_QUESTION)).toBeVisible({
        timeout: 8000,
      });
      await studentPage.getByPlaceholder(/your answer/i).fill(STUDENT_ANSWER);
      await studentPage.getByRole("button", { name: /submit answer/i }).first().click();
      await studentPage.waitForTimeout(1500);

      // ----- TEACHER: See submitted answer and run analysis -----
      await teacherPage
        .getByRole("button", { name: /exercises & analysis/i })
        .click();
      await teacherPage.waitForTimeout(2500);
      await expect(teacherPage.getByText(STUDENT_ANSWER)).toBeVisible({
        timeout: 8000,
      });
      await teacherPage
        .getByRole("button", { name: /analyze with ai/i })
        .first()
        .click();
      await teacherPage.waitForTimeout(6000);
      await expect(
        teacherPage.getByText(/AI summary|where students|common mistakes|doing well/i)
      ).toBeVisible({ timeout: 20000 });

      // ----- STUDENT: Submit exit ticket -----
      await studentPage.getByRole("button", { name: /exit ticket/i }).click();
      await studentPage
        .getByPlaceholder(/e\.g\. the examples|feedback|what was clear/i)
        .first()
        .fill(EXIT_FEEDBACK);
      await studentPage
        .getByPlaceholder(/e\.g\. how to solve|what i learned/i)
        .fill(EXIT_LEARNED);
      await studentPage
        .getByRole("button", { name: /submit exit ticket/i })
        .click();
      await expect(
        studentPage.getByText(/thanks|submitted|feedback was submitted/i)
      ).toBeVisible({ timeout: 8000 });

      // ----- TEACHER: See exit ticket and summarize -----
      await teacherPage.getByRole("button", { name: /exit tickets/i }).click();
      await teacherPage.waitForTimeout(2500);
      await expect(teacherPage.getByText(EXIT_FEEDBACK)).toBeVisible({
        timeout: 8000,
      });
      await teacherPage
        .getByRole("button", { name: /summarize & get suggestions/i })
        .click();
      await teacherPage.waitForTimeout(6000);
      await expect(
        teacherPage.getByText(/summary|suggestions for next lesson/i)
      ).toBeVisible({ timeout: 20000 });

      // ----- TEACHER: Student progress -----
      await teacherPage
        .getByRole("button", { name: /student progress/i })
        .click();
      await teacherPage.waitForTimeout(1500);
      await expect(teacherPage.getByText(STUDENT_NAME)).toBeVisible({
        timeout: 8000,
      });
    } finally {
      await context.close();
    }
  });
});
