import { pool } from "./pool";
import { LinkRow } from "../types";

export async function insertLink(code: string, longUrl: string): Promise<LinkRow> {
  const result = await pool.query<LinkRow>(
    `
      INSERT INTO links (code, long_url)
      VALUES ($1, $2)
      RETURNING id, code, long_url, clicks, created_at
    `,
    [code, longUrl],
  );

  return result.rows[0];
}

export async function findLinkByCode(code: string): Promise<LinkRow | null> {
  const result = await pool.query<LinkRow>(
    `
      SELECT id, code, long_url, clicks, created_at
      FROM links
      WHERE code = $1
    `,
    [code],
  );

  return result.rows[0] ?? null;
}

/** Increment and return in one SQL statement to avoid losing clicks. */
export async function incrementClicks(code: string): Promise<LinkRow | null> {
  const result = await pool.query<LinkRow>(
    `
      UPDATE links
      SET clicks = clicks + 1
      WHERE code = $1
      RETURNING id, code, long_url, clicks, created_at
    `,
    [code],
  );

  return result.rows[0] ?? null;
}
