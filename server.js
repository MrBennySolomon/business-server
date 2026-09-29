const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
