const express = require("express");
const path = require("node:path");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const jwtSecret = process.env.JWT_SECRET || "digital-closet-secret";
const users = new Map();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

function getToken(req) {
  return req.cookies?.token;
}

function getUserFromToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "2h" });
}

app.post("/api/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = String(email).toLowerCase();
  const existing = Array.from(users.values()).find((user) => user.email === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "Email is already registered." });
  }

  const id = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id, email: normalizedEmail, password: hashedPassword };
  users.set(id, user);

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ user: { id: user.id, email: user.email } });
});

app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = String(email).toLowerCase();
  const user = Array.from(users.values()).find((candidate) => candidate.email === normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 2 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ user: { id: user.id, email: user.email } });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(204).send();
});

app.get("/api/me", (req, res) => {
  const token = getToken(req);
  const payload = token ? getUserFromToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ user: { id: payload.id, email: payload.email } });
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, host, () => {
  console.log(`Digital Closet running at http://${host}:${port}`);
});
