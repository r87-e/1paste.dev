import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import { newId, isValidId } from "../src/lib/id";

const enc = new TextEncoder();
const dec = new TextDecoder();
const b64u = (buf: ArrayBuffer) => {
  const b = new Uint8Array(buf);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64u = (str: string) => {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b.buffer;
};

const IV = "AAAAAAAAAAAAAAAA"; // 12 zero bytes, base64url
const CT = "U2VjcmV0LWNpcGhlcnRleHQ"; // arbitrary base64url

async function create(body: Record<string, unknown>) {
  const res = await SELF.fetch("https://1paste.dev/api/paste", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

describe("id helpers", () => {
  it("generates ids of the requested length in the safe alphabet", () => {
    const id = newId();
    expect(id).toHaveLength(10);
    expect(id).toMatch(/^[a-z2-9]+$/);
  });
  it("produces distinct ids", () => {
    const ids = new Set(Array.from({ length: 500 }, () => newId()));
    expect(ids.size).toBe(500);
  });
  it("validates ids", () => {
    expect(isValidId(newId())).toBe(true);
    expect(isValidId("abcdef")).toBe(true);
    expect(isValidId("BAD-ID")).toBe(false);
    expect(isValidId("l1o0")).toBe(false); // ambiguous chars + too short
    expect(isValidId("")).toBe(false);
  });
});

describe("api", () => {
  it("health responds ok", async () => {
    const res = await SELF.fetch("https://1paste.dev/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it("serves SSR home with SEO markup", async () => {
    const html = await (await SELF.fetch("https://1paste.dev/")).text();
    expect(html).toContain("Leave a secret");
    expect(html).toContain("application/ld+json");
    expect(html).toContain('rel="canonical"');
  });

  it("rejects malformed ciphertext and IV", async () => {
    expect((await create({ ct: "@@bad", iv: IV, burn: true, pw: false, expiresIn: 60 })).status).toBe(400);
    expect((await create({ ct: CT, iv: "short", burn: true, pw: false, expiresIn: 60 })).status).toBe(400);
  });

  it("requires a salt in passphrase mode and forbids it otherwise", async () => {
    expect((await create({ ct: CT, iv: IV, salt: null, burn: true, pw: true, expiresIn: 60 })).status).toBe(400);
    expect((await create({ ct: CT, iv: IV, salt: "AAAA", burn: true, pw: false, expiresIn: 60 })).status).toBe(400);
  });

  it("burns after a single read (atomic)", async () => {
    const { id } = await (await create({ ct: CT, iv: IV, salt: null, burn: true, pw: false, expiresIn: 60 })).json<{ id: string }>();
    // a GET on the receive page must NOT consume it
    expect((await SELF.fetch(`https://1paste.dev/s/${id}`)).status).toBe(200);
    expect((await SELF.fetch(`https://1paste.dev/s/${id}`)).status).toBe(200);
    // first open succeeds, second is gone
    expect((await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).status).toBe(200);
    expect((await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).status).toBe(410);
  });

  it("keeps a non-burn paste readable more than once", async () => {
    const { id } = await (await create({ ct: CT, iv: IV, salt: null, burn: false, pw: false, expiresIn: 60 })).json<{ id: string }>();
    expect((await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).status).toBe(200);
    expect((await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).status).toBe(200);
  });

  it("returns a gone page/response for unknown ids", async () => {
    expect((await SELF.fetch("https://1paste.dev/s/nope")).status).toBe(404);
    expect((await SELF.fetch("https://1paste.dev/api/paste/nope/open", { method: "POST" })).status).toBe(404);
  });

  it("redirects www to the apex", async () => {
    const res = await SELF.fetch("https://www.1paste.dev/", { redirect: "manual" });
    expect(res.status).toBe(301);
    expect(res.headers.get("location")).toBe("https://1paste.dev/");
  });

  it("exposes SEO + asset endpoints", async () => {
    expect((await SELF.fetch("https://1paste.dev/robots.txt")).status).toBe(200);
    expect((await SELF.fetch("https://1paste.dev/sitemap.xml")).status).toBe(200);
    const og = await SELF.fetch("https://1paste.dev/og.jpg");
    expect(og.headers.get("content-type")).toBe("image/jpeg");
  });
});

describe("end-to-end encryption", () => {
  it("round-trips: encrypt on client, store ciphertext, decrypt matches", async () => {
    const msg = "launch code: DEADDROP-2026 🔥\nsecond line";
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const keyB64 = b64u(await crypto.subtle.exportKey("raw", key));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(msg));

    const { id } = await (
      await create({ ct: b64u(ct), iv: b64u(iv.buffer), salt: null, burn: true, pw: false, expiresIn: 60 })
    ).json<{ id: string }>();

    const rec = await (await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).json<{ ct: string; iv: string }>();
    const key2 = await crypto.subtle.importKey("raw", unb64u(keyB64), "AES-GCM", false, ["decrypt"]);
    const pt = dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(unb64u(rec.iv)) }, key2, unb64u(rec.ct)));
    expect(pt).toBe(msg);
  });

  it("round-trips passphrase mode and rejects the wrong passphrase", async () => {
    const msg = "db password: p@ssw0rd-über";
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const derive = async (pw: string) => {
      const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    };
    const key = await derive("correct-horse");
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(msg));

    const { id } = await (
      await create({ ct: b64u(ct), iv: b64u(iv.buffer), salt: b64u(salt.buffer), burn: false, pw: true, expiresIn: 60 })
    ).json<{ id: string }>();
    const rec = await (await SELF.fetch(`https://1paste.dev/api/paste/${id}/open`, { method: "POST" })).json<{ ct: string; iv: string }>();

    const good = await derive("correct-horse");
    const pt = dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(unb64u(rec.iv)) }, good, unb64u(rec.ct)));
    expect(pt).toBe(msg);

    const bad = await derive("wrong-passphrase");
    await expect(crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(unb64u(rec.iv)) }, bad, unb64u(rec.ct))).rejects.toThrow();
  });
});
