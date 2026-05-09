const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public")); // index.html debe estar en /public

/* =========================
   DB
========================= */

const db = new sqlite3.Database("./db.sqlite");

/* =========================
   HASH PASSWORD
========================= */

function hash(p){
 return crypto.createHash("sha256").update(p).digest("hex");
}

/* =========================
   CREAR TABLAS
========================= */

db.serialize(()=>{

 db.run(`
  CREATE TABLE IF NOT EXISTS users(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   username TEXT UNIQUE,
   password TEXT
  )
 `);

 db.run(`
  CREATE TABLE IF NOT EXISTS registros(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_id INTEGER,
   fecha TEXT,
   hora TEXT,
   alimento TEXT,
   tipo TEXT,
   periodo TEXT
  )
 `);

});

/* =========================
   REGISTER ✅
========================= */

app.post("/register",(req,res)=>{

 const {username,password} = req.body;

 if(!username || !password){
  return res.status(400).send("Faltan datos");
 }

 db.get("SELECT * FROM users WHERE username=?",[username],(err,row)=>{
  if(row){
   return res.status(400).send("Usuario ya existe");
  }

  db.run(
   "INSERT INTO users(username,password) VALUES(?,?)",
   [username, hash(password)],
   (err)=>{
    if(err){
     console.log(err);
     return res.status(500).send("Error creando usuario");
    }
    res.send("OK");
   }
  );
 });

});

/* =========================
   LOGIN ✅
========================= */

app.post("/login",(req,res)=>{

 const {username,password} = req.body;

 if(!username || !password){
  return res.status(400).send("Faltan datos");
 }

 db.get(
  "SELECT * FROM users WHERE username=?",
  [username],
  (err,row)=>{

   if(err){
    console.log(err);
    return res.status(500).send("Error servidor");
   }

   if(!row){
    return res.status(400).send("Usuario no existe");
   }

   if(row.password !== hash(password)){
    return res.status(400).send("Password incorrecto");
   }

   // ✅ IMPORTANTE: devolver solo datos necesarios
   res.json({
    id: row.id,
    username: row.username
   });

  }
 );

});

/* =========================
   CREATE REGISTRO
========================= */

app.post("/add",(req,res)=>{

 const {user_id,fecha,hora,alimento,tipo,periodo} = req.body;

 db.run(
  `INSERT INTO registros(user_id,fecha,hora,alimento,tipo,periodo)
   VALUES (?,?,?,?,?,?)`,
  [user_id,fecha,hora,alimento,tipo,periodo],
  (err)=>{
   if(err){
    console.log(err);
    return res.status(500).send("Error guardando");
   }
   res.send("OK");
  }
 );

});

/* =========================
   READ
========================= */

app.get("/data/:id",(req,res)=>{

 db.all(
  "SELECT * FROM registros WHERE user_id=? ORDER BY id DESC",
  [req.params.id],
  (err,rows)=>{
   if(err){
    console.log(err);
    return res.json([]);
   }
   res.json(rows);
  }
 );

});

/* =========================
   DELETE
========================= */

app.post("/delete",(req,res)=>{

 db.run(
  "DELETE FROM registros WHERE id=?",
  [req.body.id],
  (err)=>{
   if(err){
    console.log(err);
    return res.status(500).send("Error eliminando");
   }
   res.send("OK");
  }
 );

});

/* =========================
   UPDATE (extra pro)
========================= */

app.post("/update",(req,res)=>{

 const {id,alimento,tipo,periodo} = req.body;

 db.run(
  `UPDATE registros 
   SET alimento=?, tipo=?, periodo=?
   WHERE id=?`,
  [alimento,tipo,periodo,id],
  (err)=>{
   if(err){
    console.log(err);
    return res.status(500).send("Error update");
   }
   res.send("OK");
  }
 );

});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
 console.log("✅ Server funcionando en puerto",PORT);
});