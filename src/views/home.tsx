import type { FC } from "hono/jsx";

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Can you read what I paste?",
    a: "No. Your text is encrypted in your browser with AES-256-GCM before anything is sent. We only ever receive ciphertext and never receive the key, so there is nothing on our servers we could read, hand over, or leak.",
  },
  {
    q: "Where does the encryption key go?",
    a: "Into the link itself, after the # symbol. Browsers never send the part after # to a server, so the key travels only inside the link you share. Whoever holds the link can decrypt; we cannot.",
  },
  {
    q: "What does burn after reading mean?",
    a: "The paste is destroyed the instant it is first opened and decrypted. The one-time link stops working immediately afterwards, so a message can only ever be read once.",
  },
  {
    q: "What if I want to send a password over the phone?",
    a: "Turn on passphrase mode. The key is derived from a word you choose instead of riding in the link, so you can text someone the link and say the passphrase out loud. Both are needed to open it.",
  },
  {
    q: "How long do pastes last?",
    a: "You pick an expiry from 5 minutes to 7 days. When the timer runs out the paste is erased automatically, whether or not it was ever opened.",
  },
  {
    q: "Is it open source?",
    a: "Yes, MIT licensed. You can read every line, verify the encryption for yourself, or deploy your own instance to Cloudflare Workers in a couple of minutes.",
  },
];

export const Home: FC = () => (
  <div class="wrap">
    <header>
      <div class="bar">
        <div class="mark">
          <a class="logo" href="/"><span class="one">1</span>paste</a>
          <span class="kicker">secrets that self-destruct</span>
        </div>
        <span class="status"><span class="dot live"></span>zero-knowledge</span>
      </div>
    </header>

    <main>
      <section class="hero">
        <h1>Leave a secret. <span class="fade">It reads</span> <span class="hot">once,</span> <span class="fade">then it's gone.</span></h1>
        <p class="lede">Write it below. It's encrypted <b>on your device</b>, turned into a one-time link, and erased the moment someone opens it. We never see a thing.</p>
      </section>

      {/* ---- compose ---- */}
      <div class="console" id="view-compose">
        <div class="chrome">
          <span class="tag"><span class="sq"></span>plaintext · local only</span>
          <span class="meter" id="meter">0 chars · 0 B</span>
        </div>
        <div class="buffer">
          <textarea id="input" spellcheck={false} placeholder="Type or paste the secret: a password, a key, a message, a log…"></textarea>
          <div class="stamp">burn after reading</div>
        </div>
        <div class="controls">
          <div class="field">
            <span class="lab">self-destruct</span>
            <select id="expiry" aria-label="Self-destruct timer">
              <option value="5">in 5 minutes</option>
              <option value="60">in 1 hour</option>
              <option value="1440" selected>in 24 hours</option>
              <option value="10080">in 7 days</option>
            </select>
          </div>
          <div class="toggle" id="burn" role="button" tabindex={0} aria-pressed="true">
            <span class="switch"></span><span class="lab">burn after one read</span>
          </div>
          <div class="toggle" id="pwtoggle" role="button" tabindex={0} aria-pressed="false">
            <span class="switch"></span><span class="lab">passphrase</span>
          </div>
          <div class="pwrow" id="pwrow">
            <input type="password" id="pw" placeholder="Shared passphrase. Say it out loud, never put it in the link" autocomplete="new-password" />
          </div>
        </div>
        <div class="actions">
          <button class="btn primary wide" id="seal">Encrypt &amp; seal</button>
          <p class="note">The key <b>never leaves this tab</b>. It rides in the link's <b>#fragment</b>, which browsers don't send to servers.</p>
        </div>
      </div>

      {/* ---- sealed ---- */}
      <div class="console hidden" id="view-sealed">
        <div class="chrome">
          <span class="tag sealed"><span class="sq"></span>ciphertext · sealed · aes-256-gcm</span>
          <span class="meter" id="sealed-size">-</span>
        </div>
        <div class="buffer">
          <div class="readout cipher" id="cipher-preview"></div>
        </div>
        <div class="linkrow">
          <input type="text" class="link" id="link" readonly value="" aria-label="One-time link" />
          <button class="btn primary" id="copy" style="padding:0 18px;">Copy</button>
        </div>
        <div class="metastrip" id="metastrip"></div>
        <details class="reveal">
          <summary>▾ inspect stored ciphertext (what the server actually holds)</summary>
          <div class="cipherbox" id="cipher-full"></div>
        </details>
        <div class="actions">
          <button class="btn ghost wide" id="share">Send via…</button>
          <a class="btn ghost wide" id="open-link" href="#">Open it yourself</a>
          <button class="btn ghost wide" id="reset">Seal another</button>
        </div>
      </div>

      <div class="trust">
        <div class="cell"><span class="cdot"></span><div class="t"><b>Encrypted on your device.</b> Your words never travel as text, only sealed bytes leave.</div></div>
        <div class="cell"><span class="cdot"></span><div class="t"><b>We can't read it.</b> No key ever reaches us, so a leak or a subpoena finds nothing.</div></div>
        <div class="cell"><span class="cdot"></span><div class="t"><b>One read, then it's ash.</b> The drop erases itself the moment it's opened.</div></div>
      </div>

      {/* ---- crawlable content ---- */}
      <section class="content">
        <h2>How 1paste works</h2>
        <div class="steps">
          <div class="step"><span class="k">01</span><div class="b"><b>You encrypt.</b> Your note is sealed with AES-256-GCM inside your browser. The plaintext never touches the network.</div></div>
          <div class="step"><span class="k">02</span><div class="b"><b>We store ciphertext.</b> Only the encrypted blob reaches us, with no key attached. A one-time link is created and handed back to you.</div></div>
          <div class="step"><span class="k">03</span><div class="b"><b>They read once.</b> The recipient opens the link, it decrypts on their device, and a burn-after-read secret is destroyed on the spot.</div></div>
        </div>
      </section>

      <section class="content">
        <h2>Frequently asked questions</h2>
        <div class="faq">
          {FAQ.map((f) => (
            <details>
              <summary>{f.q}</summary>
              <div class="a">{f.a}</div>
            </details>
          ))}
        </div>
      </section>
    </main>

    <footer>
      <span class="fmono">1paste · end-to-end encrypted · open source · MIT</span>
      <span class="fmono"><a href="https://github.com/r87-e/1paste.dev">source on github</a></span>
    </footer>
  </div>
);
