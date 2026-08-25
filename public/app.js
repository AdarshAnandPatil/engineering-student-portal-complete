const app = document.getElementById("app");

let adminToken = localStorage.getItem("adminToken");
let isAdmin = !!adminToken;

let resources = [];
let announcements = [];
let projects = [];

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

/* ---------------- API ---------------- */

async function api(url, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      adminToken = null;
      isAdmin = false;
      localStorage.removeItem("adminToken");
      updateNavigation();
    }

    throw new Error(data.message || "Request failed.");
  }

  return data;
}

/* ---------------- NAVIGATION ---------------- */

function updateNavigation() {
  const adminBtn = document.getElementById("adminBtn");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (adminBtn) {
    adminBtn.classList.toggle("hidden", !isAdmin);
  }

  if (loginBtn) {
    loginBtn.classList.toggle("hidden", isAdmin);
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("hidden", !isAdmin);
  }
}

function showPage(page) {
  if (page === "home") renderHome();
  else if (page === "library") renderLibrary();
  else if (page === "results") renderResults();
  else if (page === "placements") renderPlacements();
  else if (page === "coding") renderCoding();
  else if (page === "aptitude") renderAptitude();
  else if (page === "internships") renderInternships();
  else if (page === "resume") renderResume();
  else if (page === "announcements") renderAnnouncements();
  else if (page === "calendar") renderCalendar();
  else if (page === "projects") renderProjects();
  else if (page === "links") renderUsefulLinks();
  else if (page === "login") renderLogin();
  else if (page === "admin") renderAdmin();
}

/* ---------------- HOME ---------------- */

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <h1>🎓 Engineering Student Portal</h1>
      <p>
        One place for engineering study materials, results,
        placements, coding practice, internships and career resources.
      </p>

      <div class="action-row">
        <button onclick="showPage('library')">📚 E-Library</button>
        <button onclick="showPage('results')">🎓 Results</button>
        <button onclick="showPage('placements')">💼 Placements</button>
      </div>
    </section>

    <div class="grid">

      <div class="card subject-card">
        <h2>📚 E-Library</h2>
        <p>Study materials, important questions, papers, assignments and lab resources.</p>
        <button onclick="showPage('library')">Open</button>
      </div>

      <div class="card subject-card">
        <h2>🎓 Results</h2>
        <p>Enter semester grades and calculate SGPA and CGPA.</p>
        <button onclick="showPage('results')">Open</button>
      </div>

      <div class="card subject-card">
        <h2>💼 Placements</h2>
        <p>Prepare aptitude, coding, technical and interview skills.</p>
        <button onclick="showPage('placements')">Prepare</button>
      </div>

      <div class="card subject-card">
        <h2>💻 Coding Practice</h2>
        <p>Practice programming, DSA, SQL and interview problems.</p>
        <button onclick="showPage('coding')">Practice</button>
      </div>

      <div class="card subject-card">
        <h2>🎯 Aptitude</h2>
        <p>Quantitative, reasoning, verbal and placement aptitude resources.</p>
        <button onclick="showPage('aptitude')">Practice</button>
      </div>

      <div class="card subject-card">
        <h2>🏢 Internships</h2>
        <p>Find internship platforms and useful career opportunities.</p>
        <button onclick="showPage('internships')">Explore</button>
      </div>

      <div class="card subject-card">
        <h2>📝 Resume Builder</h2>
        <p>Create and download a simple engineering resume.</p>
        <button onclick="showPage('resume')">Build Resume</button>
      </div>

      <div class="card subject-card">
        <h2>🚀 Project Ideas</h2>
        <p>Explore engineering project ideas for mini and final-year projects.</p>
        <button onclick="showPage('projects')">Explore</button>
      </div>

    </div>

    <div class="notice">
      <b>Public access:</b>
      Students can access the portal without login.
      Only the Creator/Admin can add, edit or delete portal content.
    </div>
  `;
}

/* ---------------- E-LIBRARY / RESOURCES ---------------- */

async function renderLibrary() {
  try {
    resources = await api("/api/resources");

    app.innerHTML = `
      <div class="card">
        <h2>📚 E-Library & Engineering Resources</h2>
        <p class="muted">
          Study and career resources. No login required for students.
        </p>

        <div class="formgrid">
          <div>
            <label>Search</label>
            <input
              id="resourceSearch"
              placeholder="Search resources..."
              oninput="filterResources()"
            >
          </div>

          <div>
            <label>Category</label>
            <select id="resourceType" onchange="filterResources()">
              <option value="">All Categories</option>
              <option value="Learning">Learning</option>
              <option value="Coding">Coding</option>
              <option value="Aptitude">Aptitude</option>
              <option value="Technical">Technical</option>
              <option value="Interview">Interview</option>
              <option value="Placement">Placement</option>
            </select>
          </div>
        </div>
      </div>

      <div id="resourceList"></div>

      ${
        isAdmin
          ? `
        <div class="card">
          <h2>🔐 Admin: Add Resource</h2>

          <form id="resourceForm">

            <div class="formgrid">

              <div>
                <label>Category</label>
                <input name="type" required placeholder="Coding">
              </div>

              <div>
                <label>Title</label>
                <input name="title" required placeholder="Resource name">
              </div>

              <div>
                <label>URL</label>
                <input name="url" type="url" required placeholder="https://">
              </div>

            </div>

            <label>Description</label>
            <textarea name="description"></textarea>

            <button type="submit">➕ Add Resource</button>

          </form>
        </div>
      `
          : ""
      }
    `;

    drawResources(resources);

    const form = document.getElementById("resourceForm");

    if (form) {
      form.addEventListener("submit", addResource);
    }
  } catch (error) {
    app.innerHTML = `
      <div class="card">
        <h2>Unable to load resources</h2>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}

function drawResources(list) {
  const container = document.getElementById("resourceList");

  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="card">
        <h3>No resources found.</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map(
      item => `
      <div class="card">

        <h3>${escapeHTML(item.title)}</h3>

        <span class="badge green">
          ${escapeHTML(item.type)}
        </span>

        <p>${escapeHTML(item.description)}</p>

        <div class="action-row">

          <a
            class="btn"
            href="${escapeHTML(item.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 Open Resource
          </a>

          ${
            isAdmin
              ? `
              <button
                class="btn danger"
                onclick="deleteResource(${item.id})"
              >
                🗑️ Delete
              </button>

              <button
                class="btn secondary"
                onclick="editResource(${item.id})"
              >
                ✏️ Edit
              </button>
            `
              : ""
          }

        </div>

      </div>
    `
    )
    .join("");
}

function filterResources() {
  const search = (
    document.getElementById("resourceSearch")?.value || ""
  ).toLowerCase();

  const type = document.getElementById("resourceType")?.value || "";

  const filtered = resources.filter(item => {
    const text = `
      ${item.title}
      ${item.description}
      ${item.type}
    `.toLowerCase();

    return (
      (!search || text.includes(search)) &&
      (!type || item.type === type)
    );
  });

  drawResources(filtered);
}

async function addResource(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const data = Object.fromEntries(formData.entries());

  try {
    await api("/api/resources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    alert("Resource added successfully.");

    renderLibrary();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteResource(id) {
  if (!isAdmin) {
    return alert("Only admin can delete resources.");
  }

  if (!confirm("Delete this resource?")) return;

  try {
    await api(`/api/resources/${id}`, {
      method: "DELETE"
    });

    alert("Resource deleted.");

    renderLibrary();
  } catch (error) {
    alert(error.message);
  }
}

async function editResource(id) {
  if (!isAdmin) {
    return alert("Only admin can edit resources.");
  }

  const item = resources.find(x => String(x.id) === String(id));

  if (!item) return;

  const title = prompt("Resource title:", item.title);

  if (title === null) return;

  const url = prompt("Resource URL:", item.url);

  if (url === null) return;

  const description = prompt(
    "Description:",
    item.description
  );

  if (description === null) return;

  try {
    await api(`/api/resources/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        url,
        description,
        type: item.type
      })
    });

    alert("Resource updated.");

    renderLibrary();
  } catch (error) {
    alert(error.message);
  }
}

/* ---------------- RESULTS ---------------- */

function renderResults() {
  app.innerHTML = `
    <div class="card">
      <h2>🎓 Results & SGPA / CGPA Calculator</h2>

      <p class="muted">
        Enter your semester subjects, credits and grade points.
        The calculator works without login.
      </p>

      <div class="formgrid">

        <div>
          <label>Number of Subjects</label>
          <input
            id="subjectCount"
            type="number"
            min="1"
            max="15"
            value="6"
          >
        </div>

        <div>
          <label>Semester</label>
          <select id="semesterNumber">
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
            <option value="3">3rd Semester</option>
            <option value="4">4th Semester</option>
            <option value="5">5th Semester</option>
            <option value="6">6th Semester</option>
            <option value="7">7th Semester</option>
            <option value="8">8th Semester</option>
          </select>
        </div>

      </div>

      <button onclick="createResultRows()">
        Create Subjects
      </button>

      <div id="resultRows"></div>

      <div class="action-row">
        <button onclick="calculateSGPA()">
          Calculate SGPA
        </button>

        <button
          class="btn secondary"
          onclick="calculateCGPA()"
        >
          Calculate CGPA
        </button>
      </div>

      <div id="resultOutput"></div>
    </div>

    <div class="card">
      <h2>📊 Semester Results</h2>
      <p>
        You can enter your semester SGPA values below to calculate overall CGPA.
      </p>

      <div class="formgrid">
        ${Array.from({ length: 8 }, (_, i) => `
          <div>
            <label>Semester ${i + 1} SGPA</label>
            <input
              class="semester-sgpa"
              data-semester="${i + 1}"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="0.00"
            >
          </div>
        `).join("")}
      </div>

      <button onclick="calculateOverallCGPA()">
        Calculate Overall CGPA
      </button>

      <div id="overallCGPA"></div>
    </div>
  `;
}

function createResultRows() {
  const count = Number(
    document.getElementById("subjectCount").value
  );

  const container = document.getElementById("resultRows");

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Credits</th>
            <th>Grade Point</th>
          </tr>
        </thead>

        <tbody>

          ${Array.from(
            { length: count },
            (_, i) => `
              <tr>
                <td>
                  <input
                    class="result-subject"
                    placeholder="Subject ${i + 1}"
                  >
                </td>

                <td>
                  <input
                    class="result-credit"
                    type="number"
                    min="1"
                    max="10"
                    value="3"
                  >
                </td>

                <td>
                  <input
                    class="result-grade"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="Grade point"
                  >
                </td>
              </tr>
            `
          ).join("")}

        </tbody>
      </table>
    </div>
  `;
}

function calculateSGPA() {
  const credits = [
    ...document.querySelectorAll(".result-credit")
  ];

  const grades = [
    ...document.querySelectorAll(".result-grade")
  ];

  let totalCredits = 0;
  let totalPoints = 0;

  for (let i = 0; i < credits.length; i++) {
    const credit = Number(credits[i].value);
    const grade = Number(grades[i].value);

    if (!credit || isNaN(grade)) continue;

    totalCredits += credit;
    totalPoints += credit * grade;
  }

  if (!totalCredits) {
    return alert("Enter credits and grade points.");
  }

  const sgpa = totalPoints / totalCredits;

  document.getElementById("resultOutput").innerHTML = `
    <div class="notice">
      <h2>SGPA: ${sgpa.toFixed(2)}</h2>
      <p>Total Credits: ${totalCredits}</p>
    </div>
  `;
}

function calculateCGPA() {
  calculateOverallCGPA();
}

function calculateOverallCGPA() {
  const inputs = [
    ...document.querySelectorAll(".semester-sgpa")
  ];

  const values = inputs
    .map(input => Number(input.value))
    .filter(value => value > 0);

  if (!values.length) {
    return alert("Enter at least one semester SGPA.");
  }

  const cgpa =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const output =
    document.getElementById("overallCGPA");

  output.innerHTML = `
    <div class="notice">
      <h2>Overall CGPA: ${cgpa.toFixed(2)}</h2>
      <p>Based on ${values.length} semester(s).</p>
    </div>
  `;
}

/* ---------------- PLACEMENTS ---------------- */

async function renderPlacements() {
  const data = await api("/api/resources");

  const placement = data.filter(item =>
    [
      "Placement",
      "Aptitude",
      "Coding",
      "Technical",
      "Interview"
    ].includes(item.type)
  );

  app.innerHTML = `
    <div class="card">
      <h2>💼 Placement Preparation</h2>

      <p>
        Prepare for engineering placements with aptitude,
        coding, technical and interview resources.
      </p>

      <div class="grid">

        <div class="card">
          <h3>🧮 Aptitude</h3>
          <p>Quantitative aptitude and reasoning.</p>
          <button onclick="showPage('aptitude')">
            Practice
          </button>
        </div>

        <div class="card">
          <h3>💻 Coding</h3>
          <p>DSA and programming interview preparation.</p>
          <button onclick="showPage('coding')">
            Practice
          </button>
        </div>

        <div class="card">
          <h3>🛠 Technical</h3>
          <p>CS fundamentals and technical preparation.</p>
        </div>

        <div class="card">
          <h3>🎤 Interview</h3>
          <p>HR and technical interview preparation.</p>
        </div>

      </div>
    </div>

    <div id="placementResources"></div>
  `;

  const container =
    document.getElementById("placementResources");

  container.innerHTML = placement.length
    ? placement.map(item => `
      <div class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <span class="badge green">
          ${escapeHTML(item.type)}
        </span>
        <p>${escapeHTML(item.description)}</p>

        <a
          class="btn"
          href="${escapeHTML(item.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Resource
        </a>
      </div>
    `).join("")
    : `
      <div class="card">
        <h3>No placement resources added yet.</h3>
      </div>
    `;
}

/* ---------------- CODING ---------------- */

async function renderCoding() {
  const data = await api("/api/resources");

  const coding = data.filter(item =>
    ["Coding", "Technical"].includes(item.type)
  );

  app.innerHTML = `
    <div class="card">
      <h2>💻 Coding Practice</h2>
      <p>
        Practice programming, DSA, SQL and technical skills.
      </p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>Python</h3>
        <p>Python programming and problem solving.</p>
      </div>

      <div class="card">
        <h3>Java</h3>
        <p>Java programming and OOP.</p>
      </div>

      <div class="card">
        <h3>C / C++</h3>
        <p>Programming fundamentals and DSA.</p>
      </div>

      <div class="card">
        <h3>JavaScript</h3>
        <p>Web development and JavaScript.</p>
      </div>

      <div class="card">
        <h3>SQL</h3>
        <p>Database and SQL interview preparation.</p>
      </div>

      <div class="card">
        <h3>DSA</h3>
        <p>Arrays, strings, trees, graphs and algorithms.</p>
      </div>
    </div>

    <div id="codingResources"></div>
  `;

  document.getElementById("codingResources").innerHTML =
    coding.map(item => `
      <div class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
        <a
          class="btn"
          href="${escapeHTML(item.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open
        </a>
      </div>
    `).join("");
}

/* ---------------- APTITUDE ---------------- */

async function renderAptitude() {
  const data = await api("/api/resources");

  const aptitude = data.filter(item =>
    item.type === "Aptitude"
  );

  app.innerHTML = `
    <div class="card">
      <h2>🎯 Aptitude Tests & Practice</h2>

      <div class="grid">

        <div class="card">
          <h3>Quantitative Aptitude</h3>
          <p>Percentages, ratios, averages, time and work.</p>
        </div>

        <div class="card">
          <h3>Logical Reasoning</h3>
          <p>Series, puzzles, coding-decoding and reasoning.</p>
        </div>

        <div class="card">
          <h3>Verbal Ability</h3>
          <p>Grammar, vocabulary and comprehension.</p>
        </div>

        <div class="card">
          <h3>Data Interpretation</h3>
          <p>Tables, charts and graphs.</p>
        </div>

      </div>
    </div>

    <div>
      ${aptitude.map(item => `
        <div class="card">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description)}</p>

          <a
            class="btn"
            href="${escapeHTML(item.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Practice
          </a>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------------- INTERNSHIPS ---------------- */

async function renderInternships() {
  const data = await api("/api/resources");

  const internship = data.filter(item =>
    ["Internship", "Placement", "Learning"].includes(item.type)
  );

  app.innerHTML = `
    <div class="card">
      <h2>🏢 Internships</h2>
      <p>
        Find internships, learn new skills and prepare for your career.
      </p>
    </div>

    <div class="grid">
      <div class="card">
        <h3>LinkedIn</h3>
        <p>Find internships and connect with companies.</p>
        <a
          class="btn"
          href="https://www.linkedin.com/jobs/"
          target="_blank"
        >
          Open
        </a>
      </div>

      <div class="card">
        <h3>Internshala</h3>
        <p>Search for student internships.</p>
        <a
          class="btn"
          href="https://internshala.com/"
          target="_blank"
        >
          Open
        </a>
      </div>
    </div>

    ${internship.map(item => `
      <div class="card">
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description)}</p>
        <a
          class="btn"
          href="${escapeHTML(item.url)}"
          target="_blank"
        >
          Open
        </a>
      </div>
    `).join("")}
  `;
}

/* ---------------- RESUME ---------------- */

function renderResume() {
  app.innerHTML = `
    <div class="card">
      <h2>📝 Resume Builder</h2>

      <div class="formgrid">

        <div>
          <label>Name</label>
          <input id="resumeName">
        </div>

        <div>
          <label>Email</label>
          <input id="resumeEmail">
        </div>

        <div>
          <label>Phone</label>
          <input id="resumePhone">
        </div>

        <div>
          <label>College</label>
          <input id="resumeCollege">
        </div>

      </div>

      <label>Skills</label>
      <textarea id="resumeSkills"></textarea>

      <label>Projects</label>
      <textarea id="resumeProjects"></textarea>

      <label>Education</label>
      <textarea id="resumeEducation"></textarea>

      <button onclick="generateResume()">
        Generate Resume
      </button>
    </div>

    <div id="resumeOutput"></div>
  `;
}

function generateResume() {
  const name = document.getElementById("resumeName").value;
  const email = document.getElementById("resumeEmail").value;
  const phone = document.getElementById("resumePhone").value;
  const college = document.getElementById("resumeCollege").value;
  const skills = document.getElementById("resumeSkills").value;
  const projects = document.getElementById("resumeProjects").value;
  const education = document.getElementById("resumeEducation").value;

  document.getElementById("resumeOutput").innerHTML = `
    <div class="card" id="resumeCard">

      <h1>${escapeHTML(name)}</h1>

      <p>
        ${escapeHTML(email)}
        ${email && phone ? " • " : ""}
        ${escapeHTML(phone)}
      </p>

      <hr>

      <h2>Education</h2>
      <p>${escapeHTML(education)}</p>

      <h2>Skills</h2>
      <p>${escapeHTML(skills)}</p>

      <h2>Projects</h2>
      <p>${escapeHTML(projects)}</p>

    </div>
  `;
}

/* ---------------- ANNOUNCEMENTS ---------------- */

async function renderAnnouncements() {
  announcements = await api("/api/announcements");

  app.innerHTML = `
    <div class="card">
      <h2>📢 Announcements</h2>

      ${
        isAdmin
          ? `
          <form id="announcementForm">

            <label>Title</label>
            <input name="title" required>

            <label>Message</label>
            <textarea name="message" required></textarea>

            <label>Date</label>
            <input name="date" type="date">

            <button>Add Announcement</button>

          </form>
        `
          : ""
      }
    </div>

    <div id="announcementList"></div>
  `;

  drawAnnouncements();

  const form =
    document.getElementById("announcementForm");

  if (form) {
    form.addEventListener(
      "submit",
      addAnnouncement
    );
  }
}

function drawAnnouncements() {
  const container =
    document.getElementById("announcementList");

  if (!container) return;

  container.innerHTML =
    announcements.length
      ? announcements.map(item => `
        <div class="card">

          <h3>${escapeHTML(item.title)}</h3>

          <p>${escapeHTML(item.message)}</p>

          <small>
            ${escapeHTML(item.date || "")}
          </small>

          ${
            isAdmin
              ? `
                <br><br>
                <button
                  class="btn danger"
                  onclick="deleteAnnouncement(${item.id})"
                >
                  Delete
                </button>
              `
              : ""
          }

        </div>
      `).join("")
      : `
        <div class="card">
          No announcements available.
        </div>
      `;
}

async function addAnnouncement(event) {
  event.preventDefault();

  const data = Object.fromEntries(
    new FormData(event.target).entries()
  );

  try {
    await api("/api/announcements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    alert("Announcement added.");

    renderAnnouncements();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteAnnouncement(id) {
  if (!confirm("Delete announcement?")) return;

  try {
    await api(`/api/announcements/${id}`, {
      method: "DELETE"
    });

    renderAnnouncements();
  } catch (error) {
    alert(error.message);
  }
}

/* ---------------- PROJECTS ---------------- */

async function renderProjects() {
  projects = await api("/api/projects");

  app.innerHTML = `
    <div class="card">
      <h2>🚀 Engineering Project Ideas</h2>

      ${
        isAdmin
          ? `
          <form id="projectForm">

            <label>Project Title</label>
            <input name="title" required>

            <label>Description</label>
            <textarea name="description" required></textarea>

            <label>Technologies</label>
            <input name="technologies">

            <label>Difficulty</label>
            <select name="difficulty">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <button>Add Project</button>

          </form>
        `
          : ""
      }
    </div>

    <div id="projectList"></div>
  `;

  drawProjects();

  const form =
    document.getElementById("projectForm");

  if (form) {
    form.addEventListener(
      "submit",
      addProject
    );
  }
}

function drawProjects() {
  const container =
    document.getElementById("projectList");

  if (!container) return;

  container.innerHTML =
    projects.length
      ? projects.map(item => `
        <div class="card">

          <h3>${escapeHTML(item.title)}</h3>

          <span class="badge green">
            ${escapeHTML(item.difficulty)}
          </span>

          <p>${escapeHTML(item.description)}</p>

          <p>
            <b>Technologies:</b>
            ${escapeHTML(item.technologies)}
          </p>

          ${
            isAdmin
              ? `
              <button
                class="btn danger"
                onclick="deleteProject(${item.id})"
              >
                Delete
              </button>
            `
              : ""
          }

        </div>
      `).join("")
      : `
        <div class="card">
          No project ideas added yet.
        </div>
      `;
}

async function addProject(event) {
  event.preventDefault();

  const data = Object.fromEntries(
    new FormData(event.target).entries()
  );

  try {
    await api("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    alert("Project added.");

    renderProjects();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProject(id) {
  if (!confirm("Delete project?")) return;

  try {
    await api(`/api/projects/${id}`, {
      method: "DELETE"
    });

    renderProjects();
  } catch (error) {
    alert(error.message);
  }
}

/* ---------------- CALENDAR ---------------- */

function renderCalendar() {
  app.innerHTML = `
    <div class="card">
      <h2>📅 Academic Calendar</h2>

      <p>
        Add your university/college academic calendar
        information here.
      </p>

      <div class="notice">
        Keep examination dates, holidays, semester dates,
        practical exams and important academic events here.
      </div>
    </div>
  `;
}

/* ---------------- USEFUL LINKS ---------------- */

function renderUsefulLinks() {
  app.innerHTML = `
    <div class="card">
      <h2>🔗 Useful Engineering Links</h2>

      <div class="grid">

        <div class="card">
          <h3>VTU</h3>
          <a
            class="btn"
            href="https://vtu.ac.in/"
            target="_blank"
          >
            Open
          </a>
        </div>

        <div class="card">
          <h3>NPTEL</h3>
          <a
            class="btn"
            href="https://nptel.ac.in/"
            target="_blank"
          >
            Open
          </a>
        </div>

        <div class="card">
          <h3>SWAYAM</h3>
          <a
            class="btn"
            href="https://swayam.gov.in/"
            target="_blank"
          >
            Open
          </a>
        </div>

        <div class="card">
          <h3>GitHub</h3>
          <a
            class="btn"
            href="https://github.com/"
            target="_blank"
          >
            Open
          </a>
        </div>

      </div>
    </div>
  `;
}

/* ---------------- LOGIN ---------------- */

function renderLogin() {
  if (isAdmin) {
    return showPage("admin");
  }

  app.innerHTML = `
    <div class="card login-card">

      <h2>🔐 Creator / Admin Login</h2>

      <div class="notice">
        Students do not need to login.
        This login is only for the creator/admin.
      </div>

      <form id="loginForm">

        <label>Email</label>

        <input
          name="email"
          type="email"
          value="admin@college.com"
          required
        >

        <label>Password</label>

        <input
          name="password"
          type="password"
          placeholder="Enter admin password"
          required
        >

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  `;

  document
    .getElementById("loginForm")
    .addEventListener("submit", adminLogin);
}

async function adminLogin(event) {
  event.preventDefault();

  const data = Object.fromEntries(
    new FormData(event.target).entries()
  );

  try {
    const result = await api("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    adminToken = result.token;
    isAdmin = true;

    localStorage.setItem(
      "adminToken",
      adminToken
    );

    updateNavigation();

    alert("Admin login successful.");

    showPage("admin");
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  adminToken = null;
  isAdmin = false;

  localStorage.removeItem("adminToken");

  updateNavigation();

  showPage("home");
}

/* ---------------- ADMIN DASHBOARD ---------------- */

async function renderAdmin() {
  if (!isAdmin) {
    return showPage("login");
  }

  app.innerHTML = `
    <div class="hero">

      <h1>🔐 Creator / Admin Dashboard</h1>

      <p>
        Only the admin can add, edit or delete portal content.
      </p>

      <button
        class="btn secondary"
        onclick="logout()"
      >
        Logout
      </button>

    </div>

    <div class="grid">

      <div class="card">
        <h3>📚 Resources</h3>
        <p>Add, edit and delete learning resources.</p>
        <button onclick="showPage('library')">
          Manage Resources
        </button>
      </div>

      <div class="card">
        <h3>📢 Announcements</h3>
        <p>Manage college announcements.</p>
        <button onclick="showPage('announcements')">
          Manage
        </button>
      </div>

      <div class="card">
        <h3>🚀 Projects</h3>
        <p>Manage engineering project ideas.</p>
        <button onclick="showPage('projects')">
          Manage
        </button>
      </div>

      <div class="card">
        <h3>🎓 Public Portal</h3>
        <p>Students can access the portal without login.</p>
        <button onclick="showPage('home')">
          Open Portal
        </button>
      </div>

    </div>
  `;
}

/* ---------------- START ---------------- */

updateNavigation();
showPage("home");
