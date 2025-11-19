import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "tinylink_token";

export function authRequired(req, res, next) {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.headers["authorization"]?.replace(/^Bearer\s+/, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function setAuthCookie(res, token) {
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  res.cookie(process.env.JWT_COOKIE_NAME || COOKIE_NAME, token, cookieOpts);
}

export function clearAuthCookie(res) {
  res.clearCookie(process.env.JWT_COOKIE_NAME || COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
