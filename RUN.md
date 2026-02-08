# Exact steps to run Classroom AI (from the beginning)

Do these in order. Copy and paste the commands.

---

## 1. Open Terminal

On Mac: press **Cmd + Space**, type **Terminal**, press Enter.

---

## 2. Go to the project folder

Paste this and press Enter:

```bash
cd /Users/aleenamudassar/Desktop/GDG
```

---

## 3. Install dependencies (first time only)

Paste this and press Enter. Wait until it finishes.

```bash
npm install
```

---

## 4. Get a Gemini API key (first time only)

1. Open this link in your browser: **https://aistudio.google.com/apikey**
2. Sign in with your **Google account**.
3. Click **Create API key**.
   - If asked, choose **Create API key in new project** (gives you fresh free-tier quota).
   - If you already have a project, you can use it.
4. **Copy the key** (it looks like `AIzaSy...`). Paste it somewhere safe.
5. **No credit card needed** for the free tier. The app uses **gemini-2.5-flash-lite**, which has free limits (about 15 requests per minute, 1,000 per day).

---

## 5. Create the environment file with your key (first time only)

1. In the **same project folder** (`GDG`), create a new file named exactly: **`.env.local`**
   - In Cursor/VS Code: right-click the `GDG` folder → New File → name it `.env.local`
   - Or in Terminal (from step 2 folder): run:
     ```bash
     echo "GEMINI_API_KEY=PASTE_YOUR_KEY_HERE" > .env.local
     ```
     Then open `.env.local` and replace `PASTE_YOUR_KEY_HERE` with your real key.

2. The file must contain exactly one line (no spaces around the `=`):
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```

3. Save the file.

---

## 6. Start the app

In Terminal (in the `GDG` folder), run:

```bash
npm run dev
```

Wait until you see something like:

```
▲ Next.js 14.2.35
- Local: http://localhost:3000
```

Leave this terminal open. Do not close it.

---

## 7. Open the app in your browser

1. Open your browser (Chrome, Safari, etc.).
2. In the address bar type: **http://localhost:3000**
3. Press Enter.

You should see the Classroom AI home page with **I'm a Teacher** and **I'm a Student**.

---

## 8. (Optional) Run as a desktop app instead of the browser

1. Keep the terminal from step 6 running (`npm run dev`).
2. Open a **second** Terminal window.
3. Run:
   ```bash
   cd /Users/aleenamudassar/Desktop/GDG
   npm run app
   ```
4. A separate app window will open. Use that instead of the browser.

---

## Quick test

1. On the home page, click **I'm a Teacher**.
2. Type your name and click **Create class**.
3. You’ll get a **class code** (e.g. `ABC123`). Copy it.
4. Open a **new browser tab**, go to **http://localhost:3000**.
5. Click **I'm a Student**, paste the code, type a name, click **Join class**.
6. In the Student tab: type a question and click **Send to teacher**.
7. In the Teacher tab: click **Student questions** — you should see the question and an AI suggestion.

---

## If something goes wrong

- **"command not found: npm"**  
  Install Node.js: https://nodejs.org — download the LTS version and install it. Then run the steps again from step 2.

- **Teaching notes don’t generate**  
  Make sure `.env.local` exists in the `GDG` folder with `GEMINI_API_KEY=your_key`. Then stop the app (Ctrl+C in the terminal) and run `npm run dev` again.

- **"Class not found" when joining**  
  Create the class as Teacher first. Copy the class code exactly (no extra spaces). Try again.

- **Port 3000 already in use**  
  Something else is using port 3000. Stop that program, or run:  
  `npm run dev -- -p 3001`  
  Then open **http://localhost:3001** instead.

- **Error: Cannot find module '.next/server/app/page.js' or no app appears**  
  The build cache is corrupted. Do this:
  1. Stop the app (Ctrl+C in the terminal where `npm run dev` is running).
  2. In Terminal, from the GDG folder, run: **`rm -rf .next`**
  3. Run **`npm run dev`** again and wait until you see "Local: http://localhost:3000".
  4. Open **http://localhost:3000** in your browser.

- **429 Too Many Requests / "You exceeded your current quota" / "limit: 0"**  
  Your free-tier quota for that model is used up or not available. The app now uses **gemini-2.5-flash-lite** (free tier: ~15 requests/min, 1,000/day).  
  1. **Restart the app** (Ctrl+C, then `npm run dev`) so it uses the new model.  
  2. If it still fails, get a **new API key** from **https://aistudio.google.com/apikey** and choose **Create API key in new project** for fresh quota. Put the new key in `.env.local` and restart.  
  3. Check usage: **https://aistudio.google.com/usage** (sign in with the same Google account).  
  4. Free tier resets at **midnight Pacific Time**. If you hit the daily limit, wait until the next day or use a new project/key.
