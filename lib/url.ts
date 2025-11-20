import crypto from "crypto";

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function generateUniqueSlug(): string {
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return uuid.slice(0, 5);
}
