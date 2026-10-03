import fs from "node:fs";
import path from "node:path";

const src = path.resolve("node_modules/pdfjs-dist/build");
const dest = path.resolve("vendor");
fs.mkdirSync(dest, {recursive:true});
for (const name of ["pdf.mjs","pdf.worker.mjs"]) {
  const from = path.join(src,name);
  const to = path.join(dest,name);
  if (!fs.existsSync(from)) throw new Error(`Missing ${from}. Run npm install first.`);
  fs.copyFileSync(from,to);
}
console.log("PDF.js runtime copied to vendor/");
