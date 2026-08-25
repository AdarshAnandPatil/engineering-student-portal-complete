const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

const dataDir = path.join(__dirname, "data");
const publicDir = path.join(__dirname, "public");

fs.mkdirSync(dataDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

const resourcesFile = path.join(dataDir, "resources.json");
const announcementsFile = path.join(dataDir, "announcements.json");
const projectsFile = path.join(dataDir, "projects.json");

function read(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ---------------- DEFAULT DATA ---------------- */

if (!fs.existsSync(resourcesFile)) {
  write(resourcesFile, [
    {
      id: 1,
      type: "Coding",
      title: "GeeksforGeeks",
      description: "DSA, programming and interview preparation.",
      url: "https://www.geeksforgeeks.org/"
    },
    {
      id: 2,
      type: "Coding",
      title: "LeetCode",
      description: "Coding problems and interview practice.",
      url: "https://leetcode.com/"
    },
    {
      id: 3,
      type: "Coding",
      title: "HackerRank",
      description: "Programming, SQL and interview practice.",
      url: "https://www.hackerrank.com/"
    },
    {
      id: 4,
      type: "Learning",
      title: "freeCodeCamp",
      description: "Free programming and web development courses.",
      url: "https://www.freecodecamp.org/"
    },
    {
      id: 5,
      type: "Learning",
      title: "NPTEL",
      description: "Engineering courses from IITs and IISc.",
      url: "https://nptel.ac.in/"
    },
    {
      id: 6,
      type: "Learning",
      title: "SWAYAM",
      description: "Online courses and learning resources.",
      url: "https://swayam.gov.in/"
    },
    {
      id: 7,
      type: "Aptitude",
      title: "IndiaBix",
      description: "Quantitative aptitude, reasoning and verbal practice.",
      url: "https://www.indiabix.com/"
    },
    {
      id: 8,
      type: "Technical",
      title: "Programiz",
      description: "Programming tutorials and examples.",
      url: "https://www.programiz.com/"
    },
    {
      id: 9,
      type: "Technical",
      title: "W3Schools",
      description: "Web, SQL, programming and reference tutorials.",
      url: "https://www.w3schools.com/"
    },
    {
      id: 10,
      type: "Interview",
      title: "InterviewBit",
      description: "Coding and interview preparation resources.",
      url: "https://www.interviewbit.com/"
    }
  ]);
}

if (!fs.existsSync(announcementsFile)) {
  write(announcementsFile, []);
}

if (!fs.existsSync(projectsFile)) {
  write(projectsFile, []);
}

/* ---------------- ADMIN LOGIN ---------------- */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@college.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    if (
      email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid admin login."
      });
    }

    const token = jwt.sign(
      {
        email: ADMIN_EMAIL,
        role: "admin"
      },
      JWT_SECRET,
      {
        expiresIn: "12h"
      }
    );

    res.json({
      message: "Admin login successful.",
      token,
      user: {
        email: ADMIN_EMAIL,
        role: "admin"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed."
    });
  }
});

/* ---------------- AUTH MIDDLEWARE ---------------- */

function adminOnly(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Admin login required."
    });
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required."
      });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Admin session expired. Please login again."
    });
  }
}

/* ---------------- RESOURCES ---------------- */

/* Public - VIEW */
app.get("/api/resources", (req, res) => {
  const type = String(req.query.type || "").toLowerCase();

  let data = read(resourcesFile);

  if (type) {
    data = data.filter(
      item => String(item.type).toLowerCase() === type
    );
  }

  res.json(data);
});

/* Admin - ADD */
app.post("/api/resources", adminOnly, (req, res) => {
  const {
    type,
    title,
    description = "",
    url
  } = req.body;

  if (!type || !title || !url) {
    return res.status(400).json({
      message: "Type, title and URL are required."
    });
  }

  const data = read(resourcesFile);

  const item = {
    id: Date.now(),
    type: String(type).trim(),
    title: String(title).trim(),
    description: String(description).trim(),
    url: String(url).trim()
  };

  data.push(item);
  write(resourcesFile, data);

  res.json({
    message: "Resource added successfully.",
    item
  });
});

/* Admin - EDIT */
app.put("/api/resources/:id", adminOnly, (req, res) => {
  const data = read(resourcesFile);

  const index = data.findIndex(
    item => String(item.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Resource not found."
    });
  }

  const old = data[index];

  data[index] = {
    ...old,
    type: req.body.type ?? old.type,
    title: req.body.title ?? old.title,
    description: req.body.description ?? old.description,
    url: req.body.url ?? old.url
  };

  write(resourcesFile, data);

  res.json({
    message: "Resource updated successfully.",
    item: data[index]
  });
});

/* Admin - DELETE */
app.delete("/api/resources/:id", adminOnly, (req, res) => {
  const data = read(resourcesFile);

  const newData = data.filter(
    item => String(item.id) !== String(req.params.id)
  );

  write(resourcesFile, newData);

  res.json({
    message: "Resource deleted successfully."
  });
});

/* ---------------- ANNOUNCEMENTS ---------------- */

/* Public - VIEW */
app.get("/api/announcements", (req, res) => {
  res.json(read(announcementsFile));
});

/* Admin - ADD */
app.post("/api/announcements", adminOnly, (req, res) => {
  const {
    title,
    message,
    date = ""
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      message: "Title and message are required."
    });
  }

  const data = read(announcementsFile);

  const item = {
    id: Date.now(),
    title: String(title).trim(),
    message: String(message).trim(),
    date: date || new Date().toISOString().slice(0, 10)
  };

  data.unshift(item);
  write(announcementsFile, data);

  res.json({
    message: "Announcement added successfully.",
    item
  });
});

/* Admin - DELETE */
app.delete("/api/announcements/:id", adminOnly, (req, res) => {
  const data = read(announcementsFile);

  write(
    announcementsFile,
    data.filter(
      item => String(item.id) !== String(req.params.id)
    )
  );

  res.json({
    message: "Announcement deleted successfully."
  });
});

/* ---------------- PROJECTS ---------------- */

/* Public - VIEW */
app.get("/api/projects", (req, res) => {
  res.json(read(projectsFile));
});

/* Admin - ADD */
app.post("/api/projects", adminOnly, (req, res) => {
  const {
    title,
    description,
    technologies = "",
    difficulty = "Beginner"
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: "Title and description are required."
    });
  }

  const data = read(projectsFile);

  const item = {
    id: Date.now(),
    title: String(title).trim(),
    description: String(description).trim(),
    technologies: String(technologies).trim(),
    difficulty: String(difficulty).trim()
  };

  data.unshift(item);
  write(projectsFile, data);

  res.json({
    message: "Project added successfully.",
    item
  });
});

/* Admin - EDIT */
app.put("/api/projects/:id", adminOnly, (req, res) => {
  const data = read(projectsFile);

  const index = data.findIndex(
    item => String(item.id) === String(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Project not found."
    });
  }

  const old = data[index];

  data[index] = {
    ...old,
    title: req.body.title ?? old.title,
    description: req.body.description ?? old.description,
    technologies: req.body.technologies ?? old.technologies,
    difficulty: req.body.difficulty ?? old.difficulty
  };

  write(projectsFile, data);

  res.json({
    message: "Project updated successfully.",
    item: data[index]
  });
});

/* Admin - DELETE */
app.delete("/api/projects/:id", adminOnly, (req, res) => {
  const data = read(projectsFile);

  write(
    projectsFile,
    data.filter(
      item => String(item.id) !== String(req.params.id)
    )
  );

  res.json({
    message: "Project deleted successfully."
  });
});

/* ---------------- HEALTH ---------------- */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Engineering Student Portal is running."
  });
});

/* ---------------- WEBSITE ---------------- */

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

/* ---------------- SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Portal running on port ${PORT}`);
});
