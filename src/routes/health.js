import { Router } from "express";
const router = Router();
router.get("/healthz", (req, res) => {
  res.json({ ok: true, version: "1.0" });
});
export default router;
