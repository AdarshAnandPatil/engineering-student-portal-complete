const app=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
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
${["📚 E-Library","🎓 Results","💼 Placements","📝 Resume Builder","💻 Coding Practice","🎯 Aptitude Tests","🏢 Internships","🚀 Project Ideas"].map((x,i)=>`<div class="card"><h2>${x}</h2><p class="muted">Useful resources and tools for engineering students.</p><button onclick="show('${["library","results","placements","resume","coding","aptitude","internships","projects"][i]}')">Open</button></div>`).join("")}
</div>`)}
async function library(){
 const data=await fetch("/api/resources?type=E-Library").then(r=>r.json()).catch(()=>[]);
 wrap("📚 E-Library",`<p class="muted">Study Materials, Important Questions, Question Papers, Assignments, Lab Manuals, Lab Programs and Projects.</p>
 <div class="tabs">${["Study Materials","Important Questions","Question Papers","Assignments","Lab Manuals","Lab Programs","Projects"].map(x=>`<button onclick="libraryType('${x}')">${x}</button>`).join("")}</div><div id="resourceList">${renderResources(data)}</div>`);
}
async function libraryType(type){
 const all=await fetch("/api/resources").then(r=>r.json()); 
 document.getElementById("resourceList").innerHTML=renderResources(all.filter(x=>x.type.toLowerCase()===type.toLowerCase()));
}
function renderResources(data){return data.length?data.map(x=>`<div class="card resource"><div><span class="tag">${esc(x.type)}</span><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description)}</p></div><a class="btn" href="${esc(x.url)}" target="_blank" rel="noopener">Open Resource</a></div>`).join(""):`<div class="card">No resources added yet.</div>`}

function results(){wrap("🎓 Results & SGPA / CGPA Calculator",`
<div class="card"><h2>Semester-wise Result</h2><p class="muted">Add subjects, credits and grade points for each semester. Your SGPA and overall CGPA are calculated automatically.</p>
<div id="semesters"></div><button onclick="addSemester()">＋ Add Semester</button></div>
<div class="card"><h2>Quick SGPA Calculator</h2><div id="quick"></div><button onclick="addQuick()">＋ Add Subject</button> <button onclick="calcQuick()">Calculate SGPA</button><h2 id="quickOut"></h2></div>`); addSemester();addQuick();addQuick();}
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
 r.innerHTML=`<input placeholder="Subject"><input type="number" min="0" step=".5" placeholder="Credits" class="credit"><input type="number" min="0" max="10" step=".1" placeholder="Grade Point" class="gp"><button class="danger" onclick="this.parentElement.remove()">×</button>`;
 rows.appendChild(r);
}
function calcSemester(btn){
 const rows=[...btn.parentElement.querySelectorAll(".result-row")], d=rows.reduce((a,r)=>{let c=+r.querySelector(".credit").value||0,g=+r.querySelector(".gp").value||0;a.c+=c;a.p+=c*g;return a},{c:0,p:0});
 btn.parentElement.querySelector(".sgpaOut").textContent=d.c?`SGPA: ${fmt(d.p/d.c)}`:"Enter valid credits and grade points.";
}
function addQuick(){addRow(document.getElementById("quick").parentElement)}
function calcQuick(){const rows=[...document.querySelectorAll("#quick .result-row")],d=rows.reduce((a,r)=>{let c=+r.querySelector(".credit").value||0,g=+r.querySelector(".gp").value||0;a.c+=c;a.p+=c*g;return a},{c:0,p:0});document.getElementById("quickOut").textContent=d.c?`SGPA: ${fmt(d.p/d.c)}`:"Enter valid values."}
function placements(){wrap("💼 Placements",`
<div class="grid"><div class="card"><h2>Company Updates</h2><p>Track roles, eligibility, packages and application information from your college/company notices.</p></div><div class="card"><h2>Eligibility</h2><p>Check CGPA, backlog, branch, graduation year and skill requirements before applying.</p></div></div>
<div class="card"><h2>Placement Preparation</h2><div class="tabs"><button onclick="resourceSection('Aptitude')">Aptitude</button><button onclick="resourceSection('Coding')">Coding</button><button onclick="resourceSection('Technical')">Technical</button><button onclick="resourceSection('Interview')">Interview</button></div><div id="placementResources">Choose a category.</div></div>`)}
async function resourceSection(type){const d=await fetch("/api/resources").then(r=>r.json());document.getElementById("placementResources").innerHTML=renderResources(d.filter(x=>x.type.toLowerCase()===type.toLowerCase()));}
function coding(){wrap("💻 Coding Practice",`<div class="grid">${["C","C++","Java","Python","JavaScript","SQL","DSA"].map(x=>`<div class="card"><h2>${x}</h2><p>Practice programming and prepare for technical interviews.</p><button onclick="resourceSection('Coding')">Learning Resources</button></div>`).join("")}</div><div class="card" id="codingLinks"><h2>Recommended Coding Resources</h2><p>GeeksforGeeks • LeetCode • HackerRank • freeCodeCamp • InterviewBit</p></div>`)}
function aptitude(){wrap("🎯 Aptitude Tests",`<div class="grid">${["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation","Technical MCQs"].map(x=>`<div class="card"><h2>${x}</h2><p>Practice questions and placement-test preparation.</p><a class="btn" href="https://www.indiabix.com/" target="_blank">Practice</a></div>`).join("")}</div>`)}
function internships(){wrap("🏢 Internships",`<div class="card"><h2>Internship Checklist</h2><ul><li>Keep resume updated.</li><li>Build 2–3 strong projects.</li><li>Prepare GitHub and LinkedIn profiles.</li><li>Apply through official company career pages.</li><li>Never pay an unknown person for a job or internship.</li></ul></div><div class="card"><h2>Where to Search</h2><p>Use official company career pages, LinkedIn, Internshala, Naukri and college placement cells.</p></div>`)}
function resume(){wrap("📝 Resume Builder",`<div class="card"><div class="formgrid"><div><label>Name</label><input id="rn"></div><div><label>Email</label><input id="re"></div><div><label>Phone</label><input id="rp"></div><div><label>LinkedIn</label><input id="rl"></div></div><label>Skills</label><textarea id="rs" placeholder="C, C++, Java, Python, SQL..."></textarea><label>Projects</label><textarea id="rproj"></textarea><label>Education</label><textarea id="redu"></textarea><button onclick="makeResume()">Generate Resume</button></div><div id="resumeOut"></div>`)}
function makeResume(){const g=id=>esc(document.getElementById(id).value);document.getElementById("resumeOut").innerHTML=`<div class="card"><h1>${g("rn")}</h1><p>${g("re")} • ${g("rp")} • ${g("rl")}</p><h2>Skills</h2><p>${g("rs")}</p><h2>Projects</h2><p>${g("rproj")}</p><h2>Education</h2><p>${g("redu")}</p><button onclick="window.print()">Print / Save as PDF</button></div>`}
async function announcements(){const d=await fetch("/api/announcements").then(r=>r.json());wrap("📢 Announcements",d.length?d.map(x=>`<div class="card"><span class="tag">${esc(x.date)}</span><h2>${esc(x.title)}</h2><p>${esc(x.message)}</p></div>`).join(""):`<div class="card">No announcements yet.</div>`)}
function calendar(){wrap("📅 Academic Calendar",`<div class="card"><h2>Academic Planning</h2><p>Add your college's semester start/end dates, internal exams, practical exams, holidays and university exam dates here.</p><textarea placeholder="Example: Semester starts — ..."></textarea></div>`)}
async function projects(){const d=await fetch("/api/projects").then(r=>r.json());wrap("🚀 Project Ideas",`<div class="grid">${d.map(x=>`<div class="card"><span class="tag">${esc(x.difficulty)}</span><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p><p><b>Technologies:</b> ${esc(x.technologies)}</p></div>`).join("")||`<div class="card">No custom projects added. Add ideas through the API/admin later.</div>`}</div>`)}
function links(){wrap("🔗 Useful Engineering Links",`<div class="grid">${[["VTU","https://vtu.ac.in/"],["NPTEL","https://nptel.ac.in/"],["SWAYAM","https://swayam.gov.in/"],["GitHub","https://github.com/"],["LinkedIn","https://www.linkedin.com/"],["GeeksforGeeks","https://www.geeksforgeeks.org/"],["LeetCode","https://leetcode.com/"],["HackerRank","https://www.hackerrank.com/"]].map(x=>`<div class="card"><h2>${x[0]}</h2><a class="btn" href="${x[1]}" target="_blank" rel="noopener">Open Website</a></div>`).join("")}</div>`)}
show("home");