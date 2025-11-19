import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.js";
import linksRouter from "./routes/links.js";
import healthRouter from "./routes/health.js";
import redirectRouter from "./routes/redirect.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api/auth", authRouter);
app.use("/api/links", linksRouter);
app.use("/healthz", healthRouter);

// Redirect (catch-all for a single path segment) - place after API and static
app.use("/", redirectRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`TinyLink running on port ${port}`);
});
