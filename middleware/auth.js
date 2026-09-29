const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment variables");
  return secret;
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn: "7d" });
}

// Middleware: דורש header מהצורה  Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "נדרשת התחברות" });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "החיבור פג תוקף, יש להתחבר מחדש" });
  }
}

// Middleware: דורש משתמש עם role = admin (להוסיף אחרי requireAuth)
async function requireAdmin(req, res, next) {
  const user = await User.findById(req.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "אין הרשאה" });
  }
  next();
}

module.exports = { signToken, requireAuth, requireAdmin };
