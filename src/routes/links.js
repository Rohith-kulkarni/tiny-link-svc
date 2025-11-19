import { Router } from "express";
import {
  createLink,
  listLinks,
  deleteLink,
  getLinkStats,
} from "../controllers/links.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/", authRequired, createLink);
router.get("/", authRequired, listLinks);
router.get("/:code", getLinkStats); // public stats
router.delete("/:code", authRequired, deleteLink);

export default router;
