// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");



app.use(bodyParser.json());

// Route handler
let task = JSON.parse(fs.readFileSync("database.json"));

// validate the task list
const validateTask = (req, res, next) => {
  if (!req.body.tittle || !req.body.description || !req.body.status) {
    return res.status(400).send("Invalid task list");
  }
  next();
};

const pool = require("./db");

// get all todo
app.get("/tasks", (req, res) => {
  let sql = "SELECT * FROM tasks";
 
  pool.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(result);
  });
});

app.post("/tasks", validateTask, (req, res) => {
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
    res.status(201).send(task).json(task);
  } catch (err) {
    res.status(500).send(err).json({ message: "Task cannot be created" });
  }
});

app.put("/tasks/:id", validateTask, (req, res) => {
  // update a task list
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    const taskIndex = task.findIndex((data) => data.id === taskId);

    if (taskIndex !== -1) {
      task[taskIndex] = { ...task[taskIndex], ...updatedTask };
      res.status(200).json(task[taskIndex]);
    } else {
        res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/tasks/:id", (req, res) => {
  // update a task list using patch method
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    const taskIndex = task.findIndex((data) => data.id === taskId);

    if (taskIndex !== -1) {
      task[taskIndex] = { ...task[taskIndex], ...updatedTask };
      res.status(200).json(task[taskIndex]);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/tasks/:id", (req, res) => {
  // delete a task list
   try {
     const taskId = parseInt(req.params.id);
     const taskIndex = task.findIndex((data) => data.id === taskId);

     if (taskIndex !== -1) {
       task.splice(taskIndex, 1);
       res.status(204).send();
     } else {
       res.status(404).json({ message: "Task not found" });
     }
   } catch (error) {
     res.status(500).json({ message: "Internal server error" });
   }
});


// task sort by id
app.get('/tasks/sortById', (req, res) => {
    try {
        const sortedTask = task.sort((a, b) => a.id - b.id);
        res.status(200).json(sortedTask);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// task sort by tittle
app.get('/tasks/sortByTittle', (req, res) => {
    try {
        const sortedTask = task.sort((a, b) => a.tittle.localeCompare(b.tittle));
        res.status(200).json(sortedTask);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// task sort by status rank between those three status (todo, in-progress, completed) where todo is the highest rank and completed is the lowest rank
app.get('/tasks/sortByStatus', (req, res) => {
    try {
        const sortedTask = task.sort((a, b) => {
            const statusRank = {
                'todo': 1,
                'in-progress': 2,
                'completed': 3
            };
            return statusRank[a.status] - statusRank[b.status];
        });
        res.status(200).json(sortedTask);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// task serach by tittle, description, status, and id
app.get('/tasks/search', (req, res) => {
    try {
        const searchQuery = req.query.q;
        const searchResult = task.filter(data => {
            return data.tittle.includes(searchQuery) || data.description.includes(searchQuery) || data.status.includes(searchQuery) || data.id.toString().includes(searchQuery);
        });
        res.status(200).json(searchResult);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
