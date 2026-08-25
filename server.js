const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));

const resourcesFile = path.join(dataDir,"resources.json");
const announcementsFile = path.join(dataDir,"announcements.json");
const projectsFile = path.join(dataDir,"projects.json");

function read(file, fallback=[]) {
  try { return JSON.parse(fs.readFileSync(file,"utf8")); }
  catch { return fallback; }
}
function write(file,data){ fs.writeFileSync(file,JSON.stringify(data,null,2)); }

if(!fs.existsSync(resourcesFile)) write(resourcesFile, [
  {"id":1,"type":"Coding","title":"GeeksforGeeks","description":"DSA, programming and interview preparation.","url":"https://www.geeksforgeeks.org/"},
  {"id":2,"type":"Coding","title":"LeetCode","description":"Coding problems and interview practice.","url":"https://leetcode.com/"},
  {"id":3,"type":"Coding","title":"HackerRank","description":"Programming, SQL and interview practice.","url":"https://www.hackerrank.com/"},
  {"id":4,"type":"Learning","title":"freeCodeCamp","description":"Free programming and web development courses.","url":"https://www.freecodecamp.org/"},
  {"id":5,"type":"Learning","title":"NPTEL","description":"Engineering courses and lectures from IITs/IISc.","url":"https://nptel.ac.in/"},
  {"id":6,"type":"Learning","title":"SWAYAM","description":"Online courses and learning resources.","url":"https://swayam.gov.in/"},
  {"id":7,"type":"Aptitude","title":"IndiaBix","description":"Quantitative aptitude, reasoning and verbal practice.","url":"https://www.indiabix.com/"},
  {"id":8,"type":"Technical","title":"Programiz","description":"Programming tutorials and examples.","url":"https://www.programiz.com/"},
  {"id":9,"type":"Technical","title":"W3Schools","description":"Web, SQL, programming and reference tutorials.","url":"https://www.w3schools.com/"},
  {"id":10,"type":"Interview","title":"InterviewBit","description":"Coding and interview preparation resources.","url":"https://www.interviewbit.com/"}
]);
if(!fs.existsSync(announcementsFile)) write(announcementsFile,[]);
if(!fs.existsSync(projectsFile)) write(projectsFile,[]);

app.get("/api/resources",(req,res)=>{
  const type=(req.query.type||"").toLowerCase();
  let data=read(resourcesFile);
  if(type) data=data.filter(x=>x.type.toLowerCase()===type);
  res.json(data);
});
app.post("/api/resources",(req,res)=>{
  const {type,title,description="",url}=req.body;
  if(!type||!title||!url) return res.status(400).json({message:"Type, title and URL are required."});
  const data=read(resourcesFile);
  const item={id:Date.now(),type,title,description,url};
  data.push(item); write(resourcesFile,data); res.json(item);
});
app.delete("/api/resources/:id",(req,res)=>{
  let data=read(resourcesFile);
  data=data.filter(x=>String(x.id)!==String(req.params.id));
  write(resourcesFile,data); res.json({message:"Resource deleted."});
});

app.get("/api/announcements",(req,res)=>res.json(read(announcementsFile)));
app.post("/api/announcements",(req,res)=>{
  const {title,message,date=""}=req.body;
  if(!title||!message) return res.status(400).json({message:"Title and message are required."});
  const data=read(announcementsFile);
  const item={id:Date.now(),title,message,date:date||new Date().toISOString().slice(0,10)};
  data.unshift(item); write(announcementsFile,data); res.json(item);
});
app.delete("/api/announcements/:id",(req,res)=>{
  write(announcementsFile,read(announcementsFile).filter(x=>String(x.id)!==String(req.params.id)));
  res.json({message:"Announcement deleted."});
});

app.get("/api/projects",(req,res)=>res.json(read(projectsFile)));
app.post("/api/projects",(req,res)=>{
  const {title,description,technologies="",difficulty="Beginner"}=req.body;
  if(!title||!description) return res.status(400).json({message:"Title and description are required."});
  const data=read(projectsFile);
  const item={id:Date.now(),title,description,technologies,difficulty};
  data.unshift(item); write(projectsFile,data); res.json(item);
});
app.delete("/api/projects/:id",(req,res)=>{
  write(projectsFile,read(projectsFile).filter(x=>String(x.id)!==String(req.params.id)));
  res.json({message:"Project deleted."});
});

app.get("/api/health",(_,res)=>res.json({ok:true}));
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Portal running at http://localhost:${PORT}`));