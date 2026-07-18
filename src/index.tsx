import { Hono } from "hono";
import type { Env, StoredPaste, CreateBody } from "./lib/types";
import { newId, isValidId } from "./lib/id";
import { Shell } from "./views/layout";
import { Home, FAQ } from "./views/home";
import { ViewPage } from "./views/view";
import { SHARED_JS } from "./client/shared";
import { COMPOSE_JS } from "./client/compose";
import { OPEN_JS } from "./client/open";
import { PasteDO } from "./do/paste";
import { OG_JPG_B64, APPLE_ICON_B64 } from "./assets/binaries";

const B64URL = /^[A-Za-z0-9_-]+$/;
const EXPIRY_MINUTES = new Set([5, 60, 1440, 10080]);
const IV_B64_LEN = 16; // 12 bytes, base64url, no padding

const app = new Hono<{ Bindings: Env }>();

// Canonical host: send www.1paste.dev → 1paste.dev (301). No-op on workers.dev.
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    return c.redirect(url.toString(), 301);
  }
  return next();
});

function siteUrl(env: Env): string {
  return env.SITE_URL || "https://1paste.dev";
}
function fmtBytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}
function ctBytes(ct: string): number {
  return Math.floor((ct.length * 3) / 4);
}

function render(html: unknown): string {
  return "<!doctype html>" + String(html);
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function rateOk(env: Env, ip: string): Promise<boolean> {
  if (!env.RATE) return true;
  const limit = parseInt(env.RATE_CREATE_PER_MIN || "20", 10);
  const bucket = Math.floor(Date.now() / 60000);
  const key = `rl:${ip}:${bucket}`;
  const cur = parseInt((await env.RATE.get(key)) || "0", 10);
  if (cur >= limit) return false;
  await env.RATE.put(key, String(cur + 1), { expirationTtl: 120 });
  return true;
}

/* ------------------------------- home ------------------------------- */
app.get("/", (c) => {
  const url = siteUrl(c.env);
  const title = "1paste: encrypted, one-time secret sharing that self-destructs";
  const description =
    "Share passwords, keys and messages with a link that self-destructs. End-to-end encrypted in your browser with AES-256-GCM. Zero-knowledge, burn-after-reading, open source.";

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "1paste",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    url: url,
    description: description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return c.html(
    render(
      <Shell
        title={title}
        description={description}
        canonical={url + "/"}
        siteUrl={url}
        jsonLd={[softwareLd, faqLd]}
        scripts={SHARED_JS + COMPOSE_JS}
      >
        <Home />
      </Shell>,
    ),
  );
});

/* ---------------------------- create paste --------------------------- */
app.post("/api/paste", async (c) => {
  const ip = c.req.header("cf-connecting-ip") || "anon";
  if (!(await rateOk(c.env, ip))) {
    return c.json({ error: "Too many pastes. Give it a minute." }, 429);
  }

  let body: CreateBody;
  try {
    body = await c.req.json<CreateBody>();
  } catch {
    return c.json({ error: "Malformed request." }, 400);
  }

  const { ct, iv } = body;
  const salt = body.salt ?? null;
  const burn = !!body.burn;
  const pw = !!body.pw;

  if (typeof ct !== "string" || !B64URL.test(ct)) return c.json({ error: "Bad ciphertext." }, 400);
  if (typeof iv !== "string" || !B64URL.test(iv) || iv.length !== IV_B64_LEN) return c.json({ error: "Bad IV." }, 400);
  if (pw) {
    if (typeof salt !== "string" || !B64URL.test(salt)) return c.json({ error: "Bad salt." }, 400);
  } else if (salt !== null) {
    return c.json({ error: "Unexpected salt." }, 400);
  }

  const max = parseInt(c.env.MAX_CIPHERTEXT_BYTES || "262144", 10);
  const size = ctBytes(ct);
  if (size > max) return c.json({ error: "Too large. Max 256 KB." }, 413);

  const minutes = EXPIRY_MINUTES.has(body.expiresIn) ? body.expiresIn : 1440;
  const now = Date.now();
  const stored: StoredPaste = {
    ct,
    iv,
    salt,
    burn,
    pw,
    size,
    createdAt: now,
    expiresAt: now + minutes * 60_000,
  };

  // Retry a couple of times in the astronomically unlikely event of an id clash.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newId();
    const stub = c.env.PASTE.get(c.env.PASTE.idFromName(id));
    const meta = await stub.meta();
    if (meta.exists) continue;
    await stub.create(stored);
    return c.json({ id });
  }
  return c.json({ error: "Could not allocate a link, try again." }, 500);
});

/* --------------------------- open (receive) -------------------------- */
app.get("/s/:id", async (c) => {
  c.header("cache-control", "no-store, no-cache, must-revalidate");
  const id = c.req.param("id");
  const url = siteUrl(c.env);
  if (!isValidId(id)) {
    return c.html(render(<GonePage url={url} />), 404);
  }
  const stub = c.env.PASTE.get(c.env.PASTE.idFromName(id));
  const meta = await stub.meta();
  if (!meta.exists) {
    return c.html(render(<GonePage url={url} />), 404);
  }

  const drop = JSON.stringify({ id, burn: meta.burn, pw: meta.pw, expiresAt: meta.expiresAt });
  const scripts = `window.__DROP__=${drop};\n` + SHARED_JS + OPEN_JS;

  return c.html(
    render(
      <Shell
        title="A dead drop for you · 1paste"
        description="Someone left you a one-time encrypted message."
        canonical={`${url}/s/${id}`}
        siteUrl={url}
        robots="noindex, nofollow"
        scripts={scripts}
      >
        <ViewPage burn={meta.burn} pw={meta.pw} expiresAt={meta.expiresAt} sizeLabel={fmtBytes(meta.size)} />
      </Shell>,
    ),
  );
});

/* --------------------- open API: atomic read+burn -------------------- */
app.post("/api/paste/:id/open", async (c) => {
  c.header("cache-control", "no-store");
  const id = c.req.param("id");
  if (!isValidId(id)) return c.json({ error: "gone" }, 404);
  const stub = c.env.PASTE.get(c.env.PASTE.idFromName(id));
  const paste = await stub.open();
  if (!paste) return c.json({ error: "gone" }, 410);
  return c.json({ ct: paste.ct, iv: paste.iv, salt: paste.salt, pw: paste.pw, burn: paste.burn });
});

/* ------------------------------ misc/SEO ----------------------------- */
app.get("/favicon.svg", (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#07120F"/><rect x="18" y="18" width="64" height="64" rx="16" fill="#FF5A24"/><text x="50" y="72" font-family="Menlo,monospace" font-size="58" font-weight="700" text-anchor="middle" fill="#07120F">1</text></svg>`;
  return c.body(svg, 200, { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" });
});

app.get("/og.jpg", (c) =>
  c.body(b64ToBytes(OG_JPG_B64), 200, { "content-type": "image/jpeg", "cache-control": "public, max-age=604800" }),
);

app.get("/apple-touch-icon.png", (c) =>
  c.body(b64ToBytes(APPLE_ICON_B64), 200, { "content-type": "image/png", "cache-control": "public, max-age=604800" }),
);

app.get("/robots.txt", (c) => {
  const url = siteUrl(c.env);
  const body = `User-agent: *\nAllow: /$\nDisallow: /s/\nDisallow: /api/\nSitemap: ${url}/sitemap.xml\n`;
  return c.body(body, 200, { "content-type": "text/plain" });
});

app.get("/sitemap.xml", (c) => {
  const url = siteUrl(c.env);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`;
  return c.body(body, 200, { "content-type": "application/xml" });
});

app.get("/api/health", (c) => c.json({ ok: true, service: "1paste" }));

app.notFound((c) => c.html(render(<GonePage url={siteUrl(c.env)} />), 404));

/* ------------------------------ gone page ---------------------------- */
function GonePage({ url }: { url: string }) {
  return (
    <Shell
      title="Nothing here · 1paste"
      description="This one-time link has expired, been opened, or never existed."
      canonical={url + "/"}
      siteUrl={url}
      robots="noindex, nofollow"
    >
      <div class="wrap">
        <header>
          <div class="bar">
            <div class="mark">
              <a class="logo" href="/"><span class="one">1</span>paste</a>
              <span class="kicker">secrets that self-destruct</span>
            </div>
          </div>
        </header>
        <main>
          <div class="console" style="margin-top:34px;">
            <div class="gate">
              <div class="lock">🕳️</div>
              <div class="eyebrow">nothing here</div>
              <h2>This drop is gone</h2>
              <p>It was already opened, hit its self-destruct timer, or never existed. One-time links only work once.</p>
              <a class="btn primary" href="/" style="min-width:220px;text-decoration:none;">Leave your own dead drop</a>
            </div>
          </div>
        </main>
      </div>
    </Shell>
  );
}

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext) {
    // Durable Object alarms expire pastes on their own; this cron is a safety net.
  },
};

export { PasteDO };
