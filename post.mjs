// Instagram auto-poster: publishes the next due + approved item from queue.json via the official Instagram API.
// Env: IG_TOKEN (long-lived Instagram token, GitHub secret), MEDIA_BASE (public URL of this repo, e.g. https://<user>.github.io/<repo>)
// Usage: node post.mjs [--dry-run]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { alert } from "./gh.mjs";

const API = "https://graph.instagram.com/v23.0";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(HERE, "queue.json");

export function nextDue(queue, now = Date.now()) {
  return queue
    .filter((p) => p.status === "approved" && Date.parse(p.at) <= now)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
}

// Instagram rules: images JPEG, carousel 2-10 items, reel = one mp4, caption <= 2200 chars, <= 30 hashtags.
export function problems(p, caption, exists = (f) => fs.existsSync(path.join(HERE, "queue", p.id, f))) {
  const out = [];
  const n = p.files?.length || 0;
  if (p.type === "reel" && (n !== 1 || !p.files[0].endsWith(".mp4"))) out.push("reel needs exactly one .mp4");
  if (p.type === "carousel" && (n < 2 || n > 10)) out.push("carousel needs 2-10 images");
  if (p.type === "image" && n !== 1) out.push("image needs one file");
  if (p.type !== "reel" && p.files?.some((f) => !/\.jpe?g$/i.test(f))) out.push("images must be .jpg");
  for (const f of p.files || []) if (!exists(f)) out.push(`missing file ${f}`);
  if (caption.length > 2200) out.push("caption over 2200 chars");
  if ((caption.match(/#/g) || []).length > 30) out.push("more than 30 hashtags");
  return out;
}

async function call(route, params = {}, method = "POST") {
  const body = new URLSearchParams({ ...params, access_token: process.env.IG_TOKEN });
  const res = method === "GET" ? await fetch(`${API}${route}?${body}`) : await fetch(API + route, { method, body });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) throw new Error(`${route}: ${j.error?.message || res.status}`);
  return j;
}

async function waitReady(id) {
  for (let i = 0; i < 40; i++) {
    const { status_code } = await call(`/${id}`, { fields: "status_code" }, "GET");
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`container ${id}: ${status_code}`);
    await new Promise((r) => setTimeout(r, 15000));
  }
  throw new Error(`container ${id}: not ready after 10 min`);
}

async function publish(p, caption) {
  const { user_id } = await call("/me", { fields: "user_id" }, "GET");
  const url = (f) => `${process.env.MEDIA_BASE.replace(/\/$/, "")}/queue/${p.id}/${f}`;
  const media = (params) => call(`/${user_id}/media`, params);
  let id;
  if (p.type === "reel") {
    ({ id } = await media({ media_type: "REELS", video_url: url(p.files[0]), caption, share_to_feed: "true" }));
  } else if (p.type === "image") {
    ({ id } = await media({ image_url: url(p.files[0]), caption }));
  } else {
    const kids = [];
    for (const f of p.files) kids.push((await media({ image_url: url(f), is_carousel_item: "true" })).id);
    for (const k of kids) await waitReady(k);
    ({ id } = await media({ media_type: "CAROUSEL", children: kids.join(","), caption }));
  }
  await waitReady(id);
  return (await call(`/${user_id}/media_publish`, { creation_id: id })).id;
}

async function main() {
  const dry = process.argv.includes("--dry-run");
  const queue = JSON.parse(fs.readFileSync(QUEUE, "utf8"));
  const p = nextDue(queue);
  if (!p) return console.log("Nothing due.");
  const caption = fs.readFileSync(path.join(HERE, "queue", p.id, "caption.txt"), "utf8").trim();
  const bad = problems(p, caption);
  if (dry) return console.log(`Would post ${p.id} (${p.type}, ${p.files.length} files)`, bad.length ? bad : "OK");
  if (!process.env.IG_TOKEN || !process.env.MEDIA_BASE) throw new Error("IG_TOKEN / MEDIA_BASE not set");
  try {
    if (bad.length) throw new Error(bad.join("; "));
    p.igId = await publish(p, caption);
    p.status = "posted";
    p.postedAt = new Date().toISOString();
    console.log(`Posted ${p.id} → ${p.igId}`);
  } catch (e) {
    // mark failed so the next run moves on instead of retrying the same broken item forever
    p.status = "failed";
    p.error = e.message;
    process.exitCode = 1;
    console.error(`Failed ${p.id}: ${e.message}`);
  }
  fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n");
  if (p.status === "failed" && process.env.GITHUB_TOKEN)
    await alert(`Post fail: \`${p.id}\`\n\n${p.error}\n\nInstagram chaabi expire hui ho to SETUP.md step B dobara karo.`).catch(() => {});
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
