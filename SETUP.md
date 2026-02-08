# Step-by-Step: How to Run Classroom AI

## Step 1: Open the project folder

In your terminal, go to the project:

```bash
cd /Users/aleenamudassar/Desktop/GDG
```

---

## Step 2: Get a Gemini API key

1. Open your browser and go to: **https://aistudio.google.com/apikey**
2. Sign in with your Google account if prompted.
3. Click **“Create API key”** (or “Get API key”).
4. Choose **“Create API key in new project”** (or pick an existing project).
5. Copy the key. It looks like: `AIzaSy...` (long string).

Keep this key somewhere safe — you’ll paste it in the next step.

---

## Step 3: Create the environment file with your key

1. In the project folder `GDG`, create a new file named **exactly**: `.env.local`  
   (The name starts with a dot.)

2. Open `.env.local` in any text editor and paste this line, then replace `YOUR_KEY_HERE` with your actual Gemini key:

   ```
   GEMINI_API_KEY=YOUR_KEY_HERE
   ```

   **Example** (with a fake key):

   ```
   GEMINI_API_KEY=AIzaSyB1234567890abcdefghijklmnopqrstuvwxyz
   ```

3. Save the file.  
   Make sure there are no spaces around the `=` and no quotes around the key unless the key itself contains spaces (it usually doesn’t).

---

## Step 4: Install dependencies

In the same terminal (still in the `GDG` folder), run:

```bash
npm install
```

Wait until it finishes (you should see something like “added 387 packages”).

---

## Step 5: Start the app

Run:

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 14.2.18
- Local:        http://localhost:3000
```

---

## Step 6: Open the app

**Option A — In your browser**  
Open **http://localhost:3000** in your browser.

**Option B — As a desktop app**  
In a new terminal (keep `npm run dev` running), run: `npm run app`  
This opens Classroom AI in its own window (Electron app).

**Teaching notes not generating?**  
Add **GEMINI_API_KEY** to `.env.local` (see Step 2–3), then restart the dev server.

You should see the home page with “I’m a Teacher” and “I’m a Student”.

---

## Quick test

1. Click **“I’m a Teacher”** → enter your name → **Create class**.
2. You’ll get a **class code** (e.g. `ABC123`). Copy it.
3. Open a **new browser tab** (or another browser/device) and go to **http://localhost:3000**.
4. Click **“I’m a Student”** → paste the class code → enter a name → **Join class**.
5. In the student tab: type a question and click **Send to teacher**.
6. In the teacher tab: go to **Student questions** — you should see the question and an AI-suggested answer.

---

## Install on iPad (use as an app)

The site is a **Progressive Web App (PWA)**. On iPad you can add it to the Home Screen so it opens full screen like an app.

1. **Get the app URL on your iPad**
   - If the app is **running on your computer**: find your computer’s IP (e.g. System Settings → Network). On iPad, open Safari and go to **http://YOUR_COMPUTER_IP:3000** (same Wi‑Fi as the computer).
   - If the app is **deployed** (e.g. Vercel): open Safari on iPad and go to your app URL (e.g. `https://your-app.vercel.app`).

2. **Add to Home Screen**
   - In Safari, tap the **Share** button (square with arrow).
   - Tap **“Add to Home Screen”**.
   - Edit the name if you want (e.g. “Classroom AI”), then tap **Add**.

3. **Open the app**
   - Tap the new icon on the Home Screen. The app opens full screen without the browser bar.

---

## iPad simulation on your laptop

1. Start the app: `npm run dev`, then open **http://localhost:3000**.
2. Go to **http://localhost:3000/demo** (or click “Open iPad simulation (demo) →” on the home page).
3. You’ll see **two iPad-style frames** side by side (Teacher and Student).
4. **Left iPad:** Click “I’m a Teacher” → enter your name → **Create class**. Copy the **class code** shown.
5. **Top bar:** Paste the class code and a student name, then click **“Open student join with this code”** so the right iPad opens the join form with the code and name pre-filled.
6. **Right iPad:** Click **Join class**.
7. Use both “iPads” as normal: student asks questions, teacher sees them and gets AI suggestions; teacher releases questions, student answers; student submits exit ticket, teacher summarizes. Everything works the same as in full-screen.

---

## Run the full flow test (teacher + student)

An automated test runs the full flow: teacher creates class, student joins, Q&A, released question, exit ticket.

1. Make sure `.env.local` has `GEMINI_API_KEY` (needed for teaching notes and AI analysis).
2. Install Playwright browsers once:  
   `npx playwright install chromium`
3. **Start the app in one terminal:**  
   `npm run dev`  
   Wait until you see “Local: http://localhost:3000”.
4. **In another terminal, run the test:**  
   `npm run test:e2e`  
   (The test will use the already-running server.)

The test opens two browser windows (teacher and student), runs through all features, and checks that the teacher sees student questions, answers, and exit tickets. It can take 1–2 minutes because of AI calls. If the test times out when starting the server (e.g. “too many open files”), always start `npm run dev` first, then run the test.

---

## If something goes wrong

- **“GEMINI_API_KEY not set”** or AI doesn’t respond  
  → Check that `.env.local` exists in the `GDG` folder, has the line `GEMINI_API_KEY=your_key`, and that you **restarted** the dev server (`Ctrl+C`, then `npm run dev` again).

- **“Class not found”** when joining  
  → Teacher must create the class first. Use the exact class code (case may matter — try uppercase).

- **Port 3000 already in use**  
  → Either close the other app using port 3000, or run: `npm run dev -- -p 3001` and open **http://localhost:3001** instead.

- **`npm install` or `npm run dev` not found**  
  → Install Node.js from https://nodejs.org (LTS version), then try again.
