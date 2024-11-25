const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "restau",
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  } else {
    console.log("Connected to MySQL database");
  }
});


app.get("/reserve", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "reserve.html"));
});


app.post("/reserve", (req, res) => {
  const { name, contact, date, time, guests } = req.body;

  if (!name || !contact || !date || !time || !guests) {
    return res.status(400).send("All fields are required.");
  }

  const sql =
    "INSERT INTO reserve (res_name, contact, adate, atime, nog) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, contact, date, time, guests], (err, result) => {
    if (err) {
      console.error("Error saving reservation:", err);
      res.status(500).send("Error occurred while saving the reservation.");
    } else {
      res.send("Table Reserved successfully");
    }
  });
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).send("Email already exists.");
      } else {
        res.status(500).send("Error during registration.");
      }
    } else {
      res.send("User registered successfully!");
    }
  });
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Both email and password are required.");
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).send("Server error.");
    }

    if (results.length === 0) {
      return res.status(400).send("User not found.");
    }

    const user = results[0];
    if (password === user.password) {
      res.send("Login successful!");
    } else {
      res.status(400).send("Invalid password.");
    }
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
