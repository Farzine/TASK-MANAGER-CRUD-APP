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

app.post("/tasks", (req, res) => {
  // create a new task list
  try {
    const newTask = {
      id: task.length + 1,
      tittle: req.body.tittle,
      description: req.body.description,
      status: req.body.status,
    };
    task.push(newTask);
    fs.writeFileSync("database.json", JSON.stringify(task));
    res.status(201).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put("/tasks/:id", (req, res) => {
    // update a task list
    try {
        const id = req.params.id;
        const updateTask = {
        id: id,
        tittle: req.body.tittle,
        description: req.body.description,
        status: req.body.status,
        };
        task[id - 1] = updateTask;
        fs.writeFileSync("database.json", JSON.stringify(task));
        res.status(200).send(task);
    } catch (err) {
        res.status(500).send(err);
    }
    });

    

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
