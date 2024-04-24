// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");

app.use(bodyParser.json());

// Route handler
let task = JSON.parse(fs.readFileSync("database.json"));

// lists routes
app.get("/tasks", (req, res) => {
  // get all tasks lists
  try {
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
