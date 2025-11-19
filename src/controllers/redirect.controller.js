import { pool } from "../db/pool.js";

export async function redirectHandler(req, res) {
  const code = req.params.code;
  const result = await pool.query(
    "SELECT target_url FROM links WHERE code=$1",
    [code]
  );
  if (result.rowCount === 0) return res.status(404).send("Not found");

  const link = result.rows[0];
  await pool.query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
    [code]
  );
  return res.redirect(302, link.target_url);
}
