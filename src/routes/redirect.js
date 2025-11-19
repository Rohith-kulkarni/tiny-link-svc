import { Router } from "express";
import { redirectHandler } from "../controllers/redirect.controller.js";

const router = Router();
router.get("/:code", redirectHandler);
export default router;
