const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const BCRYPT_ROUNDS = 10;

// אימיילים שיקבלו הרשאת admin בעת הרשמה (ב-.env, מופרדים בפסיק): ADMIN_EMAILS=me@example.com
const isAdminEmail = (email) =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email);

// hash מדומה – כדי שזמן התגובה של login לא יחשוף אם האימייל קיים
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name) return res.status(400).json({ message: "יש להזין שם" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "כתובת אימייל לא תקינה" });
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ message: `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD} תווים` });
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: isAdminEmail(email) ? "admin" : "user"
    });
    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "כתובת האימייל כבר רשומה" });
    }
    throw err; // Express 5 מעביר שגיאות async למטפל השגיאות
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !ok) {
    return res.status(401).json({ message: "אימייל או סיסמה שגויים" });
  }

  res.json({ token: signToken(user.id), user });
});

// GET /api/auth/me  (מוגן)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ message: "המשתמש לא נמצא" });
  res.json({ user });
});

module.exports = router;
