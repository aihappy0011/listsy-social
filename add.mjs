// Put a finished post/reel into the queue as "pending" (waits for owner's approval).
// Usage: node add.mjs <source-folder-or-mp4> <when, e.g. 2026-11-25T10:00> [caption.txt]
//   folder with slide-*.png|jpg + caption.txt -> carousel (or image if one slide); .mp4 -> reel
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sharp = createRequire("D:/Projects/SellerKit/package.json")("sharp");
const [src, when, capArg] = process.argv.slice(2);
if (!src || !when) throw new Error("usage: node add.mjs <folder|file.mp4> <YYYY-MM-DDTHH:MM> [caption.txt]");
const at = `${when.length === 16 ? when + ":00" : when}+05:30`;
if (Number.isNaN(Date.parse(at))) throw new Error(`bad time: ${when}`);

const isReel = src.endsWith(".mp4");
const id = `${when.slice(0, 16).replace(/[-:T]/g, "")}-${path.basename(src, ".mp4")}`;
const dir = path.join(HERE, "queue", id);
fs.mkdirSync(dir, { recursive: true });

let files;
if (isReel) {
  fs.copyFileSync(src, path.join(dir, "reel.mp4"));
  files = ["reel.mp4"];
} else {
  const slides = fs.readdirSync(src).filter((f) => /^slide-\d+\.(png|jpe?g)$/i.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  files = [];
  for (const [i, f] of slides.entries()) {
    const out = `${i + 1}.jpg`; // Instagram API takes JPEG only
    await sharp(path.join(src, f)).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toFile(path.join(dir, out));
    files.push(out);
  }
  // one contact sheet so the owner reviews the whole carousel in a single Telegram photo
  const w = 432, h = 540, cols = Math.min(4, files.length);
  const comps = await Promise.all(files.map(async (f, i) => ({ input: await sharp(path.join(dir, f)).resize(w, h).toBuffer(), left: (i % cols) * (w + 12), top: Math.floor(i / cols) * (h + 12) })));
  await sharp({ create: { width: cols * (w + 12), height: Math.ceil(files.length / cols) * (h + 12), channels: 3, background: "#333" } })
    .composite(comps).jpeg({ quality: 80 }).toFile(path.join(dir, "preview.jpg"));
}
const cap = capArg || (isReel ? null : path.join(src, "caption.txt"));
if (!cap || !fs.existsSync(cap)) throw new Error("caption.txt not found — pass it as 3rd argument");
fs.copyFileSync(cap, path.join(dir, "caption.txt"));

const qf = path.join(HERE, "queue.json");
const queue = fs.existsSync(qf) ? JSON.parse(fs.readFileSync(qf, "utf8")) : [];
const type = isReel ? "reel" : files.length === 1 ? "image" : "carousel";
queue.push({ id, at, type, files, status: "pending" });
fs.writeFileSync(qf, JSON.stringify(queue, null, 2) + "\n");
console.log(`Queued ${id} (${type}, ${files.length} files) — pending approval`);
