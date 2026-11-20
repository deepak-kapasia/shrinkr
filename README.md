# Shrinkr

Shrinkr is a small URL shortener built with Node.js, Express, TypeScript, PostgreSQL, and raw SQL. It has one HTML page and no frontend framework.

## Setup

1. Install Node.js 18+ and PostgreSQL.
2. Create a PostgreSQL database named `url_shortener`.
3. Copy `.env.example` to `.env` and update `DATABASE_URL` if needed.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Create the table:

   ```bash
   npm run db:setup
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

Open <http://localhost:3000> in a browser.

## Scripts

- `npm run dev` compiles the frontend and starts the development server.
- `npm run build` compiles the server and frontend TypeScript into `dist/`.
- `npm start` runs the compiled server.
- `npm test` runs the unit tests.
- `npm run db:setup` runs `schema.sql` through the `pg` client.

## Production configuration

Set these environment variables in the production host:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://short.example.com
DATABASE_URL=postgres://user:password@db-host:5432/url_shortener
TRUST_PROXY=1
RATE_LIMIT_MAX=30
```

`BASE_URL` is the public address users should receive in API responses. `TRUST_PROXY=1` is appropriate when the app sits behind one reverse proxy or load balancer; increase it only when there are more trusted proxy layers. The app adds security headers with Helmet, limits JSON request size, disables the Express fingerprint header, uses a bounded PostgreSQL pool, and closes the HTTP server and database pool gracefully during shutdown.

Use a process manager or container platform to restart the process after failures, terminate it with `SIGTERM`, and provide HTTPS through a reverse proxy. The `/health` endpoint is a lightweight liveness check.

## API

### `POST /api/shorten`

Request body:

```json
{
  "url": "https://example.com/very/long/link",
  "alias": "my-link"
}
```

`url` must be an absolute `http` or `https` URL. `alias` is optional and may contain letters, numbers, hyphens, and underscores.

Successful response (`201`):

```json
{
  "shortUrl": "http://localhost:3000/aB3xYz",
  "code": "aB3xYz"
}
```

Invalid URLs return `400`. An alias that already exists returns `409`. Requests are limited to 30 per minute per IP.

### `GET /:code`

Increments the click count and redirects to the long URL with HTTP `302`. Unknown codes return `404`.

### `GET /api/stats/:code`

Returns:

```json
{
  "longUrl": "https://example.com/very/long/link",
  "clicks": 3,
  "createdAt": "2026-11-20T10:00:00.000Z"
}
```

## How it works

The shorten route validates the URL, chooses a custom alias or generates six random base62 characters, and inserts the record using a parameterized SQL query. PostgreSQL's unique constraint protects the `code` column. If a generated code collides, the server generates another one and retries a few times. A custom alias collision is returned as `409` because retrying would not preserve the requested alias.

The redirect route uses one `UPDATE ... RETURNING` query. That increments the click count and retrieves the destination atomically, then Express sends the redirect.

## Why `302` instead of `301`?

`302 Found` is temporary and gives the server flexibility to change or disable a short link later. Browsers and proxies cache `301 Moved Permanently` more aggressively, which can make future changes difficult to observe.
