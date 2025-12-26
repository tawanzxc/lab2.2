const express = require("express");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

// Home
app.get("/", (req, res) => {
  res.send("Welcome to the Student API (SQL Version)");
});

// GET all students
app.get("/api/student", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET student by id
app.get("/api/student/:id", (req, res) => {
  const id = Number(req.params.id);

  db.query("SELECT * FROM students WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(results[0]);
  });
});

// POST create student (SQL INSERT)
app.post("/api/student", (req, res) => {
  const { name, gpa } = req.body;

  if (!name || gpa === undefined) {
    return res.status(400).json({ message: "name and gpa are required" });
  }

  const sql = "INSERT INTO students (name, gpa) VALUES (?, ?)";
  db.query(sql, [name, gpa], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      id: result.insertId,
      name,
      gpa: Number(gpa),
    });
  });
});

// PUT update student (SQL UPDATE)
app.put("/api/student/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, gpa } = req.body;

  if (!name || gpa === undefined) {
    return res.status(400).json({ message: "name and gpa are required" });
  }

  const sql = "UPDATE students SET name = ?, gpa = ? WHERE id = ?";
  db.query(sql, [name, gpa, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found" });

    res.json({ id, name, gpa: Number(gpa) });
  });
});

// DELETE student (SQL DELETE)
app.delete("/api/student/:id", (req, res) => {
  const id = Number(req.params.id);

  db.query("DELETE FROM students WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Student not found" });

    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});