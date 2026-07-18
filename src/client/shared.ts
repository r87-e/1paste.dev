// Browser runtime shared by the compose and open screens.
// Wrapped in String.raw so regexes and \n escapes reach the browser verbatim.
export const SHARED_JS = String.raw`
var $ = function(id){ return document.getElementById(id); };
var enc = new TextEncoder(), dec = new TextDecoder();
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var CIPHER_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var NOISE = "!<>-_/[]{}=+*^?#________ABCDEF0123456789";

function bufToB64u(buf){
  var b = new Uint8Array(buf), s = "";
  for (var i=0;i<b.length;i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function b64uToBuf(str){
  str = str.replace(/-/g,"+").replace(/_/g,"/");
  while (str.length % 4) str += "=";
  var bin = atob(str), b = new Uint8Array(bin.length);
  for (var i=0;i<bin.length;i++) b[i] = bin.charCodeAt(i);
  return b.buffer;
}
function fmtBytes(n){ return n < 1024 ? n + " B" : (n/1024).toFixed(1) + " KB"; }

async function deriveFromPass(pw, salt){
  var base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name:"PBKDF2", salt:salt, iterations:250000, hash:"SHA-256" },
    base, { name:"AES-GCM", length:256 }, false, ["encrypt","decrypt"]
  );
}

function fmtCountdown(ms){
  if (ms <= 0) return "00:00:00";
  var s = Math.floor(ms/1000);
  var d = Math.floor(s/86400);
  var h = String(Math.floor(s%86400/3600)).padStart(2,"0");
  var m = String(Math.floor(s%3600/60)).padStart(2,"0");
  var ss = String(s%60).padStart(2,"0");
  return (d>0 ? d+"d " : "") + h + ":" + m + ":" + ss;
}

var _toastT;
function toast(msg){
  var t = $("toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(_toastT); _toastT = setTimeout(function(){ t.classList.remove("show"); }, 1600);
}

function scramble(el, target, klass, done){
  var cap = 1400;
  var shown = target.length > cap ? target.slice(0,cap) + " … [" + (target.length-cap) + " more]" : target;
  if (klass) el.className = "readout " + klass;
  if (reduce){ el.textContent = shown; if(done) done(); return; }
  var chars = shown.split("");
  var lockAt = chars.map(function(_,i){ return Math.floor(i*0.55) + Math.random()*14; });
  var frame = 0;
  var glyphs = klass === "cipher" ? CIPHER_GLYPHS : NOISE;
  (function tick(){
    var out = "", settled = 0;
    for (var i=0;i<chars.length;i++){
      if (frame >= lockAt[i]){ out += chars[i]; settled++; }
      else if (chars[i] === "\n"){ out += "\n"; }
      else { out += glyphs[Math.floor(Math.random()*glyphs.length)]; }
    }
    el.textContent = out; frame++;
    if (settled < chars.length) requestAnimationFrame(tick);
    else if (done) done();
  })();
}

var _ticker = null;
function startTicker(exp){
  stopTicker();
  if (!exp) return;
  function paint(){
    var left = exp - Date.now();
    document.querySelectorAll("[data-cd]").forEach(function(e){ e.textContent = fmtCountdown(left); });
    if (left <= 0) stopTicker();
  }
  paint(); _ticker = setInterval(paint, 1000);
}
function stopTicker(){ if(_ticker){ clearInterval(_ticker); _ticker = null; } }
`;
