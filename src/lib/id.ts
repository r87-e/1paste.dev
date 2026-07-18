// URL-safe, unambiguous paste ids. No look-alike characters (0/O, 1/l/I).
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

export function newId(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function isValidId(id: string): boolean {
  return typeof id === "string" && id.length >= 6 && id.length <= 24 && /^[a-z2-9]+$/.test(id);
}
