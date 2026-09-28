const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server is working!"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
