import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import dotenv from "dotenv";
import {
  setAuthCookie,
  clearAuthCookie,
} from "../middleware/auth.middleware.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXP = "7d";

export async function signup(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password required" });

  const exists = await pool.query("SELECT id FROM users WHERE email=$1", [
    email,
  ]);
  if (exists.rowCount > 0)
    return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    "INSERT INTO users(name, email, password_hash) VALUES($1,$2,$3) RETURNING id, name, email, created_at",
    [name, email, hash]
  );
  const user = result.rows[0];

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXP }
  );
  setAuthCookie(res, token);
  res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const result = await pool.query(
    "SELECT id, name, email, password_hash FROM users WHERE email=$1",
    [email]
  );
  if (result.rowCount === 0)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXP }
  );
  setAuthCookie(res, token);
  res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function logout(req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}
