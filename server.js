const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./db.sqlite");

// ✅ HASH
function hash(p){
 return crypto.createHash("sha256").update(p).digest("hex");
}

// ✅ TABLAS
db.run(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT UNIQUE,
 password TEXT
)`);

db.run(`
CREATE TABLE IF NOT EXISTS registros(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 fecha TEXT,
 alimento TEXT,
 tipo TEXT,
 periodo TEXT
)`);

// ✅ REGISTER
app.post("/register",(req,res)=>{

 const user = req.body.username;
 const pass = hash(req.body.password);

 db.run(
  "INSERT INTO users(username,password) VALUES(?,?)",
  [user, pass],
  (err)=>{
    if(err){
      console.log("ERROR REGISTER:", err);
      return res.status(400).send("Usuario ya existe");
    }
    res.send("OK");
  }
 );
});

// ✅ LOGIN
app.post("/login",(req,res)=>{

 const user = req.body.username;
 const pass = hash(req.body.password);

 db.get(
  "SELECT * FROM users WHERE username=?",
  [user],
  (err, row)=>{

    if(err){
      console.log("ERROR LOGIN:", err);
      return res.status(500).send("Error servidor");
    }

    if(!row){
      return res.status(400).send("No existe usuario");
    }

    if(row.password !== pass){
      return res.status(400).send("Password incorrecto");
    }

    res.json(row);
  }
 );
});

// ✅ CREATE
app.post("/add",(req,res)=>{

 db.run(
  `INSERT INTO registros(user_id,fecha,alimento,tipo,periodo)
   VALUES (?,?,?,?,?)`,
  [
   req.body.user_id,
   req.body.fecha,
   req.body.alimento,
   req.body.tipo,
   req.body.periodo
  ],
  ()=>res.send("OK")
 );
});

// ✅ READ
app.get("/data/:id",(req,res)=>{

 db.all(
  "SELECT * FROM registros WHERE user_id=?",
  [req.params.id],
  (err, rows)=>{
    if(err){
      console.log(err);
      return res.json([]);
    }
    res.json(rows);
  }
 );
});

// ✅ UPDATE
app.post("/update",(req,res)=>{

 db.run(
  `UPDATE registros 
   SET alimento=?, tipo=?, periodo=? 
   WHERE id=?`,
  [
   req.body.alimento,
   req.body.tipo,
   req.body.periodo,
   req.body.id
  ],
  ()=>res.send("OK")
 );
});

// ✅ DELETE
app.post("/delete",(req,res)=>{

 db.run(
  "DELETE FROM registros WHERE id=?",
  [req.body.id],
  ()=>res.send("OK")
 );
});

app.listen(process.env.PORT || 3000, ()=>{
 console.log("✅ Server funcionando");
});