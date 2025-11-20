import { pool } from "../db/pool.js";
import { isValidUrl, isValidCode } from "../utils/validator.js";
import crypto from "crypto";

function generateCode() {
  // generate 6-char alphanumeric
  return crypto
    .randomBytes(4)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 6);
}

export async function createLink(req, res) {
  const { targetUrl, code } = req.body || {};
  const userId = req.user?.id;

  if (!userId)
    return res.status(401).json({ error: "Authentication required" });
  if (!targetUrl)
    return res.status(400).json({ error: "targetUrl is required" });
  if (!isValidUrl(targetUrl))
    return res.status(400).json({ error: "Invalid URL" });

  let finalCode = code;
  if (finalCode) {
    if (!isValidCode(finalCode))
      return res
        .status(400)
        .json({ error: "Code must be 6–8 alphanumeric characters" });
    const exists = await pool.query("SELECT code FROM links WHERE code=$1", [
      finalCode,
    ]);
    if (exists.rowCount > 0)
      return res.status(409).json({ error: "Code already exists" });
  } else {
    // generate until unique (small loop)
    let tries = 0;
    do {
      finalCode = generateCode();
      const r = await pool.query("SELECT code FROM links WHERE code=$1", [
        finalCode,
      ]);
      if (r.rowCount === 0) break;
      tries++;
    } while (tries < 5);
  }
  const baseUrl = `${process.env.BASE_URL.replace(/\/$/, "")}/${finalCode}`;

  await pool.query(
    `INSERT INTO links (code, target_url, user_id, base_url, created_at)
   VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP);`,
    [finalCode, targetUrl, userId, baseUrl]
  );
  res.status(201).json({
    ok: true,
    code: finalCode,
    shortUrl: baseUrl,
  });
}

export async function listLinks(req, res) {
  const userId = req.user?.id;
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });

  const result = await pool.query(
    "SELECT code, target_url, clicks, last_clicked, created_at, base_url FROM links WHERE user_id=$1 ORDER BY created_at DESC",
    [userId]
  );
  res.json(result.rows);
}

export async function getLinkStats(req, res) {
  const { code } = req.params;
  const result = await pool.query(
    "SELECT code, target_url, clicks, last_clicked, created_at FROM links WHERE code=$1",
    [code]
  );
  console.log(result);
  if (result.rowCount === 0)
    return res.status(404).json({ error: "Not found" });
  res.json(result.rows[0]);
}

export async function deleteLink(req, res) {
  const { code } = req.params;
  const userId = req.user?.id;
  if (!userId)
    return res.status(401).json({ error: "Authentication required" });

  const result = await pool.query(
    "DELETE FROM links WHERE code=$1 AND user_id=$2 RETURNING code",
    [code, userId]
  );
  if (result.rowCount === 0)
    return res.status(404).json({ error: "Not found or not owned by user" });
  res.json({ ok: true });
}

export async function getDailyClicks(req, res) {
  const { code } = req.params;

  const result = await pool.query(
    `SELECT date_trunc('day', clicked_at) AS day,
            COUNT(*) AS clicks
     FROM link_clicks
     WHERE code = $1
     GROUP BY day
     ORDER BY day`,
    [code]
  );
  res.json(result.rows);
}

export async function getHourlyClicks(req, res) {
  const { code } = req.params;

  const result = await pool.query(
    `SELECT date_trunc('hour', clicked_at) AS hour,
            COUNT(*) AS clicks
     FROM link_clicks
     WHERE code = $1
     GROUP BY hour
     ORDER BY hour`,
    [code]
  );

  res.json(result.rows);
}
