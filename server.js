const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const app = express();
app.use(express.json());

// Initialize GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
let GITHUB_REPO = "";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH;
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use("/api/auth", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ message: "שגיאת חיבור למסד הנתונים" });
  }
});
app.use("/api/auth", authRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "שגיאת שרת" });
});

app.get("/", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.get("/garage", async (req, res) => {
    res.json("https://6aae754a606bd915d110d395.mockapi.io/api/clients");
});

app.get("/transport-office", (req, res) => {
  res.json("https://6ab743059b03155d08087808.mockapi.io/api/transport");
});

app.get("/hair-salon", (req, res) => {
  res.json("https://6aae754a606bd915d110d395.mockapi.io/api/salon-clients");
});

app.post("/upload/garage", (req, res) => { 
  GITHUB_REPO = "garage";
  saveConfigToGithub(req, res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const ALLOWED_FILES = new Set(["siteConfig.js"]);
const API = "https://api.github.com";

const ghHeaders = () => ({
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
  "User-Agent": "site-config-editor"
});

const contentsUrl = () =>
  `${API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH.split(
    "/"
  )
    .map(encodeURIComponent)
    .join("/")}`;

// מחזיר את ה-sha של הקובץ הקיים בענף, או null אם הקובץ עדיין לא קיים
async function getCurrentSha() {
  const res = await fetch(
    `${contentsUrl()}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
    {
      headers: ghHeaders()
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub GET failed (${res.status})`);
  }
  const data = await res.json();
  return data.sha;
}

async function putFile(content, sha) {
  const body = {
    message: "עדכון siteConfig.js מעורך האתר",
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha; // חובה כשמעדכנים קובץ קיים

  return fetch(contentsUrl(), {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body)
  });
}
// ---------- הפונקציה שמקבלת את הבקשה ומעדכנת את הקובץ ב-GitHub ----------
async function saveConfigToGithub(req, res) {

  try {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({ error: "חסרה הגדרת GitHub בשרת (.env)" });
    }

    const { filename, content, repo } = req.body || {};

    if (typeof filename !== "string" || typeof content !== "string") {
      return res.status(400).json({ error: "filename ו-content הם שדות חובה" });
    }
    // if (path.basename(filename) !== filename || !ALLOWED_FILES.has(filename)) {
    //   return res.status(400).json({ error: "שם קובץ לא מורשה" });
    // }
    if (!content.includes("export default siteConfig")) {
      return res.status(400).json({ error: "תוכן הקובץ לא תקין" });
    }

    // ניסיון ראשון, ואם יש התנגשות (409/422) משום שמישהו עדכן בינתיים, מביאים sha חדש ומנסים שוב פעם אחת
    let sha = await getCurrentSha();
    let ghRes = await putFile(content, sha);

    if (ghRes.status === 409 || ghRes.status === 422) {
      sha = await getCurrentSha();
      ghRes = await putFile(content, sha);
    }

    const data = await ghRes.json().catch(() => ({}));

    if (!ghRes.ok) {
      console.error("GitHub error:", ghRes.status, data);
      return res
        .status(502)
        .json({ error: `GitHub: ${data.message || ghRes.status}` });
    }

    return res.json({
      ok: true,
      commit: data.commit?.sha,
      url: data.commit?.html_url
    });
  } catch (error) {
    console.error("Save to GitHub error:", error);
    return res.status(500).json({ error: "שגיאה בעדכון הקובץ ב-GitHub" });
  }
}

module.exports = app;
