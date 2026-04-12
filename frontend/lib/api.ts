/**
 * FastAPI base URL (no trailing slash).
 * Production: set NEXT_PUBLIC_API_URL in Vercel to your deployed API (Render, Railway, Fly.io, etc.).
 * Development: defaults to http://127.0.0.1:8000 if unset.
 */
export function getApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:8000";
  return "";
}

export function apiUrlErrorMessage(): string {
  return "Set NEXT_PUBLIC_API_URL in Vercel (Settings → Environment Variables) to your hosted FastAPI URL, then redeploy. Vercel only runs the Next.js app; deploy the Python API on Render, Railway, or similar.";
}
