# Listsy Social Agent — Claude ke liye (cloud session)

Owner (Hinglish bolta hai, beginner, zyada mobile pe) ka Instagram **@listsyai** auto-post system. Ye repo = poora posting system. Owner laptop band hone par phone se Claude app → Code → is repo mein baat karta hai.

## Kaise chalta hai
1. Owner ka **ChatGPT scheduled task** ("ListsyAI Instagram Carousel") roz **raat 9 baje** kal ke liye 3 carousels banata hai (slides + caption).
2. Owner ke laptop pe Claude task **raat ~10:12** unhe uthata hai → `queue/<id>/` (1.jpg… + caption.txt + preview.jpg) + `queue.json` mein `pending` → push.
3. Push hote hi GitHub Actions (`.github/workflows/post.yml`) ek **approval issue** kholta hai (label `approval`, owner ko @mention).
4. Owner issue pe comment: **HAAN** (sab approve) · **NAHI 2** (#2 hatao) · **STOP** (approved roko) · **STATUS**. `gh.mjs inbox` padhta hai (sirf repo OWNER ka comment).
5. Robot (cron 09:00 / 17:00 / 21:00 IST + hourly backup) `post.mjs` se time aayi hui `approved` post Instagram pe daalta hai (Facebook Graph API, `IG_USER_ID` = 17841452464877076). `queue.json` mein `posted` + `igId`. Fail → `failed` + alert issue.

## queue.json item
`{ id, at: "2026-11-25T09:00:00+05:30", type: carousel|image|reel, files: ["1.jpg",…], status: pending|approved|posted|failed|rejected, issue?, igId?, error? }`

## Owner phone se kya maang sakta hai (cloud session mein karo)
- **Time badlo** → us item ka `at` badlo (IST `+05:30`). Slots: 09:00 / 17:00 / 21:00.
- **Post hatao** → `status: "rejected"`. **Roko** → approved ko `pending` karo.
- **Approve** → `status: "approved"` (sirf jab owner ne saaf "haan" bola ho).
- **Caption theek** → `queue/<id>/caption.txt` edit (sirf owner ke kehne par; warna ChatGPT ka caption as-is).
- **Status** → `queue.json` padh ke batao: kya gaya, kya line mein, kya fail.
- Fail retry → `status: "approved"`, `error` hatao.
Badlaav ke baad commit + push (main). Push = robot dobara chalega.

## Rules
- Slides/caption khud mat banao ya design mat badlo — owner ka order: "ChatGPT sara kaam karega".
- Instagram pe khud post mat karo; sirf `queue.json` se robot karta hai.
- Secrets (`IG_TOKEN`) kabhi mat padho/print karo; GitHub Settings → Secrets mein hain.
- Cloud session ChatGPT ya owner ke laptop (D: drive, `../agent-inbox`) tak nahi pahunch sakta — nayi posts sirf laptop wala task laata hai. Owner ko seedha bata do.
- Jawab Hinglish mein, chhota, simple.

## Files
`post.mjs` (poster) · `gh.mjs` (approval issue) · `add.mjs` (laptop pe queue mein daalna, `next` slot) · `DAILY.md` (laptop task steps) · `SETUP.md` · tests: `node --test`
