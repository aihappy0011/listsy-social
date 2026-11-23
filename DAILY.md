# Daily run — Claude ka kaam (roz 11:00 IST)

Owner ka ChatGPT scheduled task **"ListsyAI Instagram Carousel"** roz 10:00 baje 6 ready slides (1080×1350 JPG, text ke saath) banata hai. Claude ka kaam: unhe uthao → caption → queue → push. Nayi slides khud mat banao.

Folder: `D:/Projects/ListsyAI-Social` (agent = `agent/`, git root). Rules: password/token kabhi nahi; HANDOFF/brain update nahi chahiye (roz ka routine).

## Steps
1. Browser pane (built-in browser) → `https://chatgpt.com/scheduled` → **ListsyAI Instagram Carousel** kholo. Login nahi hai to ruk jao aur report karo "ChatGPT login chahiye".
2. Sabse **neeche wala (aaj ka)** jawab dekho. Aaj ka jawab nahi hai / "paused" / slides nahi → report karo, kuch queue mat karo.
3. Download: aaj ke jawab mein "ZIP" wala link (`find` "ZIP") click karo. Na ho to har "Download file" button ek-ek karke.
   Files `D:/Downloads` mein aati hain (ZIP kabhi `.tmp` naam se — `file` command se check karo "Zip archive").
4. `agent-inbox/<YYYY-MM-DD>-<topic-slug>/` mein unzip, files ka naam `slide-1.jpg … slide-N.jpg` (ChatGPT ke order mein). `D:/Downloads` se apni download ki hui file hata do.
5. Review sheet bana ke **dekho** (Read tool): text kata/ulta, galat spelling, galat promise (sirf `../FEATURES-AUDIT.md` ke LIVE tools; trial 7 din). Kharab ho to queue mat karo, report karo.
6. `caption.txt` likho (Hinglish): hook line, 3–5 lines value, CTA "👉 listsyai.com — 7 din free", 8–12 hashtags.
7. Queue + push (aaj 19:00 IST; agar 19:00 nikal gaya to kal 10:00):
   ```
   cd agent
   node add.mjs ../agent-inbox/<folder> <YYYY-MM-DD>T19:00
   node post.mjs --dry-run
   git add -A && git commit -m "queue: <topic> (<date>)" && git pull --rebase && git push
   ```
   Push hote hi GitHub robot owner ko approval issue bhejta hai (phone pe GitHub app). Owner HAAN likhe → time pe post.
8. Ek line report: kya queue hua, kis time, ya kya fail hua.
