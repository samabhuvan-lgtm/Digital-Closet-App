const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Store in-memory (consider using a database for production)
const users = new Map();

const jwtSecret = process.env.JWT_SECRET || "digital-closet-secret";

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "2h" });
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
  res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${2 * 60 * 60}`);

  res.json({ user: { id: user.id, email: user.email } });
}
