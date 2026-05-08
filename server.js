const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("db.sqlite");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS registros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    fecha TEXT,
    hora TEXT,
    periodo TEXT,
    alimento TEXT,
    tipo TEXT
  )`);
});

app.use(express.static("public"));

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, row) => {
      if (row) res.json(row);
      else res.status(401).json({ error: "Login incorrecto" });
    }
  );
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  db.run(
    "INSERT INTO users (username,password) VALUES (?,?)",
    [username, password],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.post("/add", (req, res) => {
  const { user_id, fecha, hora, periodo, alimento, tipo } = req.body;

  db.run(
    `INSERT INTO registros (user_id,fecha,hora,periodo,alimento,tipo)
     VALUES (?,?,?,?,?,?)`,
    [user_id, fecha, hora, periodo, alimento, tipo],
    () => res.json({ ok: true })
  );
});

app.get("/data/:id", (req, res) => {
  db.all(
    "SELECT * FROM registros WHERE user_id=?",
    [req.params.id],
    (err, rows) => res.json(rows)
  );
});

app.listen(3000);
``