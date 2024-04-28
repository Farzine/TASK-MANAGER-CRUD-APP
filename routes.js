const express = require("express");
const db = require("./db");

const router = express.Router();

//get all tasks
// http://localhost:3000/tasks
router.get("/tasks", (req, res) => {
    const sql = "SELECT * FROM tasks";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching tasks:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(result);
        }
    );
});


// get tasks by id
// http://localhost:3000/tasks/0
router.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const sql = "SELECT * FROM tasks WHERE id = ?";
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error("Error fetching task:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(result[0]);
  });
});


// Insert task into "tasks" table
/*
request body = 
{
    "user_id": 2,
    "title": "mutu korte hobe",
    "status": "onk chap",
    "description": "hall a jeye krte hbe",
}
*/
router.post("/tasks", (req, res) => {
  // Extract task data from request body
  const { user_id, title, description, status } = req.body;

  const insertTaskQuery =
    "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)";
  db.query(
    insertTaskQuery,
    [user_id, title, description, status],
    (err, result) => {
      if (err) {
        console.error("Error adding task:", err);
        res.status(500).json({ error: "Failed to add task" });
      } else {
        console.log("Task added successfully:", result);
        res.status(201).json({ message: "Task added successfully" });
      }
    }
  );
});



// Update task by id
/*
request body =
{
    "title": "mutu kora ses",
    "status": "done",
    "description": "santi"
}
*/
router.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const { title, description, status } = req.body;
  const sql =
    "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?";
  db.query(
    sql,
    [title, description, status || "pending", taskId],
    (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({
        id: taskId,
        title,
        description,
        status: status || "pending",
      });
    }
  );
});

// Delete task by id
// http://localhost:3000/tasks/0
router.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const sql = "DELETE FROM tasks WHERE id = ?";
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.sendStatus(204);
  });
});


// sort tasks by status, sortBy, search
router.get("/tasks", (req, res) => {
  let sql = "SELECT * FROM tasks";
  const { status, sortBy, search } = req.query;
  let conditions = [];

  //http://localhost:3000/tasks?status=complete
  if (status) {
    sql += ` WHERE status = '${status}'`;
  }

  //http://localhost:3000/tasks?sortBy=title
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }

  //http://localhost:3000/tasks?search=porte
  if (search) {
    const searchQuery = `%${search}%`;
    conditions.push(
      `(title LIKE '${searchQuery}' OR description LIKE '${searchQuery}')`
    );
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(result);
  });
});

// GET /tasks?userid=123&status=completed&sortBy=title&search=meeting
router.get("/usertasks", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  let sql = "SELECT * FROM tasks WHERE user_id = ?";
  const { status, sortBy, search } = req.query;
  const params = [userId];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (search) {
    const searchQuery = `%${search}%`;
    sql += " AND (title LIKE ? OR description LIKE ?)";
    params.push(searchQuery, searchQuery);
  }

  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error fetching tasks:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(result);
  });
});

module.exports = router;
