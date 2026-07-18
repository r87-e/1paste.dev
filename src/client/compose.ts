export const COMPOSE_JS = String.raw`
(function(){
  "use strict";
  var input = $("input");
  function meterUpdate(){
    var n = input.value.length, bytes = enc.encode(input.value).length;
    $("meter").textContent = n.toLocaleString() + " chars · " + fmtBytes(bytes);
  }
  input.addEventListener("input", meterUpdate);

  function bindToggle(el, cb){
    function flip(){ var s = el.getAttribute("aria-pressed")==="true"; el.setAttribute("aria-pressed", String(!s)); if(cb) cb(!s); }
    el.addEventListener("click", flip);
    el.addEventListener("keydown", function(e){ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); flip(); } });
  }
  bindToggle($("burn"));
  bindToggle($("pwtoggle"), function(on){ $("pwrow").classList.toggle("show", on); if(!on) $("pw").value=""; });

  function show(view){
    ["view-compose","view-sealed"].forEach(function(v){ var el=$(v); if(el) el.classList.toggle("hidden", v!==view); });
    window.scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" });
  }

  function renderMeta(id, burn, pw, exp){
    var bits = [];
    if (burn) bits.push('<span class="chip burn"><span class="sq"></span>burns after one read</span>');
    else bits.push('<span class="chip"><span class="sq" style="background:var(--seal)"></span>readable until it expires</span>');
    if (pw) bits.push('<span class="chip"><span class="sq" style="background:var(--gold)"></span>passphrase required</span>');
    if (exp) bits.push('<span class="chip time"><span class="sq"></span>self-destructs in <span data-cd>-</span></span>');
    $(id).innerHTML = bits.join("");
  }

  async function seal(){
    var text = input.value;
    if (!text.trim()){ input.focus(); toast("nothing to seal"); return; }
    var pwOn = $("pwtoggle").getAttribute("aria-pressed")==="true";
    var pw = pwOn ? $("pw").value : "";
    if (pwOn && !pw){ $("pw").focus(); toast("set a passphrase"); return; }
    var minutes = parseInt($("expiry").value, 10);
    var burn = $("burn").getAttribute("aria-pressed")==="true";

    var btn = $("seal"); var label = btn.textContent; btn.disabled = true; btn.textContent = "Encrypting…";
    try {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      var key, saltB64 = null, keyB64 = null;
      if (pw){
        var salt = crypto.getRandomValues(new Uint8Array(16));
        key = await deriveFromPass(pw, salt); saltB64 = bufToB64u(salt.buffer);
      } else {
        key = await crypto.subtle.generateKey({ name:"AES-GCM", length:256 }, true, ["encrypt","decrypt"]);
        keyB64 = bufToB64u(await crypto.subtle.exportKey("raw", key));
      }
      var ctBuf = await crypto.subtle.encrypt({ name:"AES-GCM", iv:iv }, key, enc.encode(text));
      var body = { ct: bufToB64u(ctBuf), iv: bufToB64u(iv.buffer), salt: saltB64, burn: burn, pw: !!pw, expiresIn: minutes };

      var res = await fetch("/api/paste", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(body) });
      if (!res.ok){ var e = await res.json().catch(function(){ return {}; }); toast(e.error || "could not seal"); btn.disabled=false; btn.textContent=label; return; }
      var out = await res.json();

      var link = location.origin + "/s/" + out.id + (pw ? "" : "#" + keyB64);
      var exp = minutes ? Date.now() + minutes*60000 : null;

      show("view-sealed");
      $("sealed-size").textContent = fmtBytes(ctBuf.byteLength) + " sealed";
      scramble($("cipher-preview"), body.ct.replace(/(.{64})/g, "$1\n"), "cipher");
      $("cipher-full").textContent = "id       " + out.id + "\niv       " + body.iv + "\nsalt     " + (saltB64 || "none (key lives in the link fragment)") + "\nciphertext\n" + body.ct;
      $("link").value = link;
      $("open-link").href = link;
      renderMeta("metastrip", burn, !!pw, exp);
      startTicker(exp);
    } catch (err) {
      toast("encryption failed");
    }
    btn.disabled = false; btn.textContent = label;
  }

  $("seal").addEventListener("click", seal);

  $("copy").addEventListener("click", async function(){
    try { await navigator.clipboard.writeText($("link").value); toast("link copied"); }
    catch (e) { $("link").select(); document.execCommand("copy"); toast("link copied"); }
  });

  var shareBtn = $("share");
  if (shareBtn){
    if (navigator.share){
      shareBtn.addEventListener("click", async function(){
        try { await navigator.share({ title:"A dead drop for you", text:"I left you a one-time encrypted message:", url:$("link").value }); } catch (e) {}
      });
    } else { shareBtn.style.display = "none"; }
  }

  $("reset").addEventListener("click", function(){
    input.value = ""; meterUpdate(); stopTicker();
    $("pw").value = ""; $("pwtoggle").setAttribute("aria-pressed","false"); $("pwrow").classList.remove("show");
    show("view-compose"); input.focus();
  });

  meterUpdate();
})();
`;
