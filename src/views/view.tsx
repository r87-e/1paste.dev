import type { FC } from "hono/jsx";

interface ViewProps {
  burn: boolean;
  pw: boolean;
  expiresAt: number | null;
  sizeLabel: string;
}

export const ViewPage: FC<ViewProps> = ({ burn, pw, expiresAt, sizeLabel }) => (
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
      <div class="console" id="view-open" style="margin-top:34px;">
        <div class="chrome">
          <span class="tag" id="open-tag"><span class="sq"></span>sealed dead-drop</span>
          <span class="meter" id="open-meter">{sizeLabel} sealed</span>
        </div>

        <div class="gate" id="gate">
          <div class="lock">🔒</div>
          <div class="eyebrow">a dead drop for you</div>
          <h2>Someone left you a secret</h2>
          <p id="gate-msg">
            {burn
              ? "Open it and it unlocks right here on your device, then it's gone for good. You get one look."
              : "Open it and it unlocks right here on your device. It stays readable until the timer runs out."}
          </p>
          <p class="reassure">Only you can open it. We never saw what's inside.</p>
          {expiresAt ? (
            <p class="note" style="margin-bottom:20px;">self-destructs in <span data-cd>-</span></p>
          ) : null}
          <div class={pw ? "pwrow show" : "pwrow show hidden"} id="open-pwrow" style="max-width:340px;margin:0 auto 18px;">
            <input type="password" id="open-pw" placeholder="Enter the shared passphrase" autocomplete="off" />
          </div>
          <button class="btn primary" id="decrypt" style="min-width:240px;">Reveal message</button>
          <p class="note" id="open-err" style="margin-top:16px;color:var(--ember);"></p>
        </div>

        <div class="buffer hidden" id="open-buffer">
          <div class="readout plain" id="plain-out"></div>
        </div>
        <div class="metastrip hidden" id="open-meta"></div>
        <div class="actions hidden" id="open-actions">
          <a class="btn ghost wide" href="/">← Leave your own dead drop</a>
        </div>
      </div>

      <div class="trust">
        <div class="cell"><span class="cdot"></span><div class="t"><b>Decrypted on your device.</b> The key never reached our servers, only your browser can read this.</div></div>
        <div class="cell"><span class="cdot"></span><div class="t"><b>Nobody else can see it.</b> Not us, not your network, not anyone who intercepts the link without the key.</div></div>
      </div>
    </main>

    <footer>
      <span class="fmono">1paste · end-to-end encrypted · open source · MIT</span>
      <span class="fmono"><a href="/">leave a dead drop</a></span>
    </footer>
  </div>
);
