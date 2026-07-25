import type { NextFunction, Request, Response } from "express";
import { sendContactEmail } from "../lib/contactEmail";

function sanitize(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Lightweight in-memory rate limiter (per IP). Basic spam protection only.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: real users never fill this.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return res.status(400).json({ ok: false, error: "Invalid submission." });
  }

  const name = sanitize(body.name, 120);
  const email = sanitize(body.email, 160).toLowerCase();
  const phone = sanitize(body.phone, 40);
  // Keep newlines in the message (sanitize collapses them), so handle separately.
  const rawMessage = typeof body.message === "string" ? body.message : "";
  const message = rawMessage.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, 4000);

  const errors: string[] = [];
  if (name.length < 2) errors.push("Name is required");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required");
  if (message.length < 10) errors.push("Message must be at least 10 characters");

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  if (isRateLimited(req.ip ?? "unknown")) {
    return res.status(429).json({
      ok: false,
      error: "Too many messages. Please try again in a few minutes.",
    });
  }

  try {
    const sent = await sendContactEmail({ name, email, phone, message });
    if (!sent) {
      return res.status(502).json({
        ok: false,
        error: "Could not send your message right now. Please email contact@celeweevent.com directly.",
      });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    return next(error);
  }
}
