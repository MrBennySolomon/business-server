const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.get("/garage", (req, res) => {
  res.json({
    message: "https://6aae754a606bd915d110d395.mockapi.io/api/clients"
  });
});

app.get("/transport-office", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.get("/hair-salon", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.get("/images", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
