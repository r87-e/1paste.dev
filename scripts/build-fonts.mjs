// Regenerates src/views/fonts.ts by embedding the woff2 files as data URIs.
// Run after replacing any font in src/assets/fonts/.  Usage: npm run build:fonts
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b64 = (p) => readFileSync(join(root, p)).toString("base64");

const faces = [
  { family: "Chakra", weight: 700, file: "src/assets/fonts/chakra-700.woff2" },
  { family: "Chakra", weight: 500, file: "src/assets/fonts/chakra-500.woff2" },
  { family: "Stamp", weight: 400, file: "src/assets/fonts/stamp.woff2" },
];

const css = faces
  .map(
    (f) =>
      `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:swap;` +
      `src:url("data:font/woff2;base64,${b64(f.file)}") format("woff2");}`,
  )
  .join("\n");

const out = `// AUTO-GENERATED from src/assets/fonts/*.woff2. Do not edit by hand.
// Regenerate with: npm run build:fonts
export const FONT_CSS = \`
${css}
\`;
`;

writeFileSync(join(root, "src/views/fonts.ts"), out);
console.log("wrote src/views/fonts.ts");
