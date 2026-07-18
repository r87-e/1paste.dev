import type { PasteDO } from "../do/paste";

export interface Env {
  PASTE: DurableObjectNamespace<PasteDO>;
  RATE: KVNamespace;
  ENVIRONMENT: string;
  SITE_URL: string;
  MAX_CIPHERTEXT_BYTES: string;
  RATE_CREATE_PER_MIN: string;
}

/**
 * What the server persists. Note there is no key and no plaintext here,
 * only the ciphertext and the parameters needed to decrypt it *on the client*.
 * With passphrase mode the salt is stored; the key itself is never sent.
 */
export interface StoredPaste {
  ct: string; // ciphertext, base64url
  iv: string; // AES-GCM IV, base64url
  salt: string | null; // PBKDF2 salt (passphrase mode), base64url
  burn: boolean; // delete on first successful open
  pw: boolean; // passphrase required (no key in link fragment)
  size: number; // ciphertext byte length
  createdAt: number; // epoch ms
  expiresAt: number | null; // epoch ms
}

/** Public metadata for the open screen. Never includes ciphertext. */
export interface PasteMeta {
  exists: boolean;
  burn: boolean;
  pw: boolean;
  size: number;
  expiresAt: number | null;
}

export interface CreateBody {
  ct: string;
  iv: string;
  salt?: string | null;
  burn: boolean;
  pw: boolean;
  expiresIn: number; // minutes; 0 = no expiry (still capped server-side)
}
