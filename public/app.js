const app=document.getElementById("app");
const esc=s=>String(s??".").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">": "&gt;", '"':'&quot;',"'":"&#039;"}[m]));
const fmt=n=>Number(n||0).toFixed(2);

function toggleNav(){document.getElementById("nav").classList.toggle("open")}
function show(page){
  document.getElementById("nav").classList.remove("open");
  const f={home:home,library:library,results:results,placements:placements,resume:resume,coding:coding,aptitude:aptitude,internships:internships,announcements:announcements,calendar:calendar,projects:projects,links:links};
  (f[page]||home)();
}
function wrap(title,html){app.innerHTML=`<div class="container"><div class="hero"><h1>${title}</h1><p>Engineering Student Portal</p></div>${html}</div>`}
function home(){wrap("Welcome to Engineering Student Portal",`
<div class="grid">
${["📚 E-Library","🎓 Results","💼 Placements","📝 Resume Builder","💻 Coding Practice","🎯 Aptitude Tests","🏢 Internships","🚀 Project Ideas"].map((x,i)=>`<div class="card"><h2>${x}</h2><p>Explore ${x.slice(2).toLowerCase()} resources and tools.</p></div>`).join("")}
</div>`);
}
async function library(){
 const data=await fetch("/api/resources?type=E-Library").then(r=>r.json()).catch(()=>[]);
 wrap("📚 E-Library",`<p class="muted">Study Materials, Important Questions, Question Papers, Assignments, Lab Manuals, Lab Programs and Projects.</p>
 <div class="tabs">${["Study Materials","Important Questions","Question Papers","Assignments","Lab Manuals","Lab Programs","Projects"].map(x=>`<button onclick="libraryType('${x}')">${x}</button>`).join("")}</div>
 <div id="resourceList"></div>`);
 libraryType("Study Materials");
}
async function libraryType(type){
 const all=await fetch("/api/resources").then(r=>r.json()); 
 document.getElementById("resourceList").innerHTML=renderResources(all.filter(x=>x.type.toLowerCase()===type.toLowerCase()));
}
function renderResources(data){return data.length?data.map(x=>`<div class="card resource"><div><span class="tag">${esc(x.type)}</span><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description)}</p><a href="${esc(x.url)}" target="_blank">Open →</a></div></div>`).join(""):"<p class=muted>No resources found.</p>";}

function results(){wrap("🎓 Results & SGPA / CGPA Calculator",`
<div class="card"><h2>Semester-wise Result</h2><p class="muted">Add subjects, credits and grade points for each semester. Your SGPA and overall CGPA are calculated automatically.</p>
<div id="semesters"></div><button onclick="addSemester()">＋ Add Semester</button></div>
<div class="card"><h2>Quick SGPA Calculator</h2><div id="quick"></div><button onclick="addQuick()">＋ Add Subject</button> <button onclick="calcQuick()">Calculate SGPA</button><h2 id="quickOut"></h2></div>`);
addSemester();
}
function gradePoint(g){return Number(g)||0}
function addSemester(){
 const box=document.getElementById("semesters"), n=box.children.length+1;
 const div=document.createElement("div");div.className="card";
 div.innerHTML=`<h3>Semester ${n}</h3><div class="rows"></div><button onclick="addRow(this)">＋ Subject</button> <button class="secondary" onclick="calcSemester(this)">Calculate SGPA</button><h3 class="sgpaOut"></h3>`;
 box.appendChild(div);addRow(div.querySelector("button"));
}
function addRow(btn){
 const rows=btn.parentElement.querySelector(".rows");
 const r=document.createElement("div");r.className="result-row";
 r.innerHTML=`<input placeholder="Subject"><input type="number" min="0" step=".5" placeholder="Credits" class="credit"><input type="number" min="0" max="10" step=".1" placeholder="Grade Point" class="gp"><button class="secondary" onclick="this.parentElement.remove()">✕</button>`;
 rows.appendChild(r);
}
function calcSemester(btn){
 const rows=[...btn.parentElement.querySelectorAll(".result-row")], d=rows.reduce((a,r)=>{let c=+r.querySelector(".credit").value||0,g=+r.querySelector(".gp").value||0;a.c+=c;a.p+=c*g;return a},{c:0,p:0});
 btn.parentElement.querySelector(".sgpaOut").textContent=d.c?`SGPA: ${fmt(d.p/d.c)}`:"'Enter valid credits and grade points.";
}
function addQuick(){addRow(document.getElementById("quick").parentElement)}
function calcQuick(){const rows=[...document.querySelectorAll("#quick .result-row")],d=rows.reduce((a,r)=>{let c=+r.querySelector(".credit").value||0,g=+r.querySelector(".gp").value||0;a.c+=c;a.p+=c*g;return a},{c:0,p:0});document.getElementById("quickOut").textContent=d.c?`SGPA: ${fmt(d.p/d.c)}`:"'Enter valid credits and grade points."}
function placements(){wrap("💼 Placements",`
<div class="grid"><div class="card"><h2>Company Updates</h2><p>Track roles, eligibility, packages and application information from your college/company notices.</p></div><div class="card"><h2>Eligibility Criteria</h2><p>Check minimum CGPA, branch eligibility and document requirements.</p></div>
<div class="card"><h2>Placement Preparation</h2><div class="tabs"><button onclick="resourceSection('Aptitude')">Aptitude</button><button onclick="resourceSection('Coding')">Coding</button><button onclick="resourceSection('Interview')">Interview</button></div><div id="placementResources"></div></div></div>`);
resourceSection("Aptitude");
}
async function resourceSection(type){const d=await fetch("/api/resources").then(r=>r.json());document.getElementById("placementResources").innerHTML=renderResources(d.filter(x=>x.type.toLowerCase()===type.toLowerCase()));}
function coding(){wrap("💻 Coding Practice",`<div class="grid">${["C","C++","Java","Python","JavaScript","SQL","DSA"].map(x=>`<div class="card"><h2>${x}</h2><p>Practice programming and prepare for placements.</p></div>`).join("")}</div>`);}
function aptitude(){wrap("🎯 Aptitude Tests",`<div class="grid">${["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation","Technical MCQs"].map(x=>`<div class="card"><h2>${x}</h2><p>Take mock tests and evaluate yourself.</p></div>`).join("")}</div>`);}
function internships(){wrap("🏢 Internships",`<div class="card"><h2>Internship Checklist</h2><ul><li>Keep resume updated.</li><li>Build 2–3 strong projects.</li><li>Prepare GitHub and LinkedIn profiles.</li><li>Apply to 10+ internship opportunities.</li><li>Network with seniors and alumni.</li><li>Practice coding problems daily.</li></ul></div>`)}
function resume(){wrap("📝 Resume Builder",`<div class="card"><div class="formgrid"><div><label>Name</label><input id="rn"></div><div><label>Email</label><input id="re"></div><div><label>Phone</label><input id="rp"></div><div><label>LinkedIn</label><input id="rl"></div><div><label>GitHub</label><input id="rg"></div><div><label>Skills</label><input id="rs"></div><div><label>Summary</label><textarea id="rs2"></textarea></div></div><button onclick="makeResume()">Generate Resume</button></div><div id="resumeOut"></div>`)}
function makeResume(){const g=id=>esc(document.getElementById(id).value);document.getElementById("resumeOut").innerHTML=`<div class="card"><h1>${g("rn")}</h1><p>${g("re")} • ${g("rp")} • ${g("rl")} • ${g("rg")}</p><h3>Skills</h3><p>${g("rs").split(",").map(s=>s.trim()).join(", ")}</p><h3>Summary</h3><p>${g("rs2")}</p></div>`}
async function announcements(){const d=await fetch("/api/announcements").then(r=>r.json());wrap("📢 Announcements",d.length?d.map(x=>`<div class="card"><span class="tag">${esc(x.date)}</span><h2>${esc(x.title)}</h2><p>${esc(x.message)}</p></div>`).join(""):"<p class=muted>No announcements yet.</p>");}
function calendar(){wrap("📅 Academic Calendar",`<div class="card"><h2>Academic Planning</h2><p>Add your college's semester start/end dates, internal exams, practical exams, holidays and university exam schedules here.</p></div>`);}
async function projects(){const d=await fetch("/api/projects").then(r=>r.json());wrap("🚀 Project Ideas",`<div class="grid">${d.map(x=>`<div class="card"><span class="tag">${esc(x.difficulty)}</span><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p><p class="muted">Tech: ${esc(x.technologies)}</p></div>`).join("")}</div>`);}
function links(){wrap("🔗 Useful Engineering Links",`<div class="grid">${[["VTU","https://vtu.ac.in/"],["NPTEL","https://nptel.ac.in/"],["SWAYAM","https://swayam.gov.in/"],["GitHub","https://github.com"],["Stack Overflow","https://stackoverflow.com"],["GeeksforGeeks","https://geeksforgeeks.org"]].map(([n,u])=>`<a href="${u}" target="_blank" class="card"><h2>${n}</h2></a>`).join("")}</div>`);}
show("home");