import { Router } from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
dotenv.config();

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// NEW: Restore user from cookie on page refresh
router.get(`${process.env.BASE_URL}/me`, authRequired, (req, res) => {
  res.json({
    ok: true,
    user: req.user, // comes from authRequired middleware
  });
});

export default router;
