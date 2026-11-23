# Weekly run — Claude ka kaam (har Sunday)

Ye Claude ka prompt hai. Owner ko kuch nahi karna; owner sirf GitHub app mein approval issue pe HAAN likhta hai.

Kaam karne ki jagah: `D:/Projects/ListsyAI-Social` (agent = `agent/`). Pehle `../README.md`, `../FEATURES-AUDIT.md`, `../RESEARCH.md` padho.

## 1. Trend (20 min se zyada nahi)
- Pichhle 7 din: Meesho / Flipkart / Amazon seller news, naye rules, shipping/return/commission changes, sale season, seller ki shikayatein (Reddit, YouTube, X, news). `last30days` skill ya web search.
- 3–5 lines `agent/trends/<YYYY-MM-DD>.md` mein likho (source link ke saath).

## 2. Plan: agle Mon–Sun, roz 3 posts
- Roz: **2 carousel** (10:00 aur 14:00 IST) + **1 reel** (19:00 IST) = 21 posts.
- Har post ek trend ya seller problem → Listsy AI ka koi **LIVE** tool (sirf `FEATURES-AUDIT.md` mein LIVE wale). Same topic hafte mein 2 baar nahi; pichhle hafte ke `agent/queue/` topics repeat nahi.
- Mix: 40% seller tips (bina selling), 40% tool demo/problem→solution, 20% news/meme. Hard sell max 1/din.

## 3. Banao (pehle se bane engines hi use karo)
- Carousel: design v3 — `posts/<nn-slug>/build.mjs` (dekho `posts/08-label-cropper/build.mjs`, `design3.mjs`), 5–7 slides, bahut kam text, cover pe bada hook. `caption.txt`: hook line, 3–5 lines value, CTA "listsyai.com — 7 din free", 8–15 hashtags.
- Reel: `reels/<name>.mjs` → `node make-reel.mjs reels/<name>.mjs` (12–25 sec, Hindi voice edge_tts). Caption alag `.txt`.
- Har cheez ka review sheet khud dekho (Read tool se image); text kata/overlap/spelling galat ho to theek karo.

## 4. Queue mein daalo (sab "pending")
```
cd agent
node add.mjs ../posts/<nn-slug> 2026-MM-DDT10:00
node add.mjs ../reels/out/<name>.mp4 2026-MM-DDT19:00 ../reels/<name>.txt
node post.mjs --dry-run      # koi problem to theek karo
```

## 5. Upload
```
git add -A && git commit -m "week <date>" && git push
```
Push hote hi GitHub robot ek "approval" issue kholta hai (previews + captions, owner ko notification). Owner HAAN likhta hai → robot time pe post karta hai.

## Rules
- Password/token kabhi mat padho/likho/print karo.
- Jo tool LIVE nahi, uska promise nahi. Trial = 7 din.
- Kuch fail ho (build, push) to `agent/trends/<date>.md` mein likho; owner agle session mein dekhega.
