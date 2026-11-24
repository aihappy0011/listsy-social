# Daily run — Claude ka kaam (roz 11:00 IST)

Owner ka ChatGPT scheduled task **"ListsyAI Instagram Carousel"** roz ~10:00 baje sab kuch banata hai: 6 slides (1080×1350 JPG), caption, hashtags, posting time.
**Claude kuch nahi banata** — na slides, na caption, na prompt. Sirf uthao → queue → push. (Owner: "tum apni style mein mat karo, ChatGPT sara kaam karega, tumhe bas nikalna hai, post karna hai.")

Folder: `D:/Projects/ListsyAI-Social` (agent = `agent/`, git root). Password/token kabhi nahi.

## Steps
1. Browser pane (built-in browser) → `https://chatgpt.com/scheduled` → **ListsyAI Instagram Carousel**. Login nahi → ruk jao, report "ChatGPT login chahiye".
2. Sabse **neeche wala jawab** = aaj ka. `agent/queue/` mein uska topic pehle se hai, ya jawab "paused"/slides nahi → report karo, kuch mat karo.
3. ZIP download: `find` "ZIP" → aaj ke jawab wala link click. File `D:/Downloads` mein `.tmp` naam se aati hai aur **browser use thodi der mein mita deta hai** → click ke turant baad newest file (`file` = "Zip archive") ko `agent-inbox/` mein copy karo, phir Downloads wali hata do.
4. `agent-inbox/<YYYY-MM-DD>-<topic-slug>/` mein unzip, files `slide-1.jpg … slide-6.jpg` (ChatGPT ke order mein).
5. `caption.txt` = ChatGPT ke jawab ka **"Caption"** section, word-for-word (page text se copy; "Writing"/"Caption — ..." heading mat lo). Apni taraf se kuch mat jodo.
6. Sirf toota hua check: slides khulti hain, 2–10 hain, 1080 wide. Design/text pe apni raay mat do.
7. Queue + push (agla khaali slot apne aap: 9:00 / 17:00 / 21:00 IST):
   ```
   cd agent
   node add.mjs ../agent-inbox/<folder> next
   node post.mjs --dry-run
   git add -A && git commit -m "queue: <topic> (<date>)" && git pull --rebase && git push
   ```
   Push → GitHub robot owner ko approval issue bhejta hai (GitHub app). Owner HAAN → time pe Instagram post.
8. Ek line report: kya queue hua, kis din kis slot pe, ya kya atka.
