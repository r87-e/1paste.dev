export const OPEN_JS = String.raw`
(function(){
  "use strict";
  var D = window.__DROP__ || {};
  var keyB64 = (location.hash || "").replace(/^#/, "") || null;
  var needPass = !!D.pw;
  if (D.expiresAt) startTicker(D.expiresAt);

  function gone(){
    $("gate").innerHTML =
      '<div class="lock">🕳️</div>' +
      '<div class="eyebrow">nothing here</div>' +
      '<h2>This drop is gone</h2>' +
      '<p>It was already opened, hit its self-destruct timer, or never existed. One-time links only work once.</p>' +
      '<a class="btn primary" href="/" style="min-width:220px;text-decoration:none;">Leave your own dead drop</a>';
    stopTicker();
  }

  function ashOut(el){
    if (reduce){ el.textContent = "░▒▓ this message has been destroyed ▓▒░"; el.style.color = "var(--ink-3)"; return; }
    var chars = el.textContent.split(""); var f = 0;
    (function fade(){
      var out = "";
      for (var i=0;i<chars.length;i++){ var c = chars[i]; out += (c === "\n") ? "\n" : (Math.random() < f/24 ? " " : (Math.random() < 0.5 ? "░" : "▒")); }
      el.textContent = out; el.style.color = "var(--ink-3)";
      if (f++ < 26) setTimeout(fade, 55); else el.textContent = "░▒▓ this message has been destroyed ▓▒░";
    })();
  }

  function reveal(text, burn){
    $("gate").classList.add("hidden");
    $("open-buffer").classList.remove("hidden");
    $("open-tag").innerHTML = '<span class="sq" style="background:var(--seal)"></span>decrypted · in your browser';
    stopTicker();
    scramble($("plain-out"), text, "plain", function(){
      if (burn){
        $("open-tag").innerHTML = '<span class="sq" style="background:var(--ember)"></span>read once · erased';
        $("open-meta").classList.remove("hidden");
        $("open-meta").innerHTML = '<span class="chip burn"><span class="sq"></span>destroyed, this link is now dead</span>';
        setTimeout(function(){ ashOut($("plain-out")); }, 2600);
      } else {
        $("open-meta").classList.remove("hidden");
        var bits = '<span class="chip"><span class="sq" style="background:var(--seal)"></span>readable until it expires</span>';
        if (D.expiresAt) bits += '<span class="chip time"><span class="sq"></span>self-destructs in <span data-cd>-</span></span>';
        $("open-meta").innerHTML = bits; startTicker(D.expiresAt);
      }
      $("open-actions").classList.remove("hidden");
    });
  }

  function decryptFlow(){
    var btn = $("decrypt"); var label = btn.textContent; btn.disabled = true; btn.textContent = "Opening…"; $("open-err").textContent = "";
    (async function(){
      try {
        var pw = needPass ? $("open-pw").value : null;
        if (needPass && !pw){ $("open-pw").focus(); btn.disabled=false; btn.textContent=label; return; }
        var res = await fetch("/api/paste/" + encodeURIComponent(D.id) + "/open", { method:"POST" });
        if (res.status === 410 || res.status === 404){ gone(); return; }
        if (!res.ok) throw new Error("net");
        var rec = await res.json();

        var iv = new Uint8Array(b64uToBuf(rec.iv));
        var key;
        if (rec.pw){
          if (!pw) throw new Error("needpass");
          key = await deriveFromPass(pw, new Uint8Array(b64uToBuf(rec.salt)));
        } else {
          if (!keyB64) throw new Error("nokey");
          key = await crypto.subtle.importKey("raw", b64uToBuf(keyB64), "AES-GCM", false, ["decrypt"]);
        }
        var ptBuf = await crypto.subtle.decrypt({ name:"AES-GCM", iv:iv }, key, b64uToBuf(rec.ct));
        reveal(dec.decode(ptBuf), rec.burn);
      } catch (e) {
        var map = {
          needpass: "This drop needs its passphrase.",
          nokey: "This link is missing its key. It may have been copied incompletely."
        };
        $("open-err").textContent = map[e.message] || "Wrong passphrase, or the message could not be opened.";
        btn.disabled = false; btn.textContent = label;
      }
    })();
  }

  var db = $("decrypt"); if (db) db.addEventListener("click", decryptFlow);
})();
`;
