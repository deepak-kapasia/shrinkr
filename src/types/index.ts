export interface LinkRow {
  id: number;
  code: string;
  long_url: string;
  clicks: number;
  created_at: Date;
}

export interface ShortenRequestBody {
  url: unknown;
  alias?: unknown;
}

export interface ShortenResponse {
  shortUrl: string;
  code: string;
}

export interface StatsResponse {
  longUrl: string;
  clicks: number;
  createdAt: Date;
}
