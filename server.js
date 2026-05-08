const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./db.sqlite");

/* 🔒 HASH SIMPLE (SIN LIBRERÍAS EXTRAS) */
function hashPassword(password){
 return crypto.createHash("sha256").update(password).digest("hex");
}

/* tablas */
db.run(`CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS registros(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 fecha TEXT,
 hora TEXT,
 periodo TEXT,
 alimento TEXT,
 tipo TEXT
)`);

/* REGISTER */
app.post("/register", (req, res) => {

 const hash = hashPassword(req.body.password);

 db.run(
  "INSERT INTO users (username,password) VALUES (?,?)",
  [req.body.username, hash],
  (err) => {
    if(err) return res.status(400).send("Usuario existente");
    res.send("OK");
  }
 );
});

/* LOGIN */
app.post("/login", (req, res) => {

 db.get(
  "SELECT * FROM users WHERE username=?",
  [req.body.username],
  (err, user) => {

    if(!user) return res.status(400).send("No existe");

    const hash = hashPassword(req.body.password);

    if(hash !== user.password){
      return res.status(400).send("Password incorrecto");
    }

    res.json(user);
  }
 );
});

/* GUARDAR */
app.post("/add", (req, res) => {

 db.run(
  `INSERT INTO registros 
   (user_id,fecha,hora,periodo,alimento,tipo)
   VALUES (?,?,?,?,?,?)`,
  [
   req.body.user_id,
   req.body.fecha,
   req.body.hora || "",
   req.body.periodo,
   req.body.alimento,
   req.body.tipo
  ],
  () => res.send("OK")
 );
});

/* OBTENER */
app.get("/data/:id", (req, res) => {

 db.all(
  "SELECT * FROM registros WHERE user_id=?",
  [req.params.id],
  (err, rows) => res.json(rows)
 );
});

/* SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT);
