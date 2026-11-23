// GitHub Issue = owner's approval inbox (owner replies from the GitHub phone app).
//   node gh.mjs review         -> opens one "approval" issue with every new pending post (preview + caption)
//   node gh.mjs inbox          -> reads owner's comments: HAAN / NAHI 2 / STOP / STATUS, replies, closes when done
//   node gh.mjs alert "<text>" -> opens an alert issue (e.g. a post failed)
// Env (GitHub Actions provides): GITHUB_TOKEN, GITHUB_REPOSITORY; MEDIA_BASE = public Pages URL of this repo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(HERE, "queue.json");
const load = () => JSON.parse(fs.readFileSync(QUEUE, "utf8"));
const save = (q) => fs.writeFileSync(QUEUE, JSON.stringify(q, null, 2) + "\n");
const ist = (at) => new Date(at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const LABEL = "approval";

async function gh(route, body, method = body ? "POST" : "GET") {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${route}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`github ${method} ${route}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const byTime = (a, b) => Date.parse(a.at) - Date.parse(b.at);

// Pure reply handling (tested): mutates queue, returns the bot's answer. Numbers are per approval issue.
export function applyReply(q, text, issue) {
  const t = text.trim().toLowerCase();
  const pend = q.filter((p) => p.status === "pending" && p.issue === issue).sort(byTime);
  if (/^(haan|han|ha|yes|ok|approve)\b/.test(t)) {
    pend.forEach((p) => (p.status = "approved"));
    return `✅ ${pend.length} posts approved. Ab ye apne time pe khud post hongi.`;
  }
  const no = t.match(/^(nahi|no)\s+(\d+)/);
  if (no) {
    const all = q.filter((p) => p.issue === issue).sort(byTime);
    const p = all[Number(no[2]) - 1];
    if (!p || p.status !== "pending") return `#${no[2]} naam ki koi pending post nahi hai.`;
    p.status = "rejected";
    return `❌ #${no[2]} hata di. Baaki ke liye HAAN likho.`;
  }
  if (/^stop\b/.test(t)) {
    const live = q.filter((p) => p.status === "approved");
    live.forEach((p) => { p.status = "pending"; delete p.issue; }); // goes back to the next review
    return `⏸ ${live.length} posts rok di. Agle review mein dobara poochunga.`;
  }
  if (/^(status|list)\b/.test(t)) {
    const c = (s) => q.filter((p) => p.status === s).length;
    return `📊 Line mein: ${c("approved")} · Approval baaki: ${c("pending")} · Ho gayi: ${c("posted")} · Fail: ${c("failed")}`;
  }
  return "Samjha nahi 🙂 Likho: **HAAN** (sab approve) · **NAHI 2** (#2 hatao) · **STOP** (sab roko) · **STATUS**";
}

async function review() {
  const q = load();
  const fresh = q.filter((p) => p.status === "pending" && !p.issue).sort(byTime);
  if (!fresh.length) return console.log("No new posts to review.");
  const open = await gh(`/issues?state=open&labels=${LABEL}`);
  if (open.length) return console.log(`Approval issue #${open[0].number} still open — waiting.`);
  if (!process.env.MEDIA_BASE) throw new Error("MEDIA_BASE variable not set"); // else previews break
  const base = process.env.MEDIA_BASE.replace(/\/$/, "");
  const owner = process.env.GITHUB_REPOSITORY.split("/")[0];
  const parts = fresh.map((p, i) => {
    const dir = `${base}/queue/${p.id}`;
    const caption = fs.readFileSync(path.join(HERE, "queue", p.id, "caption.txt"), "utf8").trim();
    const media = p.type === "reel" ? `🎬 [Reel dekho](${dir}/${p.files[0]})` : `<img src="${dir}/preview.jpg" width="600">`;
    return `### Post ${i + 1} · ${p.type} · ${ist(p.at)}\n${media}\n<details><summary>Caption</summary>\n\n${caption}\n</details>`;
  });
  const body = `@${owner} ${fresh.length} nayi posts ready hain 👇\n\n${parts.join("\n\n---\n\n")}\n\n---\n` +
    "Sab theek hai to comment mein **HAAN** likho ✅\nKoi hatani ho to: **NAHI 2**\nBaad mein rokna ho to: **STOP**";
  const issue = await gh("/issues", { title: `📝 ${fresh.length} posts approval ke liye (${ist(fresh[0].at)} se)`, body, labels: [LABEL] });
  fresh.forEach((p) => (p.issue = issue.number));
  save(q);
  console.log(`Opened approval issue #${issue.number}`);
}

async function inbox() {
  const q = load();
  for (const issue of await gh(`/issues?state=open&labels=${LABEL}`)) {
    const comments = await gh(`/issues/${issue.number}/comments?per_page=100`);
    const lastBot = comments.findLastIndex((c) => c.user.type === "Bot");
    for (const c of comments.slice(lastBot + 1)) {
      if (c.author_association !== "OWNER") continue; // only the repo owner can approve
      await gh(`/issues/${issue.number}/comments`, { body: applyReply(q, c.body, issue.number) });
    }
    if (!q.some((p) => p.issue === issue.number && p.status === "pending")) await gh(`/issues/${issue.number}`, { state: "closed" }, "PATCH");
  }
  save(q);
}

export const alert = (text) => gh("/issues", { title: "⚠️ Listsy Agent: kuch fail hua", body: `@${process.env.GITHUB_REPOSITORY.split("/")[0]} ${text}` });

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cmd = process.argv[2];
  if (cmd === "review") await review();
  else if (cmd === "inbox") await inbox();
  else if (cmd === "alert") await alert(process.argv[3]);
  else console.log("usage: node gh.mjs review|inbox|alert <text>");
}
