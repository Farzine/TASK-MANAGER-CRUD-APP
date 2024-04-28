const express = require("express");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { check, validationResult } = require("express-validator");

// get all users
// http://localhost:3000/
router.get("/", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(result);
  });
});


// Register a new user
// http://localhost:3000/register
/* request body =
{
   
    "email": "def@gmail.com",
    "password": "678910",
    "name": "Hossen",
    "role": "developer"
}
*/
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      // Check if user exists
      let user = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (user.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into database
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );

      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  

  try {
    // Check if user exists
    const result = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = result[2];
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // user = user[0];


    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.user_id,
      },
    };
    
    jwt.sign(payload, "mytoken", { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user
router.put("/:userid", (req, res) => {
  const { name, email, password, role } = req.body;
  const userId = req.params.user_id;
  db.query(
    "UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE user_id = ?",
    [name, email, password, role, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json({ message: "User updated successfully" });
    }
  );
});

// Delete a user
router.delete("/:userid", (req, res) => {
  const userId = req.params.user_id;
  db.query("DELETE FROM users WHERE user_id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;
