export const STYLES = `
:root{
  color-scheme: dark;
  --bg:#07120F; --bg-2:#0C1A17; --bg-3:#0A1613;
  --line:#17322B; --line-2:#21463C;
  --ink:#E9F2EE; --ink-2:#8FA8A0; --ink-3:#5C726B;
  --ember:#FF5A24; --ember-2:#FF8A4C; --gold:#FFC44D; --seal:#37D0A6;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  --disp: "Chakra", "SF Pro Display", system-ui, sans-serif;
  --body: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
  --maxw: 500px; --radius: 26px; --radius-sm: 16px;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;min-height:100vh;overflow-x:hidden;}
.backdrop{position:fixed;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(70% 55% at 18% 12%,rgba(55,208,166,.10),transparent 60%),radial-gradient(65% 55% at 88% 8%,rgba(255,90,36,.09),transparent 62%),radial-gradient(80% 60% at 60% 115%,rgba(255,138,76,.07),transparent 60%),var(--bg);}
.grid{position:fixed;inset:-10%;z-index:-1;pointer-events:none;opacity:.55;background-image:radial-gradient(rgba(96,146,133,.22) 1.1px,transparent 1.2px);background-size:26px 26px;-webkit-mask-image:radial-gradient(120% 90% at 50% 10%,#000 20%,transparent 72%);mask-image:radial-gradient(120% 90% at 50% 10%,#000 20%,transparent 72%);animation:drift 26s ease-in-out infinite alternate;}
@keyframes drift{from{transform:translate3d(0,0,0);}to{transform:translate3d(14px,18px,0);}}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 20px;}

header{padding:26px 0 8px;}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;}
.mark{display:flex;align-items:baseline;gap:10px;}
.logo{font-family:var(--disp);font-weight:700;font-size:26px;letter-spacing:.02em;line-height:1;display:inline-flex;align-items:center;color:var(--ink);text-decoration:none;}
.logo .one{background:var(--ember);color:var(--bg);padding:0 6px;margin-right:1px;border-radius:7px;box-shadow:0 0 20px rgba(255,90,36,.35);}
.kicker{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);}
.status{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);border:1px solid var(--line-2);border-radius:12px;padding:7px 13px;white-space:nowrap;}
.dot{width:7px;height:7px;border-radius:50%;background:var(--seal);box-shadow:0 0 10px var(--seal);}
.dot.live{animation:pulse 2.4s ease-in-out infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

.hero{padding:34px 0 22px;}
h1{font-family:var(--disp);font-weight:700;font-size:clamp(30px,7vw,44px);line-height:1.04;letter-spacing:-.01em;margin:0 0 16px;text-wrap:balance;}
h1 .fade{color:var(--ink-2);} h1 .hot{color:var(--ember);}
.lede{font-size:16px;color:var(--ink-2);max-width:52ch;margin:0;} .lede b{color:var(--ink);font-weight:600;}

.console{background:linear-gradient(180deg,var(--bg-2),var(--bg-3));border:1px solid var(--line-2);border-radius:var(--radius);margin:26px 0 18px;box-shadow:0 30px 80px -40px rgba(0,0,0,.8),inset 0 1px 0 rgba(233,242,238,.03);overflow:hidden;position:relative;}
.stamp{position:absolute;bottom:16px;right:14px;z-index:3;font-family:"Stamp",var(--mono);font-size:14px;letter-spacing:.04em;color:var(--ember);border:1.5px solid var(--ember);border-radius:13px;padding:6px 13px;transform:rotate(-2deg);opacity:.62;text-transform:uppercase;box-shadow:inset 0 0 0 1px rgba(255,90,36,.25);pointer-events:none;mix-blend-mode:screen;}
.chrome{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line);background:rgba(7,18,15,.6);}
.tag{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-2);}
.tag.sealed{color:var(--seal);}
.tag .sq{width:8px;height:8px;border-radius:50%;background:var(--seal);}
.tag.sealed .sq{background:var(--seal);box-shadow:0 0 10px var(--seal);}
.meter{font-family:var(--mono);font-size:11px;color:var(--ink-3);letter-spacing:.04em;font-variant-numeric:tabular-nums;}

.buffer{position:relative;}
textarea,.readout{width:100%;border:0;resize:vertical;display:block;background:transparent;color:var(--ink);font-family:var(--mono);font-size:14.5px;line-height:1.7;padding:20px 16px;min-height:210px;letter-spacing:.01em;}
textarea{caret-color:var(--ember);}
textarea:focus{outline:none;}
textarea::placeholder{color:var(--ink-3);}
.readout{white-space:pre-wrap;word-break:break-word;min-height:210px;overflow-wrap:anywhere;}
.readout.cipher{color:var(--ember-2);font-size:13px;line-height:1.75;}
.readout.plain{color:var(--ink);}

.controls{border-top:1px solid var(--line);padding:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
.field{display:inline-flex;align-items:center;gap:8px;}
.lab{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);}
select{font-family:var(--mono);font-size:12.5px;color:var(--ink);background:var(--bg-3);border:1px solid var(--line-2);border-radius:12px;padding:9px 12px;cursor:pointer;}
select:focus{outline:2px solid var(--seal);outline-offset:1px;}
.toggle{display:inline-flex;align-items:center;gap:9px;cursor:pointer;user-select:none;}
.switch{width:38px;height:22px;border-radius:100px;background:var(--line-2);position:relative;transition:background .18s ease;flex:0 0 auto;}
.switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--ink-2);transition:transform .18s ease,background .18s ease;}
.toggle[aria-pressed="true"] .switch{background:var(--ember);}
.toggle[aria-pressed="true"] .switch::after{transform:translateX(16px);background:var(--bg);}
.toggle .lab{color:var(--ink-2);}
.pwrow{width:100%;display:none;}
.pwrow.show{display:flex;gap:8px;align-items:center;}
input[type="password"],input[type="text"].link{flex:1;min-width:0;font-family:var(--mono);font-size:13px;color:var(--ink);background:var(--bg-3);border:1px solid var(--line-2);border-radius:14px;padding:12px 14px;}
input:focus{outline:2px solid var(--seal);outline-offset:1px;}

.actions{border-top:1px solid var(--line);padding:14px;display:flex;flex-direction:column;gap:10px;}
.btn{font-family:var(--disp);font-weight:700;font-size:16px;letter-spacing:.005em;border:0;border-radius:16px;padding:16px 20px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;transition:transform .1s ease,filter .15s ease,background .15s ease,box-shadow .2s ease;}
.btn:active{transform:translateY(1px);}
.btn.primary{background:var(--ember);color:#1a0a04;box-shadow:0 0 40px -10px rgba(255,90,36,.6);}
.btn.primary:hover{filter:brightness(1.08);}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line-2);}
.btn.ghost:hover{border-color:var(--seal);color:var(--seal);}
.btn.wide{width:100%;}
.btn:disabled{opacity:.6;cursor:default;}
.btn:focus-visible{outline:2px solid var(--gold);outline-offset:2px;}
.note{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);text-align:center;letter-spacing:.02em;}
.note b{color:var(--seal);font-weight:400;}

.hidden{display:none !important;}
.linkrow{display:flex;gap:8px;align-items:stretch;padding:14px;border-top:1px solid var(--line);}
.metastrip{display:flex;flex-wrap:wrap;gap:8px;padding:0 14px 14px;}
.chip{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2);border:1px solid var(--line-2);border-radius:11px;padding:7px 12px;display:inline-flex;align-items:center;gap:7px;font-variant-numeric:tabular-nums;}
.chip.burn{color:var(--ember);border-color:rgba(255,90,36,.4);}
.chip.time{color:var(--gold);border-color:rgba(255,196,77,.35);}
.chip .sq{width:7px;height:7px;border-radius:50%;background:currentColor;}
details.reveal{border-top:1px solid var(--line);}
details.reveal summary{list-style:none;cursor:pointer;padding:12px 14px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);}
details.reveal summary::-webkit-details-marker{display:none;}
details.reveal summary:hover{color:var(--ink-2);}
details.reveal[open] summary{color:var(--seal);}
.cipherbox{padding:0 14px 16px;font-family:var(--mono);font-size:11.5px;color:var(--ink-3);word-break:break-all;line-height:1.7;max-height:150px;overflow:auto;}

.gate{padding:46px 22px 40px;text-align:center;}
.lock{font-size:44px;margin-bottom:10px;filter:drop-shadow(0 0 26px rgba(255,90,36,.45));animation:float 3.6s ease-in-out infinite;}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.gate .eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--seal);margin-bottom:10px;}
.gate h2{font-family:var(--disp);font-weight:700;font-size:27px;margin:0 0 12px;letter-spacing:.005em;text-wrap:balance;}
.gate p{color:var(--ink-2);font-size:14.5px;max-width:40ch;margin:0 auto 14px;}
.gate .reassure{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);margin:0 auto 24px;letter-spacing:.02em;display:flex;align-items:center;gap:8px;justify-content:center;}
.gate .reassure::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--seal);box-shadow:0 0 10px var(--seal);}

.trust{display:flex;flex-direction:column;gap:10px;margin:22px 0 8px;}
.cell{background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:15px 16px;display:flex;gap:13px;align-items:flex-start;}
.cdot{width:9px;height:9px;border-radius:50%;background:var(--seal);box-shadow:0 0 12px var(--seal);margin-top:5px;flex:0 0 auto;}
.cell .t{font-size:14px;color:var(--ink-2);line-height:1.5;} .cell .t b{color:var(--ink);font-weight:600;}

/* --- SEO content layer (crawlable, below the tool) --- */
.content{margin:40px 0 8px;}
.content h2{font-family:var(--disp);font-weight:700;font-size:22px;margin:0 0 14px;letter-spacing:.01em;}
.steps{display:flex;flex-direction:column;gap:12px;margin:0 0 12px;}
.step{display:flex;gap:13px;align-items:flex-start;}
.step .k{font-family:var(--mono);font-size:12px;color:var(--ember);border:1px solid rgba(255,90,36,.35);border-radius:9px;padding:3px 8px;flex:0 0 auto;}
.step .b{font-size:14px;color:var(--ink-2);line-height:1.5;} .step .b b{color:var(--ink);font-weight:600;}
.faq{display:flex;flex-direction:column;gap:10px;}
.faq details{background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);overflow:hidden;}
.faq summary{list-style:none;cursor:pointer;padding:15px 16px;font-family:var(--disp);font-weight:500;font-size:15px;color:var(--ink);display:flex;justify-content:space-between;gap:12px;align-items:center;}
.faq summary::-webkit-details-marker{display:none;}
.faq summary::after{content:"+";color:var(--seal);font-family:var(--mono);}
.faq details[open] summary::after{content:"–";}
.faq .a{padding:0 16px 16px;font-size:14px;color:var(--ink-2);line-height:1.55;}
.faq .a b{color:var(--ink);font-weight:600;}

footer{padding:26px 0 40px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);margin-top:32px;}
footer .fmono{font-family:var(--mono);font-size:11.5px;color:var(--ink-3);letter-spacing:.04em;}
footer a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid var(--line-2);}
footer a:hover{color:var(--seal);border-color:var(--seal);}

.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:var(--seal);color:#04120d;font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;padding:12px 20px;border-radius:14px;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;box-shadow:0 20px 50px -20px rgba(55,208,166,.7);z-index:50;text-transform:uppercase;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
a.textlink{color:var(--ink-2);font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-bottom:1px solid transparent;cursor:pointer;}
a.textlink:hover{color:var(--seal);border-color:var(--seal);}

@media(max-width:560px){
  h1{font-size:32px;}
  .wrap{padding:0 16px;}
  .kicker{display:none;}
  .bar{gap:10px;}
  .status{font-size:10px;letter-spacing:.1em;padding:6px 10px;}
  .chrome{flex-wrap:wrap;gap:4px 8px;}
  .tag{min-width:0;}
  .meter{font-size:10px;}
  .stamp{right:10px;font-size:11px;padding:5px 11px;}
  .lede{font-size:15px;}
  .controls{gap:12px 10px;}
}
@media (prefers-reduced-motion: reduce){*{animation-duration:.001ms !important;transition-duration:.001ms !important;}}
`;
