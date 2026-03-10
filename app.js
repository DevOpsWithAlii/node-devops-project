const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 8090;
const MONGO_URI = process.env.MONGO_URI;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ---------------- MongoDB Connection ---------------- */

mongoose.connect(MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

/* ---------------- User Schema ---------------- */

const UserSchema = new mongoose.Schema({
  email:String,
  password:String
});

const User = mongoose.model("User",UserSchema);

/* ---------------- Redis Connection ---------------- */

const redisClient = redis.createClient({
  socket:{
    host:REDIS_HOST,
    port:REDIS_PORT
  }
});

redisClient.connect()
.then(()=>console.log("Redis connected"))
.catch(console.error);

/* ---------------- Login Page ---------------- */

app.get("/", (req,res)=>{

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Login</title>

<style>

body{
font-family:Arial;
background:linear-gradient(135deg,#4facfe,#00f2fe);
height:100vh;
display:flex;
justify-content:center;
align-items:center;
}

.container{
background:white;
padding:40px;
border-radius:10px;
width:320px;
box-shadow:0 10px 25px rgba(0,0,0,0.2);
}

h2{
text-align:center;
margin-bottom:20px;
}

input{
width:100%;
padding:10px;
margin:10px 0;
border:1px solid #ccc;
border-radius:5px;
}

button{
width:100%;
padding:10px;
background:#4facfe;
border:none;
color:white;
font-size:16px;
border-radius:5px;
cursor:pointer;
}

button:hover{
background:#00c6ff;
}

</style>
</head>

<body>

<div class="container">

<h2>Login</h2>

<form action="/login" method="POST">

<input type="email" name="email" placeholder="Enter email" required />

<input type="password" name="password" placeholder="Enter password" required />

<button type="submit">Login</button>

</form>

</div>

</body>

</html>
`);
});

/* ---------------- Login API ---------------- */

app.post("/login", async (req,res)=>{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.send("User not found");
}

const valid = await bcrypt.compare(password,user.password);

if(!valid){
return res.send("Invalid password");
}

/* store login session in redis */

await redisClient.set(email,"loggedin",{EX:60});

res.send("Login successful");

});

/* ---------------- Health Check ---------------- */

app.get("/health",(req,res)=>{
res.json({
status:"ok",
mongo:"connected",
redis:"connected"
});
});

/* ---------------- Server ---------------- */

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`);
});
