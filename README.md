# TinyLink (Express + Render + Neon)

This is a Tiny URL application with user accounts (signup/login), link creation, redirects, click counts, and stats.

## Run locally

1. Copy `.env.example` to `.env` and fill values (Neon DB, JWT secret, BASE_URL).
2. Create the DB schema (run `db/schema.sql` on your database).
3. Install and run:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

## Deploy to Render

1. Push this repo to GitHub.
2. Create a new Web Service on Render (Node).
3. Set Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Add environment variables (DATABASE_URL, JWT_SECRET, BASE_URL, NODE_ENV=production).
6. Provision and run. Run the SQL in `db/schema.sql` using Neon Console.

## API Endpoints (required for autograder)

- `GET /healthz` → { ok: true, version: '1.0' }
- `POST /api/auth/signup` → create user
- `POST /api/auth/login` → login
- `POST /api/auth/logout` → logout
- `POST /api/links` → create link (auth required)
- `GET /api/links` → list user's links (auth required)
- `GET /api/links/:code` → public stats
- `DELETE /api/links/:code` → delete (auth required & owner)
- `GET /:code` → redirect (302) or 404

```

---

### Notes & next steps

- The template uses HTTP-only cookies for auth. This helps security and keeps frontend simple.
- You can add an `/api/me` endpoint to expose user info if desired.
- Improve UX: inline validation, loaders, better error handling, sorting, search, and copy-to-clipboard.
- For tests: ensure endpoints and response structures match the spec.

---

**Done.** All files above are in this single document. Copy them into your repository and follow README to run locally and deploy to Render.
```
