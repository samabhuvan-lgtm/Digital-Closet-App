const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "digital-closet-secret";

function getUserFromToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies?.token;
  const payload = token ? getUserFromToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ user: { id: payload.id, email: payload.email } });
}
