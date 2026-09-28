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

app.get("/garage", async (req, res) => {
    res.json("https://6aae754a606bd915d110d395.mockapi.io/api/clients");
});

app.get("/images/garage", (req, res) => {
  res.json(
    "https://users-be4a5-default-rtdb.europe-west1.firebasedatabase.app"
  );
});

app.get("/transport-office", (req, res) => {
  res.json("https://6ab743059b03155d08087808.mockapi.io/api/transport");

app.get("/images/transport-office", (req, res) => {
  res.json(
    "https://test-7b343-default-rtdb.europe-west1.firebasedatabase.app"
  );
});

app.get("/hair-salon", (req, res) => {
  res.json("https://6aae754a606bd915d110d395.mockapi.io/api/salon-clients");
});

app.get("/images/hair-salon", (req, res) => {
  res.json(
    "https://files-e43f6-default-rtdb.europe-west1.firebasedatabase.app/"
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
