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

// Login Endpoint
// http://localhost:3000/login
/* request body =
{  
    "email": "abc@gmail.com",
    "password": "123456"
}
*/
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Fetch user from database by email
  await db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = results[0];
      console.log(user.password);

      // Check if password is correct
      const isMatch = bcrypt.compare(password, user.password);
      console.log(password);
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
    }
  );
});

// Update a user
// http://localhost:3000/userid
/* request body =
{
    "name": "Hossen",
    "email": "dfh@gmail.com"
    "password": "678910",
    "role": "developer"
}
*/
router.put("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const { name, email, password, role } = req.body;

  // Check if user ID is provided
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  // Fetch user from database by ID
  db.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId],
    (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = results[0];
   

      // Update user data
      const updatedUser = {
        name: name || user.name,
        email: email || user.email,
        password: password ? bcrypt.hashSync(password, 10) : user.password, // Hash new password if provided
        role: role || user.role,
      };

      // Update user in the database
      db.query(
        "UPDATE users SET ? WHERE user_id = ?",
        [updatedUser, userId],
        (err, result) => {
          if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          res.json({ message: "User updated successfully" });
        }
      );
    }
  );
});




// Delete a user
router.delete("/:user_id", (req, res) => {
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
